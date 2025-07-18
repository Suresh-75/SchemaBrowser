import os
import oracledb
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, Response
import pandas as pd
from ydata_profiling import ProfileReport
import tempfile
import json
from datetime import datetime, timedelta
import time
import logging
import hashlib
import sys
output_dir = tempfile.mkdtemp()

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


# --- Database Configuration ---
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = int(os.environ.get('DB_PORT', '1521'))  # Convert to integer
DB_SERVICE = os.environ.get('DB_SERVICE')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')


# --- Database Connection ---

def get_db_connection():
    try:
        # Create connection string (TNS style)
        dsn = f"{DB_HOST}:{DB_PORT}/{DB_SERVICE}"
        
        # Create the connection
        return oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=dsn
        )
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    db_conn = get_db_connection()
    if not db_conn:
        return {'error': 'Database connection failed', 'status': 500}
    
    try:
        with db_conn.cursor() as cur:
            cur.execute(query, params or [])
            if fetch_one:
                return cur.fetchone()
            if fetch_all:
                return cur.fetchall()
            db_conn.commit()
            return None
    except oracledb.Error as e:  # Changed from cx_Oracle.Error
        db_conn.rollback()
        logger.error(f"Query execution failed: {e}")
        return {'error': str(e), 'status': 400}
    finally:
        db_conn.close()

