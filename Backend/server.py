import os
import psycopg2
from psycopg2 import Error, sql
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, Response
import pandas as pd
from ydata_profiling import ProfileReport
import os
from datetime import datetime
import tempfile
import json
from datetime import datetime, timedelta
import time
import logging
# from apscheduler.schedulers.background import BackgroundScheduler
# from apscheduler.triggers.cron import CronTrigger
import hashlib

output_dir = tempfile.mkdtemp()

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', 5432) 

# --- Database Connection ---
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    cursor = conn.cursor()
    conn.autocommit = True  # Enable autocommit for better transaction handling
except Exception as e:
    print(f"Database connection failed: {e}")
    conn = None
    cursor = None

def get_db_connection():
    """Get a fresh database connection"""
    try:
        return psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute query with proper connection handling"""
    db_conn = get_db_connection()
    if not db_conn:
        return {'error': 'Database connection failed', 'status': 500}
    
    try:
        with db_conn.cursor() as cur:
            cur.execute(query, params)
            if fetch_one:
                return cur.fetchone()
            if fetch_all:
                return cur.fetchall()
            db_conn.commit()
            return None
    except Exception as e:
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
            
        schema = "public"
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
        # Check if a LOB with the same name already exists
        cursor.execute("SELECT id FROM lobs WHERE name = %s", (name,))
        if cursor.fetchone():
            return jsonify({"error": "LOB with this name already exists"}), 409

        # Insert new LOB
        cursor.execute(
            "INSERT INTO lobs (name) VALUES (%s) RETURNING id;",
            (name,)
        )
        lob_id = cursor.fetchone()[0]
        conn.commit()
        return jsonify({"message": "LOB created", "id": lob_id}), 201

    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({"error": "Database constraint failed: LOB name must be unique"}), 409

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500



# ------------------- 2. Create Subject Area -------------------
@app.route("/api/subject-areas", methods=["POST"])
def create_subject_area():
    data = request.json
    name = data["name"]
    lob_name = data["lob_name"]

    # Find LOB ID
    cursor.execute("SELECT id FROM lobs WHERE name = %s", (lob_name,))
    lob_result = cursor.fetchone()
    if not lob_result:
        return jsonify({"message": "LOB not found"}), 404

    lob_id = lob_result[0]

    # Check for existing subject area with same name under same LOB
    cursor.execute(
        "SELECT id FROM subject_areas WHERE name = %s AND lob_id = %s",
        (name, lob_id),
    )
    if cursor.fetchone():
        return jsonify({"message": "Subject Area already exists under this LOB."}), 400

    cursor.execute(
        "INSERT INTO subject_areas (name, lob_id) VALUES (%s, %s) RETURNING id",
        (name, lob_id),
    )
    conn.commit()
    return jsonify({"message": "Subject Area created", "id": cursor.fetchone()[0]})


# ------------------- 3. Create Logical Database -------------------
@app.route("/api/logical-databases", methods=["POST"])
def create_logical_db():
    data = request.json
    lob_name = data["lob_name"]
    subject_name = data["subject_name"]

    # Get subject_area_id from lob_name + subject_name
    cursor.execute("""
        SELECT sa.id 
        FROM subject_areas sa
        JOIN lobs l ON sa.lob_id = l.id
        WHERE sa.name = %s AND l.name = %s
    """, (subject_name, lob_name))
    result = cursor.fetchone()
    if not result:
        return jsonify({"error": "Subject Area not found for given LOB"}), 404
    subject_area_id = result[0]

    try:
        # Insert new logical database
        cursor.execute(
            "INSERT INTO logical_databases (name) VALUES (%s) RETURNING id",
            (data["name"],)
        )
        conn.commit()
        new_db_id = cursor.fetchone()[0]

        # Associate with subject area
        cursor.execute(
            "INSERT INTO subject_area_logical_database (subject_area_id, logical_database_id) VALUES (%s, %s)",
            (subject_area_id, new_db_id)
        )
        conn.commit()

        return jsonify({"message": "Logical DB created", "id": new_db_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to create Logical DB: {str(e)}"}), 400


# ------------------- 4. Create Table -------------------
@app.route("/api/tables", methods=["GET"])
def get_tables():
    try:
        cursor.execute("""
            SELECT t.id, t.name, t.schema_name, d.name AS database_name
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            ORDER BY t.id;
        """)
        rows = cursor.fetchall()
        tables = [{"id": row[0], "name": row[1], "schema_name": row[2], "database_name": row[3]} for row in rows]
        return jsonify(tables)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/tables/<string:database_name>", methods=["GET"])
def get_tables_inDB(database_name):
    try:
        cursor.execute("""
            SELECT t.id, t.name, t.schema_name, d.name AS database_name
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            WHERE d.name = %s
            ORDER BY t.id;
        """, (database_name,))
        rows = cursor.fetchall()
        tables = [{"id": row[0], "name": row[1], "schema_name": row[2], "database_name": row[3]} for row in rows]
        return jsonify(tables)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.route("/api/tables/<int:table_id>", methods=["GET"])
# def get_table_by_id(table_id):
#     try:
#         cursor.execute("""
#             SELECT t.id, t.name, t.schema_name
#             FROM tables_metadata t
#             WHERE t.id = %s;
#         """, (table_id,))
#         row = cursor.fetchone()
#         print(row)
#         if not row:
#             return jsonify({"error": "Table not found in metadata"}), 404
        
