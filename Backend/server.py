import os
from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import Error, sql

app = Flask(__name__)

# --- Database Configuration ---
# IMPORTANT: Replace these with your actual PostgreSQL database credentials
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_NAME = os.environ.get('DB_NAME', 'schemabrowser')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '12345')
DB_PORT = os.environ.get('DB_PORT', '5432')

def get_db_connection():
    """Establishes and returns a database connection."""
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Error as e:
        print(f"Error connecting to PostgreSQL database: {e}")
        return None

# --- Helper Function for Database Operations ---
def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=True):
    """
    Executes a given SQL query and handles connection, cursor, and transaction.
    Returns fetched data if fetch_one or fetch_all is True.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return {'error': 'Database connection failed'}, 500

        cur = conn.cursor()
        cur.execute(query, params)
        if commit:
            conn.commit()

        if fetch_one:
            return cur.fetchone()
        if fetch_all:
            return cur.fetchall()
        return {'message': 'Operation successful'}, 200
    except Error as e:
        if conn:
            conn.rollback() # Rollback in case of error
        print(f"Database error: {e}")
        return {'error': str(e)}, 400 # Bad request for database errors
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# --- API Endpoints ---

# LOBs
@app.route('/lobs', methods=['POST'])
def add_lob():
    """Adds a new Line of Business."""
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    query = "INSERT INTO lobs (name) VALUES (%s) RETURNING id;"
    result = execute_query(query, (name,), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 1:
        return jsonify({'message': 'LOB added successfully', 'id': result[0]}), 201
    return jsonify(result), result.get('status', 400) # Propagate error status

@app.route('/lobs', methods=['GET'])
def get_all_lobs():
    """Retrieves all Lines of Business."""
    query = "SELECT id, name FROM lobs ORDER BY id;"
    results = execute_query(query, fetch_all=True)

    if isinstance(results, list):
        lobs = [{'id': row[0], 'name': row[1]} for row in results]
        return jsonify(lobs), 200
    return jsonify(results), results.get('status', 400)

@app.route('/lobs/<int:lob_id>', methods=['GET'])
def get_lob_by_id(lob_id):
    """Retrieves a Line of Business by ID."""
    query = "SELECT id, name FROM lobs WHERE id = %s;"
    result = execute_query(query, (lob_id,), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 2:
        return jsonify({'id': result[0], 'name': result[1]}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'LOB with ID {lob_id} not found'}), 404

@app.route('/lobs/<int:lob_id>', methods=['PUT'])
def update_lob(lob_id):
    """Updates an existing Line of Business."""
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    query = "UPDATE lobs SET name = %s WHERE id = %s RETURNING id;"
    result = execute_query(query, (name, lob_id), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'LOB with ID {lob_id} updated successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'LOB with ID {lob_id} not found or could not be updated'}), 404

@app.route('/lobs/<int:lob_id>', methods=['DELETE'])
def delete_lob(lob_id):
    """Deletes a Line of Business by ID."""
    query = "DELETE FROM lobs WHERE id = %s RETURNING id;"
    result = execute_query(query, (lob_id,), fetch_one=True)

    if result is not None and not isinstance(result, dict): # Check if it's a successful fetch
        return jsonify({'message': f'LOB with ID {lob_id} deleted successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'LOB with ID {lob_id} not found or could not be deleted'}), 404


# Subject Areas
@app.route('/subject_areas', methods=['POST'])
def add_subject_area():
    """Adds a new Subject Area."""
    data = request.get_json()
    name = data.get('name')
    lob_id = data.get('lob_id')

    if not name or not lob_id:
        return jsonify({'error': 'Name and lob_id are required'}), 400

    query = "INSERT INTO subject_areas (name, lob_id) VALUES (%s, %s) RETURNING id;"
    result = execute_query(query, (name, lob_id), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 1:
        return jsonify({'message': 'Subject Area added successfully', 'id': result[0]}), 201
    return jsonify(result), result.get('status', 400)

@app.route('/subject_areas', methods=['GET'])
def get_all_subject_areas():
    """Retrieves all Subject Areas."""
    query = "SELECT id, name, lob_id FROM subject_areas ORDER BY id;"
    results = execute_query(query, fetch_all=True)

    if isinstance(results, list):
        subject_areas = [{'id': row[0], 'name': row[1], 'lob_id': row[2]} for row in results]
        return jsonify(subject_areas), 200
    return jsonify(results), results.get('status', 400)

@app.route('/subject_areas/<int:sa_id>', methods=['GET'])
def get_subject_area_by_id(sa_id):
    """Retrieves a Subject Area by ID."""
    query = "SELECT id, name, lob_id FROM subject_areas WHERE id = %s;"
    result = execute_query(query, (sa_id,), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 3:
        return jsonify({'id': result[0], 'name': result[1], 'lob_id': result[2]}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'Subject Area with ID {sa_id} not found'}), 404

@app.route('/subject_areas/<int:sa_id>', methods=['PUT'])
def update_subject_area(sa_id):
    """Updates an existing Subject Area."""
    data = request.get_json()
    name = data.get('name')
    lob_id = data.get('lob_id')

    if not name or not lob_id:
        return jsonify({'error': 'Name and lob_id are required'}), 400

    query = "UPDATE subject_areas SET name = %s, lob_id = %s WHERE id = %s RETURNING id;"
    result = execute_query(query, (name, lob_id, sa_id), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'Subject Area with ID {sa_id} updated successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'Subject Area with ID {sa_id} not found or could not be updated'}), 404

@app.route('/subject_areas/<int:sa_id>', methods=['DELETE'])
def delete_subject_area(sa_id):
    """Deletes a Subject Area by ID."""
    query = "DELETE FROM subject_areas WHERE id = %s RETURNING id;"
    result = execute_query(query, (sa_id,), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'Subject Area with ID {sa_id} deleted successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'Subject Area with ID {sa_id} not found or could not be deleted'}), 404

# Logical Databases
@app.route('/logical_databases', methods=['POST'])
def add_logical_database():
    """Adds a new Logical Database."""
    data = request.get_json()
    name = data.get('name')
    subject_area_id = data.get('subject_area_id')

    if not name or not subject_area_id:
        return jsonify({'error': 'Name and subject_area_id are required'}), 400

    query = "INSERT INTO logical_databases (name, subject_area_id) VALUES (%s, %s) RETURNING id;"
    result = execute_query(query, (name, subject_area_id), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 1:
        return jsonify({'message': 'Logical Database added successfully', 'id': result[0]}), 201
    return jsonify(result), result.get('status', 400)

@app.route('/logical_databases', methods=['GET'])
def get_all_logical_databases():
    """Retrieves all Logical Databases."""
    query = "SELECT id, name, subject_area_id FROM logical_databases ORDER BY id;"
    results = execute_query(query, fetch_all=True)

    if isinstance(results, list):
        logical_databases = [{'id': row[0], 'name': row[1], 'subject_area_id': row[2]} for row in results]
        return jsonify(logical_databases), 200
    return jsonify(results), results.get('status', 400)

@app.route('/logical_databases/<int:ld_id>', methods=['GET'])
def get_logical_database_by_id(ld_id):
    """Retrieves a Logical Database by ID."""
    query = "SELECT id, name, subject_area_id FROM logical_databases WHERE id = %s;"
    result = execute_query(query, (ld_id,), fetch_one=True)

    if isinstance(result, tuple) and len(result) == 3:
        return jsonify({'id': result[0], 'name': result[1], 'subject_area_id': result[2]}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'Logical Database with ID {ld_id} not found'}), 404

@app.route('/logical_databases/<int:ld_id>', methods=['PUT'])
def update_logical_database(ld_id):
    """Updates an existing Logical Database."""
    data = request.get_json()
    name = data.get('name')
    subject_area_id = data.get('subject_area_id')

    if not name or not subject_area_id:
        return jsonify({'error': 'Name and subject_area_id are required'}), 400

    query = "UPDATE logical_databases SET name = %s, subject_area_id = %s WHERE id = %s RETURNING id;"
    result = execute_query(query, (name, subject_area_id, ld_id), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'Logical Database with ID {ld_id} updated successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'Logical Database with ID {ld_id} not found or could not be updated'}), 404

@app.route('/logical_databases/<int:ld_id>', methods=['DELETE'])
def delete_logical_database(ld_id):
    """Deletes a Logical Database by ID."""
    query = "DELETE FROM logical_databases WHERE id = %s RETURNING id;"
    result = execute_query(query, (ld_id,), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'Logical Database with ID {ld_id} deleted successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'Logical Database with ID {ld_id} not found or could not be deleted'}), 404

# Tables Metadata
# @app.route('/tables_metadata', methods=['POST'])
# def add_table_metadata():
#     """Adds new Table Metadata."""
#     data = request.get_json()
#     name = data.get('name')
#     schema_name = data.get('schema_name', 'public') # Default to 'public'
#     database_id = data.get('database_id')

#     if not name or not database_id:
#         return jsonify({'error': 'Name and database_id are required'}), 400

#     query = "INSERT INTO tables_metadata (name, schema_name, database_id) VALUES (%s, %s, %s) RETURNING id;"
#     result = execute_query(query, (name, schema_name, database_id), fetch_one=True)

#     if isinstance(result, tuple) and len(result) == 1:
#         return jsonify({'message': 'Table Metadata added successfully', 'id': result[0]}), 201
#     return jsonify(result), result.get('status', 400)

@app.route('/tables_metadata', methods=['GET'])
def get_all_tables_metadata():
    """Retrieves all Table Metadata entries."""
    query = "SELECT id, name, schema_name, database_id FROM tables_metadata ORDER BY id;"
    results = execute_query(query, fetch_all=True)

    if isinstance(results, list):
        tables = [{'id': row[0], 'name': row[1], 'schema_name': row[2], 'database_id': row[3]} for row in results]
        return jsonify(tables), 200
    return jsonify(results), results.get('status', 400)

# @app.route('/tables_metadata/<int:table_id>', methods=['GET'])
# def get_table_metadata_by_id(table_id):
#     """Retrieves Table Metadata by ID."""
#     query = "SELECT id, name, schema_name, database_id FROM tables_metadata WHERE id = %s;"
#     result = execute_query(query, (table_id,), fetch_one=True)

#     if isinstance(result, tuple) and len(result) == 4:
#         return jsonify({'id': result[0], 'name': result[1], 'schema_name': result[2], 'database_id': result[3]}), 200
#     elif isinstance(result, dict) and 'error' in result:
#         return jsonify(result), result.get('status', 400)
#     return jsonify({'error': f'Table Metadata with ID {table_id} not found'}), 404

# @app.route('/tables_metadata/<int:table_id>', methods=['PUT'])
# def update_table_metadata(table_id):
#     """Updates an existing Table Metadata entry."""
#     data = request.get_json()
#     name = data.get('name')
#     schema_name = data.get('schema_name')
#     database_id = data.get('database_id')

#     # Build update query dynamically based on provided fields
#     updates = []
#     params = []
#     if name is not None:
#         updates.append("name = %s")
#         params.append(name)
#     if schema_name is not None:
#         updates.append("schema_name = %s")
#         params.append(schema_name)
#     if database_id is not None:
#         updates.append("database_id = %s")
#         params.append(database_id)

#     if not updates:
#         return jsonify({'error': 'No fields provided for update'}), 400

#     query = f"UPDATE tables_metadata SET {', '.join(updates)} WHERE id = %s RETURNING id;"
#     params.append(table_id)
#     result = execute_query(query, tuple(params), fetch_one=True)

#     if result is not None and not isinstance(result, dict):
#         return jsonify({'message': f'Table Metadata with ID {table_id} updated successfully'}), 200
#     elif isinstance(result, dict) and 'error' in result:
#         return jsonify(result), result.get('status', 400)
#     return jsonify({'error': f'Table Metadata with ID {table_id} not found or could not be updated'}), 404

# @app.route('/tables_metadata/<int:table_id>', methods=['DELETE'])
# def delete_table_metadata(table_id):
#     """Deletes Table Metadata by ID."""
#     query = "DELETE FROM tables_metadata WHERE id = %s RETURNING id;"
#     result = execute_query(query, (table_id,), fetch_one=True)

#     if result is not None and not isinstance(result, dict):
#         return jsonify({'message': f'Table Metadata with ID {table_id} deleted successfully'}), 200
#     elif isinstance(result, dict) and 'error' in result:
#         return jsonify(result), result.get('status', 400)
#     return jsonify({'error': f'Table Metadata with ID {table_id} not found or could not be deleted'}), 404

# ER Relationships
@app.route('/er_relationships', methods=['POST'])
def add_er_relationship():
    """Adds a new ER Relationship."""
    data = request.get_json()
    from_table_id = data.get('from_table_id')
    from_column = data.get('from_column')
    to_table_id = data.get('to_table_id')
    to_column = data.get('to_column')
    cardinality = data.get('cardinality')
    relationship_type = data.get('relationship_type', 'foreign_key') # Default to 'foreign_key'

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

@app.route('/er_relationships', methods=['GET'])
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

@app.route('/er_relationships/<int:rel_id>', methods=['GET'])
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

@app.route('/er_relationships/<int:rel_id>', methods=['PUT'])
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

@app.route('/er_relationships/<int:rel_id>', methods=['DELETE'])
def delete_er_relationship(rel_id):
    """Deletes an ER Relationship by ID."""
    query = "DELETE FROM er_relationships WHERE id = %s RETURNING id;"
    result = execute_query(query, (rel_id,), fetch_one=True)

    if result is not None and not isinstance(result, dict):
        return jsonify({'message': f'ER Relationship with ID {rel_id} deleted successfully'}), 200
    elif isinstance(result, dict) and 'error' in result:
        return jsonify(result), result.get('status', 400)
    return jsonify({'error': f'ER Relationship with ID {rel_id} not found or could not be deleted'}), 404

@app.route('/')
def home():
    return "Welcome to the Database Management API!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