class AutoProfiler:
    def __init__(self):
        self.setup_profiling_tables()
        
    def setup_profiling_tables(self):
        """Create tables to store profiling results and table metadata"""
        db_conn = get_db_connection()
        if not db_conn:
            return
            
        try:
            with db_conn.cursor() as cur:
                # Table to store profiling results
                create_profiling_table = """
                CREATE TABLE IF NOT EXISTS ydata_profiling_results (
                    id SERIAL PRIMARY KEY,
                    schema_name VARCHAR(255) NOT NULL,
                    table_name VARCHAR(255) NOT NULL,
                    profiling_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    profile_html TEXT,
                    profile_json TEXT,
                    row_count INTEGER,
                    column_count INTEGER,
                    data_hash VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(schema_name, table_name, profiling_date)
                );
                """
                
                # Table to track which tables to profile
                create_tracking_table = """
                CREATE TABLE IF NOT EXISTS profiling_table_registry (
                    id SERIAL PRIMARY KEY,
                    schema_name VARCHAR(255) NOT NULL,
                    table_name VARCHAR(255) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_profiled TIMESTAMP,
                    profiling_frequency_days INTEGER DEFAULT 7,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(schema_name, table_name)
                );
                """
                
                cur.execute(create_profiling_table)
                cur.execute(create_tracking_table)
                db_conn.commit()
                logger.info("Profiling tables created successfully")
                
        except Exception as e:
            logger.error(f"Error creating profiling tables: {e}")
            db_conn.rollback()
        finally:
            db_conn.close()
    
    def discover_tables(self):
        """Discover all tables in the database and add them to registry"""
        db_conn = get_db_connection()
        if not db_conn:
            return []
            
        try:
            with db_conn.cursor() as cur:
                # Get all user tables (excluding system tables)
                query = """
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_type = 'BASE TABLE' 
                AND table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                ORDER BY table_schema, table_name;
                """
                
                cur.execute(query)
                tables = cur.fetchall()
                
                # Add discovered tables to registry if not already present
                for schema, table in tables:
                    insert_query = """
                    INSERT INTO profiling_table_registry (schema_name, table_name)
                    VALUES (%s, %s)
                    ON CONFLICT (schema_name, table_name) DO NOTHING;
                    """
                    cur.execute(insert_query, (schema, table))
                
                db_conn.commit()
                logger.info(f"Discovered and registered {len(tables)} tables")
                return tables
                
        except Exception as e:
            logger.error(f"Error discovering tables: {e}")
            return []
        finally:
            db_conn.close()
    
    def get_tables_to_profile(self):
        """Get tables that need profiling based on schedule"""
        db_conn = get_db_connection()
        if not db_conn:
            return []
            
        try:
            with db_conn.cursor() as cur:
                query = """
                SELECT schema_name, table_name, profiling_frequency_days
                FROM profiling_table_registry
                WHERE is_active = TRUE
                AND (
                    last_profiled IS NULL 
                    OR last_profiled < NOW() - INTERVAL '1 day' * profiling_frequency_days
                );
                """
                
                cur.execute(query)
                return cur.fetchall()
                
        except Exception as e:
            logger.error(f"Error getting tables to profile: {e}")
            return []
        finally:
            db_conn.close()
    
    def generate_data_hash(self, df):
        """Generate a hash of the data for change detection"""
        try:
            # Create a hash based on shape, dtypes, and sample of data
            shape_str = str(df.shape)
            dtypes_str = df.dtypes.to_string()
            
            # Use a sample of the data to create hash (first 100 rows)
            sample_data = df.head(100).to_string()
            
            # Combine all info
            data_info = f"{shape_str}_{dtypes_str}_{sample_data}"
            
            # Use SHA256 for consistent hashing
            return hashlib.sha256(data_info.encode()).hexdigest()[:32]
        except Exception as e:
            logger.warning(f"Error generating data hash: {e}")
            return str(hash(str(df.shape)))
    
    def profile_table(self, schema, table):
        """Profile a specific table and store results"""
        db_conn = get_db_connection()
        if not db_conn:
            return False
            
        try:
            logger.info(f"Starting profiling for {schema}.{table}")
            
            # Fetch data from table
            query = f'SELECT * FROM "{schema}"."{table}"'
            df = pd.read_sql(query, con=db_conn)
            
            if df.empty:
                logger.warning(f"Table {schema}.{table} is empty")
                return False
            
            # Generate data hash
            data_hash = self.generate_data_hash(df)
            
            # Check if we already have recent profiling with same hash
            with db_conn.cursor() as cur:
                check_query = """
                SELECT id FROM ydata_profiling_results 
                WHERE schema_name = %s AND table_name = %s 
                AND data_hash = %s AND profiling_date > NOW() - INTERVAL '1 day'
                """
                cur.execute(check_query, (schema, table, data_hash))
                
                if cur.fetchone():
                    logger.info(f"Data unchanged for {schema}.{table}, skipping profiling")
                    return True
                
                # Generate profile
                profile = ProfileReport(
                    df, 
                    title=f"YData Profile - {schema}.{table}",
                    explorative=True,
                    minimal=False
                )
                
                profile_html = profile.to_html()
                profile_json = json.dumps(profile.to_json())
                
                # Store results
                insert_query = """
                INSERT INTO ydata_profiling_results 
                (schema_name, table_name, profile_html, profile_json, row_count, column_count, data_hash)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                cur.execute(insert_query, (
                    schema, table, profile_html, profile_json,
                    len(df), len(df.columns), data_hash
                ))
                
                # Update last profiled timestamp
                update_query = """
                UPDATE profiling_table_registry 
                SET last_profiled = CURRENT_TIMESTAMP
                WHERE schema_name = %s AND table_name = %s
                """
                cur.execute(update_query, (schema, table))
                
                db_conn.commit()
                logger.info(f"Profiling completed for {schema}.{table}")
                return True
                
        except Exception as e:
            logger.error(f"Error profiling table {schema}.{table}: {e}")
            db_conn.rollback()
            return False
        finally:
            db_conn.close()
    
    def run_scheduled_profiling(self):
        """Run profiling for all tables that need it"""
        logger.info("Starting scheduled profiling job")
        
        # Discover new tables
        self.discover_tables()
        
        # Get tables that need profiling
        tables_to_profile = self.get_tables_to_profile()
        
        if not tables_to_profile:
            logger.info("No tables need profiling at this time")
            return
        
        logger.info(f"Found {len(tables_to_profile)} tables to profile")
        
        # Profile each table
        for schema, table, frequency in tables_to_profile:
            try:
                self.profile_table(schema, table)
                # Add small delay between tables to avoid overwhelming the database
                time.sleep(2)
            except Exception as e:
                logger.error(f"Failed to profile {schema}.{table}: {e}")
                continue
        
        logger.info("Scheduled profiling job completed")

# Initialize auto profiler
auto_profiler = AutoProfiler()

@app.route("/api/profile", methods=["POST"])
def profile_table():
    """Get profiling results from database (cached) or generate new if not available"""
    try:
        # Handle different content types
        if request.is_json:
            data = request.get_json()
        elif request.content_type == 'application/x-www-form-urlencoded':
            data = request.form.to_dict()
        else:
            # Try to get JSON regardless of content type
            try:
                data = request.get_json(force=True)
            except:
                return jsonify({"error": "Invalid request format. Expected JSON data with 'schema' and 'table' fields."}), 400
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        schema = data.get("schema")
        table = data.get("table")
        
        if not schema or not table:
            return jsonify({"error": "Both 'schema' and 'table' parameters are required"}), 400
        
        # First try to get cached results
        db_conn = get_db_connection()
        if db_conn:
            try:
                with db_conn.cursor() as cur:
                    # Get latest profiling result
                    query = """
                    SELECT profile_html, profiling_date, row_count, column_count
                    FROM ydata_profiling_results
                    WHERE schema_name = %s AND table_name = %s
                    ORDER BY profiling_date DESC
                    LIMIT 1
                    """
                    
                    cur.execute(query, (schema, table))
                    result = cur.fetchone()
                    
                    if result:
                        profile_html, profiling_date, row_count, column_count = result
                        
                        # Add metadata header to HTML
                        metadata_header = f"""
                        <div style="background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
                            <h3 style="margin: 0 0 10px 0;">Cached Profiling Report</h3>
                            <p style="margin: 0;"><strong>Table:</strong> {schema}.{table}</p>
                            <p style="margin: 0;"><strong>Generated:</strong> {profiling_date}</p>
                            <p style="margin: 0;"><strong>Rows:</strong> {row_count:,} | <strong>Columns:</strong> {column_count}</p>
                        </div>
                        """
                        
                        # Insert metadata at the beginning of the HTML body
                        if '<body>' in profile_html:
                            profile_html = profile_html.replace('<body>', f'<body>{metadata_header}')
                        else:
                            profile_html = metadata_header + profile_html
                        
                        return Response(profile_html, mimetype='text/html')
            finally:
                db_conn.close()
        
        # If no cached result, generate new profile
        logger.info(f"No cached profile found for {schema}.{table}, generating new one")
        
        db_conn = get_db_connection()
        if not db_conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            query = f'SELECT * FROM "{schema}"."{table}"'
            df = pd.read_sql(query, con=db_conn)

            if df.empty:
                return jsonify({"error": "Table is empty"}), 400

            profile = ProfileReport(df, title=f"YData Profile - {schema}.{table}", explorative=True)
            
            # Get HTML content directly
            html_content = profile.to_html()
            
            # Add real-time generation notice
            realtime_header = f"""
            <div style="background: #fff3cd; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
                <h3 style="margin: 0 0 10px 0;">Real-time Profiling Report</h3>
                <p style="margin: 0;"><strong>Table:</strong> {schema}.{table}</p>
                <p style="margin: 0;"><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p style="margin: 0;"><strong>Note:</strong> This is a real-time generated report. Cached version will be available after next scheduled profiling.</p>
            </div>
            """
            
            if '<body>' in html_content:
                html_content = html_content.replace('<body>', f'<body>{realtime_header}')
            else:
                html_content = realtime_header + html_content
            
            return Response(html_content, mimetype='text/html')
            
        finally:
            db_conn.close()

    except Exception as e:
        logger.error(f"Error in profile_table: {e}")
        return jsonify({"error": str(e)}), 500
    
# ------------------- 1. Create LOB -------------------
@app.route("/api/lobs", methods=["POST"])
def create_lob():
    data = request.json
    name = data.get("name")

    if not name:
        return jsonify({"error": "LOB name is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check for existing LOB
        cursor.execute(
            "SELECT id FROM lobs WHERE name = :1",
            [name]
        )
        if cursor.fetchone():
            return jsonify({"error": "LOB with this name already exists"}), 409

        # Insert new LOB
        cursor.execute("""
            INSERT INTO lobs (name, created_at) 
            VALUES (:1, SYSTIMESTAMP)
            RETURNING id INTO :2
        """, [name, cursor.var(oracledb.NUMBER)])
        
        lob_id = cursor.var.getvalue()
        conn.commit()
        return jsonify({"message": "LOB created", "id": lob_id}), 201

    except oracledb.IntegrityError:
        conn.rollback()
        return jsonify({"error": "Database constraint failed: LOB name must be unique"}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ------------------- 2. Create Subject Area -------------------
@app.route("/api/subject-areas", methods=["POST"])
def create_subject_area():
    data = request.json
    name = data["name"]
    lob_name = data["lob_name"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Find LOB ID
        cursor.execute(
            "SELECT id FROM lobs WHERE name = :1",
            [lob_name]
        )
        lob_result = cursor.fetchone()
        if not lob_result:
            return jsonify({"message": "LOB not found"}), 404

        lob_id = lob_result[0]

        # Check for existing subject area
        cursor.execute(
            "SELECT id FROM subject_areas WHERE name = :1 AND lob_id = :2",
            [name, lob_id]
        )
        if cursor.fetchone():
            return jsonify({"message": "Subject Area already exists under this LOB."}), 400

        # Insert new subject area
        cursor.execute("""
            INSERT INTO subject_areas (name, lob_id, created_at) 
            VALUES (:1, :2, SYSTIMESTAMP)
            RETURNING id INTO :3
        """, [name, lob_id, cursor.var(oracledb.NUMBER)])
        
        subject_id = cursor.var.getvalue()
        conn.commit()
        
        return jsonify({
            "message": "Subject Area created", 
            "id": subject_id
        }), 201

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route("/api/logical-databases", methods=["POST"])
def create_logical_db():
    """Create a new logical database and associate it with a subject area"""
    conn = None
    cursor = None
    try:
        data = request.json
        lob_name = data["lob_name"]
        subject_name = data["subject_name"]
        db_name = data["name"]

        conn = get_db_connection()
        cursor = conn.cursor()

        # Get subject_area_id from lob_name + subject_name
        cursor.execute("""
            SELECT sa.id 
            FROM subject_areas sa
            JOIN lobs l ON sa.lob_id = l.id
            WHERE sa.name = :1 AND l.name = :2
        """, [subject_name, lob_name])
        
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Subject Area not found for given LOB"}), 404
        
        subject_area_id = result[0]

        # Insert new logical database with RETURNING clause
        db_id_var = cursor.var(oracledb.NUMBER)
        cursor.execute("""
            INSERT INTO logical_databases (name, created_at) 
            VALUES (:1, SYSTIMESTAMP)
            RETURNING id INTO :2
        """, [db_name, db_id_var])
        
        new_db_id = db_id_var.getvalue()

        # Create mapping in subject_area_logical_database
        cursor.execute("""
            INSERT INTO subject_area_logical_database 
            (subject_area_id, logical_database_id, created_at) 
            VALUES (:1, :2, SYSTIMESTAMP)
        """, [subject_area_id, new_db_id])

        conn.commit()

        # Return same format as before
        return jsonify({
            "message": "Logical DB created", 
            "id": new_db_id
        }), 201

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            "error": f"Database constraint violated: {str(e)}"
        }), 409
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error creating logical database: {e}")
        return jsonify({
            "error": f"Failed to create Logical DB: {str(e)}"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route('/api/logical-databases/<string:database_name>', methods=['GET'])
def get_database_by_name(database_name):
    """Get logical database details by name."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                db.id, 
                db.name, 
                l.name AS lob_name, 
                sa.name AS subject_area_name
            FROM logical_databases db
            JOIN subject_area_logical_database sald ON db.id = sald.logical_database_id
            JOIN subject_areas sa ON sald.subject_area_id = sa.id
            JOIN lobs l ON sa.lob_id = l.id
            WHERE UPPER(db.name) = UPPER(:1)
        """, [database_name])
        
        row = cursor.fetchone()
        if row:
            return jsonify({
                "id": row[0],
                "name": row[1],
                "lob_name": row[2],
                "subject_area_name": row[3]
            }), 200
        else:
            return jsonify({
                "error": f"Database '{database_name}' not found"
            }), 404
            
    except oracledb.Error as e:
        logger.error(f"Database error in get_database_by_name: {e}")
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_database_by_name: {e}")
        return jsonify({
            "error": str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ------------------- 4. Create Table -------------------
@app.route("/api/tables", methods=["GET"])
def get_tables():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.id, t.name, t.schema_name, d.name AS database_name
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            ORDER BY t.id
        """)
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        tables = [dict(zip(columns, row)) for row in rows]
        return jsonify(tables)
    except oracledb.Error as e:
        logger.error(f"Database error in get_tables: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_tables: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route("/api/tables/<string:database_name>", methods=["GET"])
def get_tables_inDB(database_name):
    """Get all tables for a specific database"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT t.id, t.name, t.schema_name, d.name AS database_name
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            WHERE d.name = :1
            ORDER BY t.id
        """, [database_name])
        
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        tables = [dict(zip(columns, row)) for row in rows]
        
        return jsonify(tables)
        
    except oracledb.Error as e:
        logger.error(f"Database error getting tables for {database_name}: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting tables for {database_name}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_lob_id_by_name(conn, lob_name):
    """Get LOB ID by name"""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id FROM lobs WHERE name = :1",
            [lob_name]
        )
        result = cursor.fetchone()
        return result[0] if result else None
    except oracledb.Error as e:
        logger.error(f"Error getting LOB ID for {lob_name}: {e}")
        return None
    finally:
        cursor.close()

