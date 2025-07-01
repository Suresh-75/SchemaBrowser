from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import Error, sql
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# --- Database Configuration ---
# IMPORTANT: Replace these with your actual PostgreSQL database credentials
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_NAME = os.environ.get('DB_NAME', 'schemabrowser')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '12345')
DB_PORT = os.environ.get('DB_PORT', '5432')


# ------------------- 2. Create Subject Area -------------------
@app.route("/api/subject-areas", methods=["POST"])
def create_subject_area():
    data = request.json
    cursor.execute(
        "INSERT INTO subject_areas (name, lob_id) VALUES (%s, %s) RETURNING id",
        (data["name"], data["lob_id"])
    )
    conn.commit()
    return jsonify({"message": "Subject Area created", "id": cursor.fetchone()[0]})


# ------------------- 3. Create Logical Database -------------------
@app.route("/api/logical-databases", methods=["POST"])
def create_logical_db():
    data = request.json
    cursor.execute(
        "INSERT INTO databases (name, subject_area_id) VALUES (%s, %s) RETURNING id",
        (data["name"], data["subject_area_id"])
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


# ------------------- 4. Create Table -------------------
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
            LEFT JOIN databases db ON db.subject_area_id = sa.id
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


if __name__ == "__main__":
    app.run(debug=True)