#         table_name = row[1]
#         schema_name = row[2]
#         # Second query to get table details from schema_name.table_name
#         cursor.execute("""
#             SELECT column_name
#             FROM information_schema.columns
#             WHERE table_schema = %s AND table_name = %s
#             ORDER BY ordinal_position;
#         """, (schema_name, table_name))
#         columns = [r[0] for r in cursor.fetchall()]

#         print(f"Attribute names: {columns}")
#         # Prepare full response
#         table_details = {
#             "table_id": table_row[0],
#             "table_name": table_row[1],
#             "input_format": table_row[2],
#             "output_format": table_row[3],
#             "location": table_row[4],
#             "partitioned_by": table_row[5],
#             "database_name": schema_name,
#         }
        
#         return jsonify(table_details)
    
#     except Exception as e:
#         return jsonify({"error": f"Database error: {str(e)}"}), 500
def get_lob_id_by_name(conn, lob_name):
    """Get LOB ID by name"""
    try:
        cursor.execute("SELECT id FROM lobs WHERE name = %s", (lob_name,))
        result = cursor.fetchone()
        return result[0] if result else None
    except psycopg2.Error as e:
        # logger.error(f"Error getting LOB ID for {lob_name}: {e}")
        return None
def get_or_create_er_entity(conn, er_diagram_name, lob_id):
    """Get existing ER entity or create a new one"""
    try:
        # Check if entity already exists
        cursor.execute("""
            SELECT id FROM er_entities 
            WHERE entity_name = %s AND lob_id = %s
        """, (er_diagram_name, lob_id))
            
        result = cursor.fetchone()
        print(result)
        if result:
            return result['id']
            
            # Create new entity
        cursor.execute("""
            INSERT INTO er_entities (entity_name, lob_id, description, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            er_diagram_name,
            lob_id,
            f"ER Diagram: {er_diagram_name}",
            datetime.now(),
            datetime.now()
        ))
            
        val= cursor.fetchone()[0]
        print(val)
        return val
            
    except psycopg2.Error as e:
        # logger.error(f"Error in get_or_create_er_entity: {e}")
        raise

@app.route("/api/delete_er_diagram/<int:entityId>", methods=['DELETE'])
def deleteERdiagram(entityId):
    """Deletes an ER Relationship by entityId."""
    try:
        print(entityId)
        relationships_deleted_count = execute_query(
            "DELETE FROM er_relationships WHERE er_entity_id = %s;",
            (entityId,),
        )
        print(relationships_deleted_count)
        # Then delete the entity
        entity_deleted_count = execute_query(
            "DELETE FROM er_entities WHERE id = %s;",
            (entityId,),
        )

        if entity_deleted_count > 0:
            return {"message": f"ER Diagram with ID {entityId} deleted successfully."}, 200
        else:
            return {"message": f"ER Diagram with ID {entityId} not found or already deleted."}, 404

    except Exception as e:
        print(f"Error deleting ER Diagram {entityId}: {e}") # Log the error
        return {"error": "An internal server error occurred during deletion."}, 500


@app.route('/api/create_er_diagram', methods=['POST'])
def create_er_relationship():
    """Create a new ER diagram relationship"""
    conn = None
    cursor = None
    
    try:
        # Get JSON data from request
        data = request.get_json()
        print(data)
        
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
        print(f"ER Entity ID: {er_entity_id}")
        
        # Check if relationship already exists
        cursor.execute("""
            SELECT id FROM er_relationships 
            WHERE from_table_id = %s AND from_column = %s
            AND to_table_id = %s AND to_column = %s 
            AND er_entity_id = %s
        """, (from_table_id, from_column, to_table_id, to_column, er_entity_id))
            
        existing_relationship = cursor.fetchone()
        if existing_relationship:
            return jsonify({
                'success': False,
                'error': 'Relationship already exists between these tables and columns'
            }), 409
        
        # Create the relationship
        cursor.execute("""
            INSERT INTO er_relationships 
            (from_table_id, from_column, to_table_id, to_column, 
            cardinality, relationship_type, created_at, er_entity_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            from_table_id,
            from_column,
            to_table_id,
            to_column,
            cardinality,
            relationship_type,
            datetime.now(),
            er_entity_id
        ))
            
        result = cursor.fetchone()
        relationship_id = result[0]
        created_at = result[1]
        
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
                'created_at': created_at.isoformat()
            }
        }), 201
        
    except psycopg2.Error as e:
        # Rollback transaction on error
        if conn:
            conn.rollback()
        print(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        # Rollback transaction on any error
        if conn:
            conn.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500
        
    finally:
        # Clean up resources
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/api/createER", methods=["POST"])
def createER():
    conn = None
    cursor = None
    
    try:
        data = request.get_json()
        print(data)
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
            WHERE from_table_id = %s AND from_column = %s
            AND to_table_id = %s AND to_column = %s 
            AND er_entity_id = %s
        """, (from_table_id, from_column, to_table_id, to_column, er_entity_id))
        
        existing_relationship = cursor.fetchone()
        if existing_relationship:
            return jsonify({
                'success': False,
                'error': 'Relationship already exists between these tables and columns'
            }), 409
        
        # Create the relationship
        cursor.execute("""
            INSERT INTO er_relationships 
            (from_table_id, from_column, to_table_id, to_column, 
            cardinality, relationship_type, created_at, er_entity_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            from_table_id,
            from_column,
            to_table_id,
            to_column,
            cardinality,
            relationship_type,
            datetime.now(),
            er_entity_id
        ))
        result = cursor.fetchone()
        print(result)
        relationship_id = result[0]
        created_at = result[1]
        
        # Commit transaction
        conn.commit()
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'ER relationship created successfully',
            # 'data': {
            #     'id': relationship_id,
            #     'er_entity_id': er_entity_id,
            #     'from_table_id': from_table_id,
            #     'from_column': from_column,
            #     'to_table_id': to_table_id,
            #     'to_column': to_column,
            #     'cardinality': cardinality,
            #     'relationship_type': relationship_type,
            #     'created_at': created_at.isoformat()
            # }
        }), 201
        
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        print(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Unexpected error: {e}")
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
    try:
        print(lob_name)
        # Query to get ER entities for a specific LOB
        query = """
            SELECT 
                ee.id,
                ee.entity_name,
                ee.description,
                ee.created_at,
                ee.updated_at,
                l.name as lob_name,
                COUNT(er.id) as relationship_count
            FROM ER_entities ee
            JOIN lobs l ON ee.lob_id = l.id
            LEFT JOIN er_relationships er ON ee.id = er.er_entity_id
            WHERE LOWER(l.name) = LOWER(%s)
            GROUP BY ee.id, ee.entity_name, ee.description, ee.created_at, ee.updated_at, l.name
            ORDER BY ee.entity_name
        """
        cursor.execute(query, (lob_name,))
        results = cursor.fetchall()
        
        # Check if LOB exists
        if not results:
            # Check if LOB name exists at all
            lob_check_query = "SELECT id FROM lobs WHERE LOWER(name) = LOWER(%s)"
            cursor.execute(lob_check_query, (lob_name,))
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
                "entity_name": row[1],
                "description": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
                "lob_name": row[5],
                "relationship_count": row[6]
            })
        
        return jsonify({
            "success": True,
            "lob_name": lob_name,
            "total_entities": len(er_entities),
            "data": er_entities
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "data": []
        }), 500
        
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.route("/api/addTM", methods=["POST"])
def add_table():
    data = request.json
    table_name = data['table_name']
    schema_name = data['schema_name'] 

    try:
        # Get database_id from logical_databases
        cursor.execute("""
            SELECT id FROM logical_databases WHERE name = %s
        """, (schema_name,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": f"No database found for schema '{schema_name}'"}), 404
        database_id = result[0]

        # Insert metadata
        insert_meta = """
            INSERT INTO tables_metadata (name, schema_name, database_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(insert_meta, (table_name, schema_name, database_id))
        conn.commit()

        return jsonify({"message": f"Table {table_name} imported."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

@app.route("/api/tables", methods=["POST"])
def create_table():
    data = request.json
    table_name = data['table_name']
    columns = data['columns']
    schema_name = data['schema_name']  # Always use public schema

    try:
        # Get database_id from logical_databases
        cursor.execute("""
            SELECT id FROM logical_databases WHERE name = %s
        """, (schema_name,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": f"No database found for schema '{schema_name}'"}), 404
        database_id = result[0]

        # Check if table already exists in public schema
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = %s AND table_name = %s
            );
        """, (schema_name, table_name))
        exists = cursor.fetchone()[0]

        if exists:
            # Table exists, just add to tables_metadata if not already present
            cursor.execute("""
                SELECT id FROM tables_metadata WHERE name = %s AND schema_name = %s AND database_id = %s
            """, (table_name, schema_name, database_id))
            if cursor.fetchone():
                return jsonify({"message": f"Table {schema_name}.{table_name} already registered."}), 200
            cursor.execute("""
                INSERT INTO tables_metadata (name, schema_name, database_id)
                VALUES (%s, %s, %s)
            """, (table_name, schema_name, database_id))
            conn.commit()
            return jsonify({"message": f"Table {schema_name}.{table_name} registered in metadata."}), 201

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
            col_defs.append(f"PRIMARY KEY ({pk_col})")

        # Add created_at column
        col_defs.append("created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

        create_sql = f'CREATE TABLE {table_name} (\n  ' + ",\n  ".join(col_defs) + "\n);"
        cursor.execute(create_sql)

        # Insert metadata
        insert_meta = """
            INSERT INTO tables_metadata (name, schema_name, database_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(insert_meta, (table_name, schema_name, database_id))
        conn.commit()

        return jsonify({"message": f"Table {schema_name}.{table_name} created and registered."})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

# table attributes
@app.route('/api/tables/<int:table_id>/attributes', methods=['GET'])
def get_table_attributes(table_id):
    try:
        #Get table name and schema from metadata
        print(table_id)
        cursor.execute("""
            SELECT name, schema_name
            FROM tables_metadata
            WHERE id = %s;
        """, (table_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Table not found in metadata"}), 404

        table_name = row[0]
        schema_name = "public"

        # Fetch column names from information_schema
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
            ORDER BY ordinal_position;
        """, ("public", table_name))
        columns = [r[0] for r in cursor.fetchall()]
        print(f"Attribute names: {columns}")
        if not columns:
            return jsonify({
                "error": f"No columns found for table '{table_name}' in schema '{schema_name}'"
            }), 404

        return jsonify({
            "table_id": table_id,
            "schema_name": schema_name,
            "table_name": table_name,
            "attributes": columns
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------- 5. View Hierarchy -------------------
@app.route("/api/hierarchy", methods=["GET"])
def get_hierarchy():
    try:
        cursor.execute("""
            SELECT l.id AS lob_id, l.name AS lob_name,
                   sa.id AS subject_area_id, sa.name AS subject_area_name,
                   db.id AS db_id, db.name AS db_name,
                   t.id AS table_id, t.name AS table_name
            FROM lobs l
            LEFT JOIN subject_areas sa ON sa.lob_id = l.id
            LEFT JOIN subject_area_logical_database sald ON sald.subject_area_id = sa.id
            LEFT JOIN logical_databases db ON db.id = sald.logical_database_id
            LEFT JOIN tables_metadata t ON t.schema_name = db.name
            ORDER BY l.id, sa.id, db.id, t.id;
        """)

        rows = cursor.fetchall()
        hierarchy = {}

        for row in rows:
            lob_id, lob_name, sa_id, sa_name, db_id, db_name, table_id, table_name = row

            if lob_id not in hierarchy:
                hierarchy[lob_id] = {"name": lob_name, "subject_areas": {}}

            if sa_id and sa_id not in hierarchy[lob_id]["subject_areas"]:
                hierarchy[lob_id]["subject_areas"][sa_id] = {"name": sa_name, "databases": {}}

            if db_id and db_id not in hierarchy[lob_id]["subject_areas"][sa_id]["databases"]:
                hierarchy[lob_id]["subject_areas"][sa_id]["databases"][db_id] = {"name": db_name, "tables": {}}

            if table_id:
                hierarchy[lob_id]["subject_areas"][sa_id]["databases"][db_id]["tables"][table_id] = table_name

        return jsonify(hierarchy)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ER Relationships
@app.route('/api/er_relationships', methods=['POST'])
def add_er_relationship():
    """Adds a new ER Relationship."""
    data = request.get_json()
    from_table_id = data.get('from_table_id')
    from_column = data.get('from_column')
    to_table_id = data.get('to_table_id')
    to_column = data.get('to_column')
    cardinality = data.get('cardinality')
    relationship_type = data.get('relationship_type', 'foreign_key') # Default to 'foreign_key'
    print("Adding ER Relationship with data:", data)
    required_fields = [from_table_id, from_column, to_table_id, to_column, cardinality]
    if not all(required_fields):
        return jsonify({'error': 'All required fields (from_table_id, from_column, to_table_id, to_column, cardinality) are required'}), 400

    if cardinality not in ['one-to-one', 'one-to-many', 'many-to-one']:
        return jsonify({'error': 'Invalid cardinality. Must be one of: one-to-one, one-to-many, many-to-one'}), 400

    query = """
    INSERT INTO er_relationships (from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type)
    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
    """
    params = (from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type)
    result = execute_query(query, params, fetch_one=True)

    if isinstance(result, tuple) and len(result) == 1:
        return jsonify({'message': 'ER Relationship added successfully', 'id': result[0]}), 201
    return jsonify(result), result.get('status', 400)

@app.route('/api/er_relationships', methods=['GET'])
def get_all_er_relationships():
    """Retrieves all ER Relationships."""
    query = "SELECT id, from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, created_at FROM er_relationships ORDER BY id;"
    results = execute_query(query, fetch_all=True)
    if isinstance(results, list):
        relationships = []
        for row in results:
            relationships.append({
                'id': row[0],
                'from_table_id': row[1],
                'from_column': row[2],
                'to_table_id': row[3],
                'to_column': row[4],
                'cardinality': row[5],
                'relationship_type': row[6],
                'created_at': row[7].isoformat() if row[7] else None # Convert datetime to ISO format string
            })
        return jsonify(relationships), 200
    return jsonify(results), results.get('status', 400)

@app.route('/api/er_relationships/<int:er_entity_id>', methods=['GET'])
def get_all_er_relationships_inERdiag(er_entity_id):
    """Retrieves all ER Relationships for a specific er_diagram entity with table names."""
    query = """
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
        r.created_at, 
        r.er_entity_id
    FROM er_relationships r
    JOIN tables_metadata ft ON r.from_table_id = ft.id
    JOIN tables_metadata tt ON r.to_table_id = tt.id
    WHERE r.er_entity_id = %s
    ORDER BY r.id;
    """
    results = execute_query(query, (er_entity_id,), fetch_all=True)
    if isinstance(results, list):
        relationships = []
        for row in results:
            relationships.append({
                'id': row[0],
                'from_table_id': row[1],
                'from_table_name': row[2],
                'from_column': row[3],
                'to_table_id': row[4],
                'to_table_name': row[5],
                'to_column': row[6],
                'cardinality': row[7],
                'relationship_type': row[8],
                'created_at': row[9].isoformat() if row[9] else None,
                'er_entity_id': row[10],
                'display': f"{row[2]}.{row[3]} → {row[5]}.{row[6]}"
            })
        return jsonify(relationships), 200
    return jsonify(results), results.get('status', 400)


@app.route('/api/er_relationships/<string:database_name>', methods=['GET'])
def get_all_er_relationships_inDB(database_name):
    """Retrieves all ER Relationships for a specific database with table names."""
    query = """
    SELECT DISTINCT
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
    tm_to.name as to_table_name,
    tm_from.schema_name as from_schema_name,
    tm_to.schema_name as to_schema_name
FROM er_relationships er
JOIN tables_metadata tm_from ON er.from_table_id = tm_from.id
JOIN tables_metadata tm_to ON er.to_table_id = tm_to.id
WHERE tm_from.name IN (
    SELECT name FROM tables_metadata WHERE schema_name = %s
)
OR tm_to.name IN (
    SELECT name FROM tables_metadata WHERE schema_name = %s
);
    """
    results = execute_query(query, (database_name, database_name), fetch_all=True)
    print(results)
    if isinstance(results, list):
        relationships = []
        for row in results:
            relationships.append({
                'id': row[0],
                'from_table_id': row[1],
                'from_column': row[2],
                'to_table_id': row[3],
                'to_column': row[4],
                'cardinality': row[5],
                'relationship_type': row[6],
                'created_at': row[7].isoformat() if row[7] else None,
                'er_entity_id': row[8],
                'from_table_name': row[9],
                'to_table_name': row[10],
                'database_name': database_name,
                'display': f"{row[9]}.{row[2]} → {row[10]}.{row[4]}"
            })
        return jsonify(relationships), 200
    return jsonify(results), results.get('status', 400)

@app.route('/api/er_relationships/<string:database_name>/<int:table_id>', methods=['GET'])
def get_all_er_relationships_inDB_tableid(database_name,table_id):
    query = """
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
        WHERE (r.from_table_id = %s OR r.to_table_id = %s)
        ORDER BY r.id;
    """
    results = execute_query(query, (table_id, table_id), fetch_all=True)

    if isinstance(results, list):
        relationships = []
        for row in results:
            relationships.append({
                'id': row[0],
                'from_table_id': row[1],
                'from_table_name': row[2],
                'from_column': row[3],
                'to_table_id': row[4],
                'to_table_name': row[5],
                'to_column': row[6],
                'cardinality': row[7],
                'relationship_type': row[8],
                'created_at': row[9].isoformat() if row[9] else None,
                'display': f"{row[2]}.{row[3]} → {row[5]}.{row[6]}"
            })
        return jsonify(relationships), 200
    return jsonify(results), results.get('status', 400)


@app.route('/api/er_relationships/<int:rel_id>', methods=['GET'])
def get_er_relationship_by_id(rel_id):
    """Retrieves an ER Relationship by ID."""
    query = "SELECT id, from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, created_at FROM er_relationships WHERE id = %s;"
    result = execute_query(query, (rel_id,), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 8:
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
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'ER Relationship with ID {rel_id} not found'}), 404

@app.route('/api/er_relationships/<int:rel_id>', methods=['PUT'])
def update_er_relationship(rel_id):
    """Updates an existing ER Relationship."""
    data = request.get_json()
    from_table_id = data.get('from_table_id')
    from_column = data.get('from_column')
    to_table_id = data.get('to_table_id')
    to_column = data.get('to_column')
    cardinality = data.get('cardinality')
    relationship_type = data.get('relationship_type')

    updates = []
    params = []

    if from_table_id is not None:
        updates.append("from_table_id = %s")
        params.append(from_table_id)
    if from_column is not None:
        updates.append("from_column = %s")
        params.append(from_column)
    if to_table_id is not None:
        updates.append("to_table_id = %s")
        params.append(to_table_id)
    if to_column is not None:
        updates.append("to_column = %s")
        params.append(to_column)
    if cardinality is not None:
        if cardinality not in ['one-to-one', 'one-to-many', 'many-to-one']:
            return jsonify({'error': 'Invalid cardinality. Must be one of: one-to-one, one-to-many, many-to-one'}), 400
        updates.append("cardinality = %s")
        params.append(cardinality)
    if relationship_type is not None:
        updates.append("relationship_type = %s")
        params.append(relationship_type)

    if not updates:
        return jsonify({'error': 'No fields provided for update'}), 400

    query = f"UPDATE er_relationships SET {', '.join(updates)} WHERE id = %s RETURNING id;"
    params.append(rel_id)
    result = execute_query(query, tuple(params), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'ER Relationship with ID {rel_id} updated successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'ER Relationship with ID {rel_id} not found or could not be updated'}), 404

@app.route('/api/er_relationships/<int:rel_id>', methods=['DELETE'])
def delete_er_relationship(rel_id):
    """Deletes an ER Relationship by ID."""
    try:
        # First check if the relationship exists
        check_query = "SELECT id FROM er_relationships WHERE id = %s;"
        existing = execute_query(check_query, (rel_id,), fetch_one=True)
        
        if isinstance(existing, dict) and 'error' in existing:
            logger.error(f"Error checking relationship existence: {existing}")
            return jsonify({'error': 'Database error occurred'}), 500
        
        if not existing:
            return jsonify({'error': f'ER Relationship with ID {rel_id} not found'}), 404
        
        # Delete the relationship
        delete_query = "DELETE FROM er_relationships WHERE id = %s;"
        result = execute_query(delete_query, (rel_id,))
        
        if isinstance(result, dict) and 'error' in result:
            logger.error(f"Error deleting relationship {rel_id}: {result}")
            return jsonify({'error': 'Failed to delete relationship'}), result.get('status', 500)
        
        logger.info(f"Successfully deleted ER relationship with ID {rel_id}")
        return jsonify({'message': f'ER Relationship with ID {rel_id} deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in delete_er_relationship: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/search')
def search():
    query = request.args.get('q', '').strip()
    results = []

    # Return empty list if query is blank
    if not query:
        return jsonify(results)

    try:
        # 🔍 Search all entities and attach lineage
        cursor.execute("""
            SELECT 'LOB' AS type, l.id, l.name,
                   NULL AS lob, NULL AS subject, NULL AS database
            FROM lobs l
            WHERE l.name ILIKE %s

            UNION

            SELECT 'Subject Area', s.id, s.name,
                   l.name AS lob, NULL AS subject, NULL AS database
            FROM subject_areas s
            JOIN lobs l ON s.lob_id = l.id
            WHERE s.name ILIKE %s

            UNION

            SELECT 'Database', d.id, d.name,
                   l.name AS lob, s.name AS subject, NULL AS database
            FROM logical_databases d
            JOIN subject_areas s ON d.subject_area_id = s.id
            JOIN lobs l ON s.lob_id = l.id
            WHERE d.name ILIKE %s

            UNION

            SELECT 'Table', t.id, t.name,
                   l.name AS lob, s.name AS subject, d.name AS database
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            JOIN subject_areas s ON d.subject_area_id = s.id
            JOIN lobs l ON s.lob_id = l.id
            WHERE t.name ILIKE %s
        """, (f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"))

        rows = cursor.fetchall()
        for row in rows:
            results.append({
                "type": row[0],      # "LOB", "Subject Area", etc.
                "id": row[1],
                "name": row[2],
                "lob": row[3],       # nullable
                "subject": row[4],   # nullable
                "database": row[5],  # nullable
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tables/<int:table_id>", methods=["DELETE"])
def delete_table(table_id):
    """Delete a table, its metadata, and all associated ER relationships."""
    try:
        # Step 1: Get table metadata
        cursor.execute("""
            SELECT name FROM tables_metadata WHERE id = %s
        """, (table_id,))
        table_row = cursor.fetchone()
        
        if not table_row:
            return jsonify({"error": "Table not found in metadata"}), 404
        
        table_name = table_row[0]
        schema_name = "public"  # Always use public schema
        
        # Step 2: Delete all ER relationships involving this table
        cursor.execute("""
            DELETE FROM er_relationships 
            WHERE from_table_id = %s OR to_table_id = %s
        """, (table_id, table_id))
        relationships_deleted = cursor.rowcount
        
        # Step 3: Drop the actual table from PostgreSQL
        try:
            cursor.execute(sql.SQL("DROP TABLE IF EXISTS {}").format(
                sql.Identifier(table_name)
            ))
        except Exception as e:
            conn.rollback()
            return jsonify({"error": f"Failed to drop table from database: {str(e)}"}), 500
        
        # Step 4: Remove table metadata
        cursor.execute("""
            DELETE FROM tables_metadata WHERE id = %s
        """, (table_id,))
        
        if cursor.rowcount == 0:
            conn.rollback()
            return jsonify({"error": "Failed to delete table metadata"}), 500
        
        conn.commit()
        
        return jsonify({
            "message": f"Table {table_name} deleted successfully",
            "table_id": table_id,
            "relationships_deleted": relationships_deleted
        }), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to delete table: {str(e)}"}), 500

@app.route("/api/schema-overview/<string:database_name>", methods=["GET"])
def schema_overview(database_name):
    """
    Return detailed info about a logical database (database_name) and its tables in the public schema.
    """
    try:
        # Get the logical database id
        cursor.execute("""
            SELECT id FROM logical_databases WHERE name = %s
        """, (database_name,))
        db_row = cursor.fetchone()
        if not db_row:
            return jsonify({"error": f"Logical database '{database_name}' not found"}), 404
        database_id = db_row[0]

        # Get all tables in public schema for this logical database
        cursor.execute(f"""
            SELECT t.id, t.name
            FROM tables_metadata t
            WHERE t.schema_name = '{database_name}'  AND t.database_id = %s
            ORDER BY t.name
        """, (database_id,))
        table_rows = cursor.fetchall()

        tables = []
        total_size = 0
        for row in table_rows:
            table_id, table_name = row
            # Get row count and size for each table
            try:
                cursor.execute(
                    sql.SQL("SELECT COUNT(*) FROM public.{}").format(
                        sql.Identifier(table_name)
                    )
                )
                count = cursor.fetchone()[0]
            except Exception:
                count = None
            try:
                cursor.execute(
                    "SELECT COALESCE(pg_total_relation_size(%s::regclass), 0)",
                    (f'public.{table_name}',)
                )
                size_bytes = cursor.fetchone()[0]
            except Exception:
                size_bytes = 0
            
            # Get table owner
            try:
                cursor.execute("""
                    SELECT r.rolname
                    FROM pg_class c
                    JOIN pg_roles r ON c.relowner = r.oid
                    JOIN pg_namespace n ON c.relnamespace = n.oid
                    WHERE n.nspname = 'public' AND c.relname = %s AND c.relkind = 'r'
                """, (table_name,))
                owner_row = cursor.fetchone()
                table_owner = owner_row[0] if owner_row else None
            except Exception:
                table_owner = None
            
            total_size += size_bytes
            tables.append({
                "table": table_name,
                "row_count": count,
                "size_bytes": size_bytes,
                "table_owner": table_owner,
            })

        return jsonify({
            "database": database_name,
            "table_count": len(tables),
            "tables": tables,
            "database_size_bytes": total_size,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/table-overview/<string:table>", methods=["GET"])
def table_overview(table):
    print(table)
    """Return detailed info about a table."""
    try:
        # Table owner - Using hardcoded 'public' schema
        cursor.execute("""
            SELECT r.rolname
            FROM pg_class c
            JOIN pg_roles r ON c.relowner = r.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = %s AND c.relkind = 'r'
        """, (table,))
        owner_row = cursor.fetchone()
        owner = owner_row[0] if owner_row else None

        # Row count (estimate, fallback to COUNT(*) if -1)
        cursor.execute("""
            SELECT reltuples::bigint 
            FROM pg_class c 
            JOIN pg_namespace n ON c.relnamespace = n.oid 
            WHERE n.nspname = 'public' AND c.relname = %s
        """, (table,))
        row_count_row = cursor.fetchone()
        row_count = int(row_count_row[0]) if row_count_row else None

        if row_count == -1:
            try:
                cursor.execute(
                    sql.SQL("SELECT COUNT(*) FROM {}").format(
                        sql.Identifier(table)
                    )
                )
                row_count = cursor.fetchone()[0]
            except Exception:
                row_count = None

        # Column count
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
        """, (table,))
        col_count_row = cursor.fetchone()
        column_count = col_count_row[0] if col_count_row else None

        # Partition info (if any)
        cursor.execute("""
            SELECT relispartition FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = %s
        """, (table,))
        part_row = cursor.fetchone()
        is_partition = bool(part_row[0]) if part_row else False

        # Last modified time (from pg_stat_all_tables)
        cursor.execute("""
            SELECT GREATEST(
                COALESCE(last_vacuum, 'epoch'),
                COALESCE(last_autovacuum, 'epoch'),
                COALESCE(last_analyze, 'epoch'),
                COALESCE(last_autoanalyze, 'epoch')
            ) AS last_modified
            FROM pg_stat_all_tables
            WHERE schemaname = 'public' AND relname = %s
        """, (table,))
        mod_row = cursor.fetchone()
        last_modified = mod_row[0].isoformat() if mod_row and mod_row[0] else None
        print(mod_row)
        # Column details with primary key information
        cursor.execute("""
            SELECT 
                c.column_name,
                c.data_type,
                c.is_nullable,
                c.column_default,
                c.ordinal_position,
                CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
            FROM information_schema.columns c
            LEFT JOIN (
                SELECT ku.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage ku 
                    ON tc.constraint_name = ku.constraint_name
                    AND tc.table_schema = ku.table_schema
                    AND tc.table_name = ku.table_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name = %s
            ) pk ON c.column_name = pk.column_name
            WHERE c.table_schema = 'public' 
                AND c.table_name = %s
            ORDER BY c.ordinal_position
        """, (table, table))
        
        columns = [
            {
                "name": r[0],
                "type": r[1],
                "nullable": r[2],
                "default": r[3],
                "ordinal_position": r[4],
                "is_primary_key": r[5],
            }
            for r in cursor.fetchall()
        ]

        return jsonify({
            "schema": "public",
            "table": table,
            "owner": owner,
            "row_count": row_count,
            "column_count": column_count,
            "is_partition": is_partition,
            "last_modified": last_modified,
            "columns": columns
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/table-csv/<string:schema>/<string:table>", methods=["GET"])
def download_table_csv(schema, table):
    """Download table data as CSV."""
    try:
        # First check if table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = %s AND table_name = %s
            );
        """, (schema, table))
        exists = cursor.fetchone()[0]
        if not exists:
            return jsonify({"error": f"Table {schema}.{table} not found"}), 404

        # Use pandas with chunks for large tables
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("SELECT * FROM {}.{}").format(
                    sql.Identifier(schema), sql.Identifier(table)
                )
            )
            # Fetch column names
            columns = [desc[0] for desc in cur.description]
            
            # Fetch all data
            data = cur.fetchall()
            
            # Create DataFrame
            df = pd.DataFrame(data, columns=columns)
            csv_data = df.to_csv(index=False)

            return Response(
                csv_data,
                mimetype='text/csv',
                headers={
                    'Content-Disposition': f'attachment; filename={table}.csv',
                    'Content-Type': 'text/csv; charset=utf-8'
                }
            )
    except Exception as e:
        print(f"Error downloading CSV: {str(e)}")  # For debugging
        return jsonify({"error": f"Failed to generate CSV: {str(e)}"}), 500

@app.route("/api/logical-databases", methods=["GET"])
def get_logical_databases():
    """
    Return all logical databases with their LOB and Subject Area info.
    Used for import dropdown in frontend.
    """
    try:
        cursor.execute("""
            SELECT 
                db.id, db.name, 
                l.name AS lob_name, 
                sa.name AS subject_area_name
            FROM logical_databases db
            JOIN subject_area_logical_database sald ON db.id = sald.logical_database_id
            JOIN subject_areas sa ON sald.subject_area_id = sa.id
            JOIN lobs l ON sa.lob_id = l.id
            ORDER BY db.id
        """)
        rows = cursor.fetchall()
        result = [
            {
                "id": row[0],
                "name": row[1],
                "lob_name": row[2],
                "subject_area_name": row[3]
            }
            for row in rows
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
    # scheduler = BackgroundScheduler()
    
    # Schedule profiling job to run every week (Monday at 2 AM)
    # scheduler.add_job(
    #     func=auto_profiler.run_scheduled_profiling,
    #     trigger=CronTrigger(day_of_week='mon', hour=2, minute=0),
    #     id='weekly_profiling',
    #     replace_existing=True
    # )
    
    # # Run initial profiling immediately when server starts (after 10 seconds)
    # scheduler.add_job(
    #     func=auto_profiler.run_scheduled_profiling,
    #     trigger='date',
    #     run_date=datetime.now() + timedelta(seconds=10),
    #     id='startup_profiling'
    # )
    
    # scheduler.start()
    logger.info("Automated profiling scheduler started")
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down scheduler...")
        # scheduler.shutdown()