def get_or_create_er_entity(conn, er_diagram_name, lob_id):
    """Get existing ER entity or create a new one"""
    cursor = conn.cursor()
    try:
        # Check if entity already exists
        cursor.execute("""
            SELECT id FROM er_entities 
            WHERE name = :1 AND lob_id = :2
        """, [er_diagram_name, lob_id])
            
        result = cursor.fetchone()
        if result:
            return result[0]
            
        # Create new entity with both created_at and updated_at
        entity_id_var = cursor.var(oracledb.NUMBER)
        cursor.execute("""
            INSERT INTO er_entities 
            (name, lob_id, created_at, updated_at) 
            VALUES (:1, :2, SYSTIMESTAMP, SYSTIMESTAMP)
            RETURNING id INTO :3
        """, [er_diagram_name, lob_id, entity_id_var])
        
        entity_id = entity_id_var.getvalue()
        conn.commit()
        return entity_id
            
    except oracledb.Error as e:
        logger.error(f"Error in get_or_create_er_entity: {e}")
        raise
    finally:
        cursor.close()


@app.route("/api/delete_er_diagram/<int:entityId>", methods=['DELETE'])
def deleteERdiagram(entityId):
    """Deletes an ER Diagram entity and its relationships."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete relationships first
        cursor.execute("""
            DELETE FROM er_relationships 
            WHERE er_entity_id = :1
        """, [entityId])
        relationships_deleted = cursor.rowcount
        logger.info(f"Deleted {relationships_deleted} relationships for ER diagram {entityId}")
        
        # Delete the entity
        cursor.execute("""
            DELETE FROM er_entities 
            WHERE id = :1
        """, [entityId])
        entity_deleted = cursor.rowcount
        
        if entity_deleted > 0:
            conn.commit()
            logger.info(f"Successfully deleted ER diagram {entityId}")
            return jsonify({
                "message": f"ER Diagram with ID {entityId} deleted successfully.",
                "relationships_deleted": relationships_deleted
            }), 200
        else:
            logger.warning(f"ER diagram {entityId} not found")
            return jsonify({
                "message": f"ER Diagram with ID {entityId} not found or already deleted."
            }), 404

    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error deleting ER Diagram {entityId}: {e}")
        return jsonify({
            "error": "Database error occurred during deletion."
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error deleting ER Diagram {entityId}: {e}")
        return jsonify({
            "error": "An internal server error occurred during deletion."
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/create_er_diagram', methods=['POST'])
def create_er_relationship():
    """Create a new ER diagram relationship"""
    conn = None
    cursor = None
    
    try:
        # Get JSON data from request
        data = request.get_json()
        logger.info(f"Creating ER relationship with data: {data}")
        
        # Validate required fields
        required_fields = ['erDiagramName', 'lob', 'fromTableId', 'fromColumn', 
                          'toTableId', 'toColumn', 'cardinality', 'relationshipType']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        er_diagram_name = data['erDiagramName']
        lob_name = data['lob']
        from_table_id = data['fromTableId']
        from_column = data['fromColumn']
        to_table_id = data['toTableId']
        to_column = data['toColumn']
        cardinality = data['cardinality']
        relationship_type = data['relationshipType']
        
        # Get database connection
        conn = get_db_connection() 
        cursor = conn.cursor()
        
        # Get LOB ID
        lob_id = get_lob_id_by_name(conn, lob_name)
        if not lob_id:
            return jsonify({
                'success': False,
                'error': f'LOB not found: {lob_name}'
            }), 400
        
        # Get or create ER entity
        er_entity_id = get_or_create_er_entity(conn, er_diagram_name, lob_id)
        logger.info(f"ER Entity ID: {er_entity_id}")
        
        # Check if relationship already exists
        cursor.execute("""
            SELECT id FROM er_relationships 
            WHERE from_table_id = :1 AND from_column = :2
            AND to_table_id = :3 AND to_column = :4 
            AND er_entity_id = :5
        """, [from_table_id, from_column, to_table_id, to_column, er_entity_id])
            
        existing_relationship = cursor.fetchone()
        if existing_relationship:
            return jsonify({
                'success': False,
                'error': 'Relationship already exists between these tables and columns'
            }), 409
        
        # Create the relationship
        created_at_var = cursor.var(oracledb.TIMESTAMP)
        relationship_id_var = cursor.var(oracledb.NUMBER)
        
        cursor.execute("""
            INSERT INTO er_relationships 
            (from_table_id, from_column, to_table_id, to_column, 
            cardinality, relationship_type, created_at, er_entity_id)
            VALUES (:1, :2, :3, :4, :5, :6, SYSTIMESTAMP, :7)
            RETURNING id, created_at INTO :8, :9
        """, [
            from_table_id,
            from_column,
            to_table_id,
            to_column,
            cardinality,
            relationship_type,
            er_entity_id,
            relationship_id_var,
            created_at_var
        ])
            
        relationship_id = relationship_id_var.getvalue()
        created_at = created_at_var.getvalue()
        
        # Commit transaction
        conn.commit()
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'ER relationship created successfully',
            'data': {
                'id': relationship_id,
                'er_entity_id': er_entity_id,
                'er_diagram_name': er_diagram_name,
                'from_table_id': from_table_id,
                'from_column': from_column,
                'to_table_id': to_table_id,
                'to_column': to_column,
                'cardinality': cardinality,
                'relationship_type': relationship_type,
                'created_at': created_at.isoformat() if created_at else None
            }
        }), 201
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database integrity constraint violated'
        }), 409
        
    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route("/api/createER", methods=["POST"])
def createER():
    """Create a new ER relationship with existing entity ID"""
    conn = None
    cursor = None
    
    try:
        data = request.get_json()
        logger.info(f"Creating ER relationship with data: {data}")
        
        # Validate required fields
        required_fields = ['er_entity_id', 'lob', 'fromTableId', 'fromColumn', 
                          'toTableId', 'toColumn', 'cardinality', 'relationshipType']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        er_entity_id = data['er_entity_id']
        lob_name = data['lob']
        from_table_id = data['fromTableId']
        from_column = data['fromColumn']
        to_table_id = data['toTableId']
        to_column = data['toColumn']
        cardinality = data['cardinality']
        relationship_type = data['relationshipType']
        
        # Get database connection
        conn = get_db_connection() 
        cursor = conn.cursor()
        
        # Check if relationship already exists
        cursor.execute("""
            SELECT id FROM er_relationships 
            WHERE from_table_id = :1 AND from_column = :2
            AND to_table_id = :3 AND to_column = :4 
            AND er_entity_id = :5
        """, [from_table_id, from_column, to_table_id, to_column, er_entity_id])
        
        existing_relationship = cursor.fetchone()
        if existing_relationship:
            return jsonify({
                'success': False,
                'error': 'Relationship already exists between these tables and columns'
            }), 409
        
        # Create the relationship
        relationship_id_var = cursor.var(oracledb.NUMBER)
        created_at_var = cursor.var(oracledb.TIMESTAMP)
        
        cursor.execute("""
            INSERT INTO er_relationships 
            (from_table_id, from_column, to_table_id, to_column, 
            cardinality, relationship_type, created_at, er_entity_id)
            VALUES (:1, :2, :3, :4, :5, :6, SYSTIMESTAMP, :7)
            RETURNING id, created_at INTO :8, :9
        """, [
            from_table_id,
            from_column,
            to_table_id,
            to_column,
            cardinality,
            relationship_type,
            er_entity_id,
            relationship_id_var,
            created_at_var
        ])
        
        relationship_id = relationship_id_var.getvalue()
        created_at = created_at_var.getvalue()
        
        # Commit transaction
        conn.commit()
        logger.info(f"Created ER relationship with ID: {relationship_id}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'ER relationship created successfully',
            'data': {
                'id': relationship_id,
                'er_entity_id': er_entity_id,
                'from_table_id': from_table_id,
                'from_column': from_column,
                'to_table_id': to_table_id,
                'to_column': to_column,
                'cardinality': cardinality,
                'relationship_type': relationship_type,
                'created_at': created_at.isoformat() if created_at else None
            }
        }), 201
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database integrity constraint violated'
        }), 409
        
    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
# get er entities
@app.route('/api/get_er_entities/<string:lob_name>', methods=["GET"])
def getERentity(lob_name):
    """Get all ER entities for a specific LOB"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to get ER entities for a specific LOB
        cursor.execute("""
            SELECT 
                ee.id,
                ee.name,
                ee.created_at,
                ee.updated_at,
                l.name as lob_name,
                COUNT(er.id) as relationship_count
            FROM er_entities ee
            JOIN lobs l ON ee.lob_id = l.id
            LEFT JOIN er_relationships er ON ee.id = er.er_entity_id
            WHERE UPPER(l.name) = UPPER(:1)
            GROUP BY ee.id, ee.name, ee.created_at, ee.updated_at, l.name
            ORDER BY ee.name
        """, [lob_name])
        
        results = cursor.fetchall()
        
        # Check if LOB exists if no results found
        if not results:
            cursor.execute("""
                SELECT id FROM lobs 
                WHERE UPPER(name) = UPPER(:1)
            """, [lob_name])
            
            lob_exists = cursor.fetchone()
            
            if not lob_exists:
                return jsonify({
                    "success": False,
                    "error": f"LOB '{lob_name}' not found",
                    "data": []
                }), 404
            else:
                return jsonify({
                    "success": True,
                    "message": f"No ER entities found for LOB '{lob_name}'",
                    "data": []
                }), 200
        
        # Format results
        er_entities = []
        for row in results:
            er_entities.append({
                "id": row[0],
                "name": row[1],
                "created_at": row[2].isoformat() if row[2] else None,
                "updated_at": row[3].isoformat() if row[3] else None,
                "lob_name": row[4],
                "relationship_count": row[5]
            })
        
        return jsonify({
            "success": True,
            "lob_name": lob_name,
            "total_entities": len(er_entities),
            "data": er_entities
        }), 200
        
    except oracledb.Error as e:
        logger.error(f"Database error in getERentity: {e}")
        return jsonify({
            "success": False,
            "error": f"Database error: {str(e)}",
            "data": []
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error in getERentity: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "data": []
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route("/api/addTM", methods=["POST"])
def add_table():
    """Add a table to the metadata repository"""
    conn = None
    cursor = None
    try:
        data = request.json
        table_name = data['table_name']
        schema_name = data['schema_name']

        conn = get_db_connection()
        cursor = conn.cursor()

        # Get database_id from logical_databases
        cursor.execute("""
            SELECT id FROM logical_databases 
            WHERE name = :1
        """, [schema_name])
        
        result = cursor.fetchone()
        if not result:
            return jsonify({
                "error": f"No database found for schema '{schema_name}'"
            }), 404
            
        database_id = result[0]

        # Insert metadata with RETURNING clause
        table_id_var = cursor.var(oracledb.NUMBER)
        cursor.execute("""
            INSERT INTO tables_metadata 
            (name, schema_name, database_id, created_at) 
            VALUES (:1, :2, :3, SYSTIMESTAMP)
            RETURNING id INTO :4
        """, [table_name, schema_name, database_id, table_id_var])

        table_id = table_id_var.getvalue()
        conn.commit()

        return jsonify({
            "message": f"Table {table_name} imported successfully.",
            "id": table_id
        }), 201

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            "error": f"Database constraint violated: {str(e)}"
        }), 409
    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            "error": str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route("/api/tables", methods=["POST"])
