import os
from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import Error, sql
from flask_cors import CORS
from dotenv import load_dotenv

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

@app.route("/api/tables/<int:table_id>", methods=["GET"])
def get_table_by_id(table_id):  
    print(table_id)
    try:
        cursor.execute("""
            SELECT t.id, t.name, t.schema_name, d.name AS database_name
            FROM tables_metadata t
            JOIN logical_databases d ON t.database_id = d.id
            WHERE t.id = %s;
        """, (table_id,))
        row = cursor.fetchone()
        print(row);
        if row:
            table = {"id": row[0], "name": row[1], "schema_name": row[2], "database_name": row[3]}
            print("Fetched table:", table) 
            return jsonify(table)
        else:
            return jsonify({"error": "Table not found asdads"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500  

@app.route("/api/tables", methods=["POST"])
def create_table():
    data = request.json
    table_name = data['table_name']
    schema_name = data['schema_name']
    database_id = data['database_id']
    columns = data['columns']

    try:
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
        return jsonify({"message": str(e)}), 400


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


@app.route('/api/er_relationships/<string:database_name>', methods=['GET'])
def get_all_er_relationships_inDB(database_name):
    print("database name :"+database_name)
    """Retrieves all ER Relationships for a specific database."""
    query = """
    SELECT id, from_table_id, from_column, to_table_id, to_column, 
           cardinality, relationship_type, created_at, database_name 
    FROM er_relationships 
    WHERE database_name = %s 
    ORDER BY id;
    """
    results = execute_query(query, (database_name,), fetch_all=True)
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
                'created_at': row[7].isoformat() if row[7] else None, # Convert datetime to ISO format string
                'database_name': row[8]
            })
        # print("rels ",relationships)
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

if __name__ == "__main__":
    app.run(debug=True)
