import os
import psycopg2
from psycopg2 import Error, sql
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, Response
import pandas as pd
from ydata_profiling import ProfileReport
import os
import tempfile
output_dir = tempfile.mkdtemp()

# Load environment variables from .env file
load_dotenv()

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
except Exception as e:
    print(f"Database connection failed: {e}")
    conn = None
    cursor = None

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                if fetch_one:
                    return cur.fetchone()
                if fetch_all:
                    return cur.fetchall()
                return None
    except Exception as e:
        conn.rollback()
        return {'error': str(e), 'status': 400}
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

    # Insert new logical database
    try:
        cursor.execute(
            "INSERT INTO logical_databases (name, subject_area_id) VALUES (%s, %s) RETURNING id",
            (data["name"], subject_area_id)
        )
        conn.commit()
        new_id = cursor.fetchone()[0]

        # Create schema in Postgres if not exists
        try:
            cursor.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(data['name'])))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"message": f"Schema creation failed: {str(e)}"}), 400

        return jsonify({"message": "Logical DB created", "id": new_id})
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

@app.route("/api/tables", methods=["POST"])
def create_table():
    data = request.json
    table_name = data['table_name']
    schema_name = data['schema_name']
    columns = data['columns']

    try:
        # Get database_id from logical_databases
        cursor.execute("""
            SELECT id FROM logical_databases WHERE name = %s
        """, (schema_name,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": f"No database found for schema '{schema_name}'"}), 404
        database_id = result[0]

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

        create_sql = f'CREATE TABLE {schema_name}.{table_name} (\n  ' + ",\n  ".join(col_defs) + "\n);"
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

        table_name, schema_name = row
        print(table_name)
        print(schema_name)

        # Fetch column names from information_schema
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
            ORDER BY ordinal_position;
        """, (schema_name, table_name))
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
            LEFT JOIN logical_databases db ON db.subject_area_id = sa.id
            LEFT JOIN tables_metadata t ON t.database_id = db.id
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
    database_name = data.get('database_name')
    print("Adding ER Relationship with data:", data)
    required_fields = [from_table_id, from_column, to_table_id, to_column, cardinality, database_name]
    if not all(required_fields):
        return jsonify({'error': 'All required fields (from_table_id, from_column, to_table_id, to_column, cardinality, database_name) are required'}), 400

    if cardinality not in ['one-to-one', 'one-to-many', 'many-to-one']:
        return jsonify({'error': 'Invalid cardinality. Must be one of: one-to-one, one-to-many, many-to-one'}), 400

    query = """
    INSERT INTO er_relationships (from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, database_name)
    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    params = (from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, database_name)
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
        r.database_name
    FROM er_relationships r
    JOIN tables_metadata ft ON r.from_table_id = ft.id
    JOIN tables_metadata tt ON r.to_table_id = tt.id
    WHERE r.database_name = %s
    ORDER BY r.id;
    """
    results = execute_query(query, (database_name,), fetch_all=True)
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
                'database_name': row[10],
                'display': f"{row[2]}.{row[3]} → {row[5]}.{row[6]}"
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
            r.created_at,
            r.database_name
        FROM er_relationships r
        JOIN tables_metadata ft ON r.from_table_id = ft.id
        JOIN tables_metadata tt ON r.to_table_id = tt.id
        WHERE r.database_name = %s
        AND (r.from_table_id = %s OR r.to_table_id = %s)
        ORDER BY r.id;
    """
    results = execute_query(query, (database_name, table_id, table_id), fetch_all=True)
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
                'database_name': row[10],
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
    query = "DELETE FROM er_relationships WHERE id = %s RETURNING id;"
    result = execute_query(query, (rel_id,), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'ER Relationship with ID {rel_id} deleted successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'ER Relationship with ID {rel_id} not found or could not be deleted'}), 404


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

@app.route("/api/profile", methods=["POST"])
def profile_table():
    try:
        data = request.get_json()
        schema = data["schema"]
        table = data["table"]

        query = f'SELECT * FROM "{schema}"."{table}"'
        df = pd.read_sql(query, con=conn)

        if df.empty:
            return jsonify({"error": "Table is empty"}), 400

        profile = ProfileReport(df, title=f"YData Profile - {schema}.{table}", explorative=True)
        
        # Get HTML content directly instead of saving to file
        html_content = profile.to_html()
        
        # Return HTML content with proper content type
        return Response(html_content, mimetype='text/html')

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/api/tables/<int:table_id>", methods=["DELETE"])
def delete_table(table_id):
    """Delete a table, its metadata, and all associated ER relationships."""
    try:
        # Step 1: Get table metadata
        cursor.execute("""
            SELECT name, schema_name FROM tables_metadata WHERE id = %s
        """, (table_id,))
        table_row = cursor.fetchone()
        
        if not table_row:
            return jsonify({"error": "Table not found in metadata"}), 404
        
        table_name, schema_name = table_row
        
        # Step 2: Delete all ER relationships involving this table
        cursor.execute("""
            DELETE FROM er_relationships 
            WHERE from_table_id = %s OR to_table_id = %s
        """, (table_id, table_id))
        relationships_deleted = cursor.rowcount
        
        # Step 3: Drop the actual table from PostgreSQL
        try:
            cursor.execute(sql.SQL("DROP TABLE IF EXISTS {}.{}").format(
                sql.Identifier(schema_name), 
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
            "message": f"Table {schema_name}.{table_name} deleted successfully",
            "table_id": table_id,
            "relationships_deleted": relationships_deleted
        }), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to delete table: {str(e)}"}), 500

@app.route("/api/schema-overview/<string:schema_name>", methods=["GET"])
def schema_overview(schema_name):
    """Return detailed info about a schema (database) and its tables."""
    try:
        # Check schema existence
        cursor.execute("""
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name = %s
        """, (schema_name,))
        schema_row = cursor.fetchone()
        if not schema_row:
            return jsonify({"error": f"Schema '{schema_name}' not found"}), 404

        # Get tables, owners, and sizes
        cursor.execute("""
            SELECT
                c.relname AS table_name,
                r.rolname AS owner,
                COALESCE(pg_total_relation_size(c.oid), 0) AS total_bytes
            FROM pg_class c
            JOIN pg_roles r ON c.relowner = r.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relkind = 'r' AND n.nspname = %s
            ORDER BY c.relname
        """, (schema_name,))
        table_rows = cursor.fetchall()

        tables = []
        for row in table_rows:
            table_name, owner, total_bytes = row
            # Get row count
            try:
                cursor.execute(
                    sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
                        sql.Identifier(schema_name), sql.Identifier(table_name)
                    )
                )
                count = cursor.fetchone()[0]
            except Exception:
                count = None
            tables.append({
                "table": table_name,
                "owner": owner,
                "row_count": count,
                "size_bytes": total_bytes if total_bytes is not None else 0,
            })

        # Get total schema size (use COALESCE to avoid NULL)
        cursor.execute("""
            SELECT
                pg_size_pretty(COALESCE(SUM(pg_total_relation_size(c.oid)),0)) AS total_size_pretty,
                COALESCE(SUM(pg_total_relation_size(c.oid)),0) AS total_size_bytes
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = %s AND c.relkind = 'r'
        """, (schema_name,))
        size_row = cursor.fetchone()
        schema_size_pretty = size_row[0] if size_row else "0 bytes"
        schema_size_bytes = size_row[1] if size_row else 0

        # Get tablespace (location)
        cursor.execute("""
            SELECT
                n.nspname AS schema_name,
                COALESCE(ts.spcname, 'pg_default') AS tablespace
            FROM pg_namespace n
            LEFT JOIN pg_tablespace ts ON nspacl IS NOT NULL AND ts.oid = (SELECT dattablespace FROM pg_database WHERE datname = current_database())
            WHERE n.nspname = %s
            LIMIT 1
        """, (schema_name,))
        ts_row = cursor.fetchone()
        tablespace = ts_row[1] if ts_row else "pg_default"

        return jsonify({
            "schema": schema_name,
            "tables": tables,
            "table_count": len(tables),
            "schema_size_pretty": schema_size_pretty,
            "schema_size_bytes": schema_size_bytes,
            "tablespace": tablespace
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/table-overview/<string:schema>/<string:table>", methods=["GET"])
def table_overview(schema, table):
    """Return detailed info about a table."""
    try:
        # Table owner
        cursor.execute("""
            SELECT r.rolname
            FROM pg_class c
            JOIN pg_roles r ON c.relowner = r.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = %s AND c.relname = %s AND c.relkind = 'r'
        """, (schema, table))
        owner_row = cursor.fetchone()
        owner = owner_row[0] if owner_row else None

        # Row count (estimate, fallback to COUNT(*) if -1)
        cursor.execute(
            sql.SQL("SELECT reltuples::bigint FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = %s AND c.relname = %s"),
            (schema, table)
        )
        row_count_row = cursor.fetchone()
        row_count = int(row_count_row[0]) if row_count_row else None

        if row_count == -1:
            try:
                cursor.execute(
                    sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
                        sql.Identifier(schema), sql.Identifier(table)
                    )
                )
                row_count = cursor.fetchone()[0]
            except Exception:
                row_count = None

        # Column count
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
        """, (schema, table))
        col_count_row = cursor.fetchone()
        column_count = col_count_row[0] if col_count_row else None

        # Partition info (if any)
        cursor.execute("""
            SELECT relispartition FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = %s AND c.relname = %s
        """, (schema, table))
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
            WHERE schemaname = %s AND relname = %s
        """, (schema, table))
        mod_row = cursor.fetchone()
        last_modified = mod_row[0].isoformat() if mod_row and mod_row[0] else None

        # Column details
        cursor.execute("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default,
                ordinal_position
            FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
            ORDER BY ordinal_position
        """, (schema, table))
        columns = [
            {
                "name": r[0],
                "type": r[1],
                "nullable": r[2],
                "default": r[3],
                "ordinal_position": r[4],
            }
            for r in cursor.fetchall()
        ]

        return jsonify({
            "schema": schema,
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

if __name__ == "__main__":
    app.run(debug=True)