from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import sql
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Setup DB connection (update with your credentials)
conn = psycopg2.connect(
    dbname="schema_brow",
    user="postgres",
    password="root",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# ------------------- 1. Create LOB -------------------
@app.route("/api/lobs", methods=["POST"])
def create_lob():
    data = request.json
    cursor.execute("INSERT INTO lobs (name) VALUES (%s) RETURNING id", (data["name"],))
    conn.commit()
    return jsonify({"message": "LOB created", "id": cursor.fetchone()[0]})


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
        "INSERT INTO logical_databases (name, subject_area_id) VALUES (%s, %s) RETURNING id",
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


# ------------------- 6. Search Endpoint -------------------
@app.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    results = []

    if not query:
        return jsonify(results)

    try:
        cursor.execute("""
            SELECT 'LOB' AS type, id, name FROM lobs WHERE name ILIKE %s
            UNION
            SELECT 'Subject Area', id, name FROM subject_areas WHERE name ILIKE %s
            UNION
            SELECT 'Database', id, name FROM logical_databases WHERE name ILIKE %s
            UNION
            SELECT 'Table', id, name FROM tables_metadata WHERE name ILIKE %s
        """, (f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"))
        rows = cursor.fetchall()
        for row in rows:
            results.append({"type": row[0], "id": row[1], "name": row[2]})
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