def create_table():
    """Create a new table and register it in metadata"""
    conn = None
    cursor = None
    try:
        data = request.json
        table_name = data['table_name']
        columns = data['columns']
        schema_name = data['schema_name']

        conn = get_db_connection()
        cursor = conn.cursor()

        # Get database_id from logical_databases
        cursor.execute("""
            SELECT id FROM logical_databases 
            WHERE name = :1
        """, [schema_name])
        
        result = cursor.fetchone()
        if not result:
            return jsonify({
                "error": f"No database found for schema '{schema_name}'"
            }), 404
            
        database_id = result[0]

        # Check if table already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM all_tables 
            WHERE owner = :1 AND table_name = :2
        """, [schema_name.upper(), table_name.upper()])
        
        exists = cursor.fetchone()[0] > 0

        if exists:
            # Check if table is already in metadata
            cursor.execute("""
                SELECT id FROM tables_metadata 
                WHERE name = :1 AND schema_name = :2 AND database_id = :3
            """, [table_name, schema_name, database_id])
            
            if cursor.fetchone():
                return jsonify({
                    "message": f"Table {schema_name}.{table_name} already registered."
                }), 200

            # Add to metadata if not present
            table_id_var = cursor.var(oracledb.NUMBER)
            cursor.execute("""
                INSERT INTO tables_metadata 
                (name, schema_name, database_id, created_at) 
                VALUES (:1, :2, :3, SYSTIMESTAMP)
                RETURNING id INTO :4
            """, [table_name, schema_name, database_id, table_id_var])
            
            conn.commit()
            return jsonify({
                "message": f"Table {schema_name}.{table_name} registered in metadata."
            }), 201

        # Create new table
        col_defs = []
        pk_col = None
        for col in columns:
            line = f"{col['name']} {col['type']}"
            if col.get("default"):
                line += f" DEFAULT {col['default']}"
            if col.get("references"):
                line += f" REFERENCES {schema_name}.{col['references']}"
            col_defs.append(line)
            if col.get("primary"):
                pk_col = col['name']

        if pk_col:
            col_defs.append(f"CONSTRAINT {table_name}_pk PRIMARY KEY ({pk_col})")

        # Add created_at column
        col_defs.append("created_at TIMESTAMP DEFAULT SYSTIMESTAMP")

        create_sql = f'CREATE TABLE "{schema_name}"."{table_name}" (\n  ' + ",\n  ".join(col_defs) + "\n)"
        cursor.execute(create_sql)

        # Insert into metadata
        table_id_var = cursor.var(oracledb.NUMBER)
        cursor.execute("""
            INSERT INTO tables_metadata 
            (name, schema_name, database_id, created_at) 
            VALUES (:1, :2, :3, SYSTIMESTAMP)
            RETURNING id INTO :4
        """, [table_name, schema_name, database_id, table_id_var])

        table_id = table_id_var.getvalue()
        conn.commit()

        return jsonify({
            "message": f"Table {schema_name}.{table_name} created and registered.",
            "id": table_id
        }), 201

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            "error": f"Database constraint violated: {str(e)}"
        }), 409
    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            "error": str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
# # table attributes
# @app.route('/api/tables/<int:table_id>/attributes', methods=['GET'])
# def get_table_attributes(table_id):
#     try:
#         #Get table name and schema from metadata
#         print(table_id)
#         cursor.execute("""
#             SELECT name, schema_name
#             FROM tables_metadata
#             WHERE id = %s;
#         """, (table_id,))
#         row = cursor.fetchone()
        
#         if not row:
#             return jsonify({"error": "Table not found in metadata"}), 404

#         table_name, schema_name = row
#         print(table_name)
#         print(schema_name)

#         # Fetch column names from information_schema
#         cursor.execute("""
#             SELECT column_name
#             FROM information_schema.columns
#             WHERE table_schema = %s AND table_name = %s
#             ORDER BY ordinal_position;
#         """, (schema_name, table_name))
#         columns = [r[0] for r in cursor.fetchall()]
#         print(f"Attribute names: {columns}")
#         if not columns:
#             return jsonify({
#                 "error": f"No columns found for table '{table_name}' in schema '{schema_name}'"
#             }), 404

#         return jsonify({
#             "table_id": table_id,
#             "schema_name": schema_name,
#             "table_name": table_name,
#             "attributes": columns
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # ------------------- 5. View Hierarchy -------------------
@app.route("/api/hierarchy", methods=["GET"])
def get_hierarchy():
    """Get complete hierarchy of LOBs, Subject Areas, Databases, and Tables"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                l.id AS lob_id, 
                l.name AS lob_name,
                sa.id AS subject_area_id, 
                sa.name AS subject_area_name,
                db.id AS db_id, 
                db.name AS db_name,
                t.id AS table_id, 
                t.name AS table_name
            FROM lobs l
            LEFT JOIN subject_areas sa ON sa.lob_id = l.id
            LEFT JOIN subject_area_logical_database sald ON sald.subject_area_id = sa.id
            LEFT JOIN logical_databases db ON db.id = sald.logical_database_id
            LEFT JOIN tables_metadata t ON t.database_id = db.id
            ORDER BY l.id, sa.id, db.id, t.id
        """)

        rows = cursor.fetchall()
        hierarchy = {}

        for row in rows:
            lob_id, lob_name, sa_id, sa_name, db_id, db_name, table_id, table_name = row

            # Initialize LOB if not exists
            if lob_id not in hierarchy:
                hierarchy[lob_id] = {
                    "name": lob_name,
                    "subject_areas": {}
                }

            # Initialize Subject Area if exists and not already added
            if sa_id and sa_id not in hierarchy[lob_id]["subject_areas"]:
                hierarchy[lob_id]["subject_areas"][sa_id] = {
                    "name": sa_name,
                    "databases": {}
                }

            # Initialize Database if exists and not already added
            if sa_id and db_id and db_id not in hierarchy[lob_id]["subject_areas"][sa_id]["databases"]:
                hierarchy[lob_id]["subject_areas"][sa_id]["databases"][db_id] = {
                    "name": db_name,
                    "tables": {}
                }

            # Add table if exists
            if sa_id and db_id and table_id:
                hierarchy[lob_id]["subject_areas"][sa_id]["databases"][db_id]["tables"][table_id] = table_name

        logger.info(f"Retrieved hierarchy with {len(hierarchy)} LOBs")
        return jsonify(hierarchy)

    except oracledb.Error as e:
        logger.error(f"Database error in get_hierarchy: {e}")
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_hierarchy: {e}")
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ER Relationships
@app.route('/api/er_relationships', methods=['POST'])
def add_er_relationship():
    """Adds a new ER Relationship."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        from_table_id = data.get('from_table_id')
        from_column = data.get('from_column')
        to_table_id = data.get('to_table_id')
        to_column = data.get('to_column')
        cardinality = data.get('cardinality')
        relationship_type = data.get('relationship_type', 'foreign_key')

        required_fields = [from_table_id, from_column, to_table_id, to_column, cardinality]
        if not all(required_fields):
            return jsonify({'error': 'All required fields are required'}), 400

        if cardinality not in ['one-to-one', 'one-to-many', 'many-to-one']:
            return jsonify({'error': 'Invalid cardinality'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        relationship_id_var = cursor.var(oracledb.NUMBER)
        cursor.execute("""
            INSERT INTO er_relationships 
            (from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, created_at)
            VALUES (:1, :2, :3, :4, :5, :6, SYSTIMESTAMP)
            RETURNING id INTO :7
        """, [from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, relationship_id_var])
        
        relationship_id = relationship_id_var.getvalue()
        conn.commit()
        
        return jsonify({
            'message': 'ER Relationship added successfully', 
            'id': relationship_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error adding ER relationship: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/er_relationships', methods=['GET'])
def get_all_er_relationships():
    """Retrieves all ER Relationships."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, from_table_id, from_column, to_table_id, to_column, 
                   cardinality, relationship_type, created_at 
            FROM er_relationships 
            ORDER BY id
        """)
        
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        relationships = []
        
        for row in rows:
            relationship = dict(zip(columns, row))
            if relationship['created_at']:
                relationship['created_at'] = relationship['created_at'].isoformat()
            relationships.append(relationship)
            
        return jsonify(relationships), 200

    except Exception as e:
        logger.error(f"Error getting ER relationships: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/er_relationships/<int:er_entity_id>', methods=['GET'])
def get_all_er_relationships_inERdiag(er_entity_id):
    """Retrieves all ER Relationships for a specific er_diagram entity."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                r.id, r.from_table_id, ft.name AS from_table_name,
                r.from_column, r.to_table_id, tt.name AS to_table_name,
                r.to_column, r.cardinality, r.relationship_type, 
                r.created_at, r.er_entity_id
            FROM er_relationships r
            JOIN tables_metadata ft ON r.from_table_id = ft.id
            JOIN tables_metadata tt ON r.to_table_id = tt.id
            WHERE r.er_entity_id = :1
            ORDER BY r.id
        """, [er_entity_id])
        
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        relationships = []
        
        for row in rows:
            relationship = dict(zip(columns, row))
            if relationship['created_at']:
                relationship['created_at'] = relationship['created_at'].isoformat()
            relationship['display'] = f"{relationship['from_table_name']}.{relationship['from_column']} → {relationship['to_table_name']}.{relationship['to_column']}"
            relationships.append(relationship)
            
        return jsonify(relationships), 200

    except Exception as e:
        logger.error(f"Error getting ER relationships for entity {er_entity_id}: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route('/api/er_relationships/<string:database_name>', methods=['GET'])
def get_all_er_relationships_inDB(database_name):
    """Retrieves all ER Relationships for a specific database."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # First verify if database exists
        cursor.execute("""
            SELECT id FROM logical_databases 
            WHERE UPPER(name) = UPPER(:1)
        """, [database_name])
        
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "error": f"Database '{database_name}' not found",
                "relationships": []
            }), 404

        # Get relationships
        cursor.execute("""
            SELECT 
                er.id, 
                er.from_table_id, 
                er.from_column,
                er.to_table_id, 
                er.to_column, 
                er.cardinality,
                er.relationship_type, 
                er.created_at, 
                er.er_entity_id,
                tm_from.name as from_table_name,
                tm_to.name as to_table_name
            FROM er_relationships er
            JOIN tables_metadata tm_from ON er.from_table_id = tm_from.id
            JOIN tables_metadata tm_to ON er.to_table_id = tm_to.id
            JOIN logical_databases db ON tm_from.database_id = db.id 
                OR tm_to.database_id = db.id
            WHERE UPPER(db.name) = UPPER(:1)
        """, [database_name])
        
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        relationships = []
        
        for row in rows:
            relationship = dict(zip(columns, row))
            if relationship['created_at']:
                relationship['created_at'] = relationship['created_at'].isoformat()
            relationship['display'] = f"{relationship['from_table_name']}.{relationship['from_column']} → {relationship['to_table_name']}.{relationship['to_column']}"
            relationships.append(relationship)
            
        return jsonify({
            "success": True,
            "database_name": database_name,
            "relationships": relationships
        }), 200

    except oracledb.Error as e:
        logger.error(f"Database error getting relationships for {database_name}: {e}")
        return jsonify({
            "success": False,
            "error": f"Database error: {str(e)}",
            "relationships": []
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error getting relationships for {database_name}: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "relationships": []
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/er_relationships/<string:database_name>/<int:table_id>', methods=['GET'])
def get_all_er_relationships_inDB_tableid(database_name, table_id):
    """Get all ER relationships for a specific table in a database"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT
                r.id,
                r.from_table_id,
                ft.name AS from_table_name,
                r.from_column,
                r.to_table_id,
                tt.name AS to_table_name,
                r.to_column,
                r.cardinality,
                r.relationship_type,
                r.created_at
            FROM er_relationships r
            JOIN tables_metadata ft ON r.from_table_id = ft.id
            JOIN tables_metadata tt ON r.to_table_id = tt.id
            WHERE (r.from_table_id = :1 OR r.to_table_id = :2)
            ORDER BY r.id
        """, [table_id, table_id])
        
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        relationships = []
        
        for row in rows:
            relationship = dict(zip(columns, row))
            if relationship['created_at']:
                relationship['created_at'] = relationship['created_at'].isoformat()
            relationship['display'] = f"{relationship['from_table_name']}.{relationship['from_column']} → {relationship['to_table_name']}.{relationship['to_column']}"
            relationships.append(relationship)
            
        return jsonify(relationships), 200

    except Exception as e:
        logger.error(f"Error getting ER relationships for table {table_id}: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/er_relationships/<int:rel_id>', methods=['GET'])
def get_er_relationship_by_id(rel_id):
    """Retrieves an ER Relationship by ID."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, from_table_id, from_column, to_table_id, to_column, 
                   cardinality, relationship_type, created_at 
            FROM er_relationships 
            WHERE id = :1
        """, [rel_id])
        
        result = cursor.fetchone()
        if not result:
            return jsonify({'error': f'ER Relationship with ID {rel_id} not found'}), 404
            
        return jsonify({
            'id': result[0],
            'from_table_id': result[1],
            'from_column': result[2],
            'to_table_id': result[3],
            'to_column': result[4],
            'cardinality': result[5],
            'relationship_type': result[6],
            'created_at': result[7].isoformat() if result[7] else None
        }), 200

    except Exception as e:
        logger.error(f"Error getting ER relationship {rel_id}: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/er_relationships/<int:rel_id>', methods=['PUT'])
def update_er_relationship(rel_id):
    """Updates an existing ER Relationship."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        updates = []
        params = []
        bind_names = []

        # Build dynamic update query with Oracle bind variables
        if 'from_table_id' in data:
            updates.append("from_table_id = :next_bind")
            params.append(data['from_table_id'])
            bind_names.append('next_bind')

        if 'from_column' in data:
            updates.append("from_column = :next_bind")
            params.append(data['from_column'])
            bind_names.append('next_bind')

        if 'to_table_id' in data:
            updates.append("to_table_id = :next_bind")
            params.append(data['to_table_id'])
            bind_names.append('next_bind')

        if 'to_column' in data:
            updates.append("to_column = :next_bind")
            params.append(data['to_column'])
            bind_names.append('next_bind')

        if 'cardinality' in data:
            if data['cardinality'] not in ['one-to-one', 'one-to-many', 'many-to-one']:
                return jsonify({'error': 'Invalid cardinality'}), 400
            updates.append("cardinality = :next_bind")
            params.append(data['cardinality'])
            bind_names.append('next_bind')

        if 'relationship_type' in data:
            updates.append("relationship_type = :next_bind")
            params.append(data['relationship_type'])
            bind_names.append('next_bind')

        if not updates:
            return jsonify({'error': 'No fields provided for update'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute update with RETURNING clause
        update_sql = f"""
            UPDATE er_relationships 
            SET {', '.join(updates)}
            WHERE id = :id
            RETURNING id INTO :return_id
        """
        
        return_id_var = cursor.var(oracledb.NUMBER)
        bind_values = dict(zip(bind_names, params))
        bind_values['id'] = rel_id
        bind_values['return_id'] = return_id_var
        
        cursor.execute(update_sql, bind_values)
        
        if return_id_var.getvalue():
            conn.commit()
            return jsonify({
                'message': f'ER Relationship with ID {rel_id} updated successfully'
            }), 200
        else:
            return jsonify({
                'error': f'ER Relationship with ID {rel_id} not found'
            }), 404

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            'error': f"Database constraint violated: {str(e)}"
        }), 409
    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        return jsonify({
            'error': f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'error': str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/er_relationships/<int:rel_id>', methods=['DELETE'])
def delete_er_relationship(rel_id):
    """Deletes an ER Relationship by ID."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        deleted_id_var = cursor.var(oracledb.NUMBER)
        cursor.execute("""
            DELETE FROM er_relationships 
            WHERE id = :1
            RETURNING id INTO :2
        """, [rel_id, deleted_id_var])
        
        if deleted_id_var.getvalue():
            conn.commit()
            logger.info(f"Successfully deleted ER relationship with ID {rel_id}")
            return jsonify({
                'message': f'ER Relationship with ID {rel_id} deleted successfully'
            }), 200
        else:
            logger.warning(f"ER Relationship with ID {rel_id} not found")
            return jsonify({
                'error': f'ER Relationship with ID {rel_id} not found'
            }), 404

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database integrity error: {e}")
        return jsonify({
            'error': f"Database constraint violated: {str(e)}"
        }), 409
    except oracledb.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        return jsonify({
            'error': f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'error': 'Internal server error'
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
# @app.route('/api/search')
# def search():
#     """Search across all entities (LOBs, Subject Areas, Databases, Tables) with lineage"""
#     conn = None
#     cursor = None
#     query = request.args.get('q', '').strip()
#     results = []

#     if not query:
#         return jsonify(results)

#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Modified query with LEFT JOINs to ensure we get results even if relationships don't exist
#         cursor.execute("""
#             SELECT 'LOB' AS type, l.id, l.name,
#                    NULL AS lob, NULL AS subject, NULL AS database
#             FROM lobs l
#             WHERE UPPER(l.name) LIKE UPPER(:1)

#             UNION ALL

#             SELECT 'Subject Area', s.id, s.name,
#                    l.name AS lob, NULL AS subject, NULL AS database
#             FROM subject_areas s
#             LEFT JOIN lobs l ON s.lob_id = l.id
#             WHERE UPPER(s.name) LIKE UPPER(:2)

#             UNION ALL

#             SELECT 'Database', d.id, d.name,
#                    l.name AS lob, s.name AS subject, NULL AS database
#             FROM logical_databases d
#             LEFT JOIN subject_area_logical_database sald ON d.id = sald.logical_database_id
#             LEFT JOIN subject_areas s ON sald.subject_area_id = s.id
#             LEFT JOIN lobs l ON s.lob_id = l.id
#             WHERE UPPER(d.name) LIKE UPPER(:3)

#             UNION ALL

#             SELECT 'Table', t.id, t.name,
#                    l.name AS lob, s.name AS subject, d.name AS database
#             FROM tables_metadata t
#             LEFT JOIN logical_databases d ON t.database_id = d.id
#             LEFT JOIN subject_area_logical_database sald ON d.id = sald.logical_database_id
#             LEFT JOIN subject_areas s ON sald.subject_area_id = s.id
#             LEFT JOIN lobs l ON s.lob_id = l.id
#             WHERE UPPER(t.name) LIKE UPPER(:4)
#         """, [f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"])
        
#         columns = ['type', 'id', 'name', 'lob', 'subject', 'database']
#         rows = cursor.fetchall()
        
#         for row in rows:
#             results.append(dict(zip(columns, row)))

#         return jsonify(results)

#     except oracledb.Error as e:
#         logger.error(f"Database error in search: {e}")
#         return jsonify({"error": str(e)}), 500
#     except Exception as e:
#         logger.error(f"Unexpected error in search: {e}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         if cursor:
#             cursor.close()
#         if conn:
#             conn.close()

@app.route('/api/search')
def search():
    """Search across all entities (LOBs, Subject Areas, Databases, Tables) with lineage"""
    conn = None
    cursor = None
    query = request.args.get('q', '').strip()
    results = []

    if not query:
        return jsonify(results)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 'LOB' AS type, l.id, l.name,
                   NULL AS lob, NULL AS subject, NULL AS database
            FROM lobs l
            WHERE UPPER(l.name) LIKE UPPER(:1)

            UNION ALL

            SELECT 'Subject Area', s.id, s.name,
                   l.name AS lob, NULL AS subject, NULL AS database
            FROM subject_areas s
            JOIN lobs l ON s.lob_id = l.id
            WHERE UPPER(s.name) LIKE UPPER(:2)

            UNION ALL

            SELECT 'Database', d.id, d.name,
                   l.name AS lob, s.name AS subject, NULL AS database
            FROM logical_databases d
            JOIN subject_area_logical_database sald ON d.id = sald.logical_database_id
            JOIN subject_areas s ON sald.subject_area_id = s.id
            JOIN lobs l ON s.lob_id = l.id
            WHERE UPPER(d.name) LIKE UPPER(:3)

            UNION ALL

            SELECT 'Table', t.id, t.name,
                   l.name AS lob, s.name AS subject, d.name AS database
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            JOIN subject_area_logical_database sald ON d.id = sald.logical_database_id
            JOIN subject_areas s ON sald.subject_area_id = s.id
            JOIN lobs l ON s.lob_id = l.id
            WHERE UPPER(t.name) LIKE UPPER(:4)
        """, [f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"])
        
        columns = ['type', 'id', 'name', 'lob', 'subject', 'database']
        rows = cursor.fetchall()
        
        for row in rows:
            results.append(dict(zip(columns, row)))

        return jsonify(results)

    except oracledb.Error as e:
        logger.error(f"Database error in search: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in search: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
# @app.route("/api/profile", methods=["POST"])
# def profile_table():
#     try:
#         data = request.get_json()
#         schema = data["schema"]
#         table = data["table"]

#         query = f'SELECT * FROM "{schema}"."{table}"'
#         df = pd.read_sql(query, con=conn)

#         if df.empty:
#             return jsonify({"error": "Table is empty"}), 400

#         profile = ProfileReport(df, title=f"YData Profile - {schema}.{table}", explorative=True)
        
#         # Get HTML content directly instead of saving to file
#         html_content = profile.to_html()
        
#         # Return HTML content with proper content type
#         return Response(html_content, mimetype='text/html')

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
@app.route("/api/tables/<int:table_id>", methods=["DELETE"])
def delete_table(table_id):
    """Delete a table, its metadata, and all associated ER relationships."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Step 1: Get table metadata
        cursor.execute("""
            SELECT name, schema_name 
            FROM tables_metadata 
            WHERE id = :1
        """, [table_id])
        
        table_row = cursor.fetchone()
        if not table_row:
            return jsonify({"error": "Table not found in metadata"}), 404
        
        table_name, schema_name = table_row
        
        # Step 2: Delete all ER relationships involving this table
        cursor.execute("""
            DELETE FROM er_relationships 
            WHERE from_table_id = :1 OR to_table_id = :2
        """, [table_id, table_id])
        relationships_deleted = cursor.rowcount
        
        # Step 3: Drop the actual table from Oracle
        try:
            drop_sql = f'DROP TABLE "{schema_name}"."{table_name}" CASCADE CONSTRAINTS'
            cursor.execute(drop_sql)
        except oracledb.DatabaseError as e:
            conn.rollback()
            logger.error(f"Failed to drop table: {e}")
            return jsonify({
                "error": f"Failed to drop table from database: {str(e)}"
            }), 500
        
        # Step 4: Remove table metadata
        cursor.execute("""
            DELETE FROM tables_metadata 
            WHERE id = :1
        """, [table_id])
        
        if cursor.rowcount == 0:
            conn.rollback()
            return jsonify({"error": "Failed to delete table metadata"}), 500
        
        conn.commit()
        
        return jsonify({
            "message": f"Table {schema_name}.{table_name} deleted successfully",
            "table_id": table_id,
            "relationships_deleted": relationships_deleted
        }), 200
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error deleting table: {e}")
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error deleting table: {e}")
        return jsonify({
            "error": f"Failed to delete table: {str(e)}"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
# @app.route("/api/schema-overview/<string:schema_name>", methods=["GET"])
# def schema_overview(schema_name):
#     """Return detailed info about a schema (database) and its tables."""
#     try:
#         # Check schema existence
#         cursor.execute("""
#             SELECT schema_name
#             FROM information_schema.schemata
#             WHERE schema_name = %s
#         """, (schema_name,))
#         schema_row = cursor.fetchone()
#         if not schema_row:
#             return jsonify({"error": f"Schema '{schema_name}' not found"}), 404

#         # Get tables, owners, and sizes
#         cursor.execute("""
#             SELECT
#                 c.relname AS table_name,
#                 r.rolname AS owner,
#                 COALESCE(pg_total_relation_size(c.oid), 0) AS total_bytes
#             FROM pg_class c
#             JOIN pg_roles r ON c.relowner = r.oid
#             JOIN pg_namespace n ON c.relnamespace = n.oid
#             WHERE c.relkind = 'r' AND n.nspname = %s
#             ORDER BY c.relname
#         """, (schema_name,))
#         table_rows = cursor.fetchall()

#         tables = []
#         for row in table_rows:
#             table_name, owner, total_bytes = row
#             # Get row count
#             try:
#                 cursor.execute(
#                     sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
#                         sql.Identifier(schema_name), sql.Identifier(table_name)
#                     )
#                 )
#                 count = cursor.fetchone()[0]
#             except Exception:
#                 count = None
#             tables.append({
#                 "table": table_name,
#                 "owner": owner,
#                 "row_count": count,
#                 "size_bytes": total_bytes if total_bytes is not None else 0,
#             })

#         # Get total schema size (use COALESCE to avoid NULL)
#         cursor.execute("""
#             SELECT
#                 pg_size_pretty(COALESCE(SUM(pg_total_relation_size(c.oid)),0)) AS total_size_pretty,
#                 COALESCE(SUM(pg_total_relation_size(c.oid)),0) AS total_size_bytes
#             FROM pg_class c
#             JOIN pg_namespace n ON c.relnamespace = n.oid
#             WHERE n.nspname = %s AND c.relkind = 'r'
#         """, (schema_name,))
#         size_row = cursor.fetchone()
#         schema_size_pretty = size_row[0] if size_row else "0 bytes"
#         schema_size_bytes = size_row[1] if size_row else 0

#         # Get tablespace (location)
#         cursor.execute("""
#             SELECT
#                 n.nspname AS schema_name,
#                 COALESCE(ts.spcname, 'pg_default') AS tablespace
#             FROM pg_namespace n
#             LEFT JOIN pg_tablespace ts ON nspacl IS NOT NULL AND ts.oid = (SELECT dattablespace FROM pg_database WHERE datname = current_database())
#             WHERE n.nspname = %s
#             LIMIT 1
#         """, (schema_name,))
#         ts_row = cursor.fetchone()
#         tablespace = ts_row[1] if ts_row else "pg_default"

#         return jsonify({
#             "schema": schema_name,
#             "tables": tables,
#             "table_count": len(tables),
#             "schema_size_pretty": schema_size_pretty,
#             "schema_size_bytes": schema_size_bytes,
#             "tablespace": tablespace
#         })
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/api/table-overview/<string:schema>/<string:table>", methods=["GET"])
# def table_overview(schema, table):
#     """Return detailed info about a table."""
#     try:
#         # Table owner
#         cursor.execute("""
#             SELECT r.rolname
#             FROM pg_class c
#             JOIN pg_roles r ON c.relowner = r.oid
#             JOIN pg_namespace n ON c.relnamespace = n.oid
#             WHERE n.nspname = %s AND c.relname = %s AND c.relkind = 'r'
#         """, (schema, table))
#         owner_row = cursor.fetchone()
#         owner = owner_row[0] if owner_row else None

#         # Row count (estimate, fallback to COUNT(*) if -1)
#         cursor.execute(
#             sql.SQL("SELECT reltuples::bigint FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE nspname = %s AND relname = %s"),
#             (schema, table)
#         )
#         row_count_row = cursor.fetchone()
#         row_count = int(row_count_row[0]) if row_count_row else None

#         if row_count == -1:
#             try:
#                 cursor.execute(
#                     sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
#                         sql.Identifier(schema), sql.Identifier(table)
#                     )
#                 )
#                 row_count = cursor.fetchone()[0]
#             except Exception:
#                 row_count = None

#         # Column count
#         cursor.execute("""
#             SELECT COUNT(*) FROM information_schema.columns
#             WHERE table_schema = %s AND table_name = %s
#         """, (schema, table))
#         col_count_row = cursor.fetchone()
#         column_count = col_count_row[0] if col_count_row else None

#         # Partition info (if any)
#         cursor.execute("""
#             SELECT relispartition FROM pg_class c
#             JOIN pg_namespace n ON c.relnamespace = n.oid
#             WHERE n.nspname = %s AND c.relname = %s
#         """, (schema, table))
#         part_row = cursor.fetchone()
#         is_partition = bool(part_row[0]) if part_row else False

#         # Last modified time (from pg_stat_all_tables)
#         cursor.execute("""
#             SELECT GREATEST(
#                 COALESCE(last_vacuum, 'epoch'),
#                 COALESCE(last_autovacuum, 'epoch'),
#                 COALESCE(last_analyze, 'epoch'),
#                 COALESCE(last_autoanalyze, 'epoch')
#             ) AS last_modified
#             FROM pg_stat_all_tables
#             WHERE schemaname = %s AND relname = %s
#         """, (schema, table))
#         mod_row = cursor.fetchone()
#         last_modified = mod_row[0].isoformat() if mod_row and mod_row[0] else None

#         # Column details with primary key information
#         cursor.execute("""
#             SELECT 
#                 c.column_name,
#                 c.data_type,
#                 c.is_nullable,
#                 c.column_default,
#                 c.ordinal_position,
#                 CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
#             FROM information_schema.columns c
#             LEFT JOIN (
#                 SELECT ku.column_name
#                 FROM information_schema.table_constraints tc
#                 JOIN information_schema.key_column_usage ku 
#                     ON tc.constraint_name = ku.constraint_name
#                     AND tc.table_schema = ku.table_schema
#                     AND tc.table_name = ku.table_name
#                 WHERE tc.constraint_type = 'PRIMARY KEY'
#                     AND tc.table_schema = %s
#                     AND tc.table_name = %s
#             ) pk ON c.column_name = pk.column_name
#             WHERE c.table_schema = %s 
#                 AND c.table_name = %s
#             ORDER BY c.ordinal_position
#         """, (schema, table, schema, table))
        
#         columns = [
#             {
#                 "name": r[0],
#                 "type": r[1],
#                 "nullable": r[2],
#                 "default": r[3],
#                 "ordinal_position": r[4],
#                 "is_primary_key": r[5],
#             }
#             for r in cursor.fetchall()
#         ]

#         return jsonify({
#             "schema": schema,
#             "table": table,
#             "owner": owner,
#             "row_count": row_count,
#             "column_count": column_count,
#             "is_partition": is_partition,
#             "last_modified": last_modified,
#             "columns": columns
#         })
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/api/table-csv/<string:schema>/<string:table>", methods=["GET"])
# def download_table_csv(schema, table):
#     """Download table data as CSV."""
#     try:
#         # First check if table exists
#         cursor.execute("""
#             SELECT EXISTS (
#                 SELECT FROM information_schema.tables 
#                 WHERE table_schema = %s AND table_name = %s
#             );
#         """, (schema, table))
#         exists = cursor.fetchone()[0]
#         if not exists:
#             return jsonify({"error": f"Table {schema}.{table} not found"}), 404

#         # Use pandas with chunks for large tables
#         with conn.cursor() as cur:
#             cur.execute(
#                 sql.SQL("SELECT * FROM {}.{}").format(
#                     sql.Identifier(schema), sql.Identifier(table)
#                 )
#             )
#             # Fetch column names
#             columns = [desc[0] for desc in cur.description]
            
#             # Fetch all data
#             data = cur.fetchall()
            
#             # Create DataFrame
#             df = pd.DataFrame(data, columns=columns)
#             csv_data = df.to_csv(index=False)

#             return Response(
#                 csv_data,
#                 mimetype='text/csv',
#                 headers={
#                     'Content-Disposition': f'attachment; filename={table}.csv',
#                     'Content-Type': 'text/csv; charset=utf-8'
#                 }
#             )
#     except Exception as e:
#         print(f"Error downloading CSV: {str(e)}")  # For debugging
#         return jsonify({"error": f"Failed to generate CSV: {str(e)}"}), 500

#@app.route("/api/logical-databases", methods=["GET"])
def get_logical_databases():
    """
    Return all logical databases with their LOB and Subject Area info.
    Used for import dropdown in frontend.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                db.id, 
                db.name, 
                l.name AS lob_name, 
                sa.name AS subject_area_name
            FROM logical_databases db
            JOIN subject_area_logical_database sald ON db.id = sald.logical_database_id
            JOIN subject_areas sa ON sald.subject_area_id = sa.id
            JOIN lobs l ON sa.lob_id = l.id
            ORDER BY db.id
        """)
        
        columns = ['id', 'name', 'lob_name', 'subject_area_name']
        rows = cursor.fetchall()
        result = [dict(zip(columns, row)) for row in rows]
        
        return jsonify(result), 200
        
    except oracledb.Error as e:
        logger.error(f"Database error in get_logical_databases: {e}")
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_logical_databases: {e}")
        return jsonify({
            "error": str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    try:
        # Verify database configuration
        logger.info(f"Connecting to database at {DB_HOST}:{DB_PORT}/{DB_SERVICE}")
        test_conn = get_db_connection()
        if test_conn:
            test_conn.close()
            logger.info("Database connection successful")
        else:
            logger.error("Could not establish database connection")
            sys.exit(1)
            
        # Start Flask application
        logger.info("Starting Flask application")
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        sys.exit(1)