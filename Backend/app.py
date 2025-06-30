from flask import Flask, request, jsonify
from pyhive import hive
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
import logging
from contextlib import contextmanager

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Hive connection configuration
HIVE_CONFIG = {
    'host': 'localhost',
    'port': 10000,
    'authMechanism': 'NONE',  # Options: 'NONE', 'PLAIN', 'KERBEROS', 'LDAP'
    'user': 'hive',  # Update with your username
    'password': '',  # Update with your password if needed
    'database': 'default'
}

@contextmanager
def get_hive_connection():
    """Context manager for Hive connections"""
    connection = None
    try:
        # Try different connection methods based on auth type
        if HIVE_CONFIG['authMechanism'] == 'NONE':
            connection = hive.Connection(
                host=HIVE_CONFIG['host'],
                port=HIVE_CONFIG['port'],
                username=HIVE_CONFIG['user'],
                database=HIVE_CONFIG['database']
            )
        else:
            connection = hive.Connection(
                host=HIVE_CONFIG['host'],
                port=HIVE_CONFIG['port'],
                username=HIVE_CONFIG['user'],
                password=HIVE_CONFIG['password'],
                database=HIVE_CONFIG['database'],
                auth=HIVE_CONFIG['authMechanism']
            )
        logger.info("Connected to Hive successfully")
        yield connection
    except Exception as e:
        logger.error(f"Failed to connect to Hive: {str(e)}")
        raise
    finally:
        if connection:
            connection.close()
            logger.info("Hive connection closed")

def get_foreign_keys_from_hive(database, table):
    """
    Get foreign keys for a table from Hive metadata
    """
    try:
        with get_hive_connection() as conn:
            cursor = conn.cursor()
            
            foreign_keys = []
            
            # Method 1: Query constraint information using SHOW CREATE TABLE
            try:
                query = f"SHOW CREATE TABLE {database}.{table}"
                cursor.execute(query)
                create_table_ddl = cursor.fetchall()
                
                # Parse DDL for foreign key constraints
                ddl_text = ""
                for row in create_table_ddl:
                    if row and len(row) > 0:
                        ddl_text += str(row[0]) + "\n"
                
                # Look for FOREIGN KEY patterns in DDL
                lines = ddl_text.split('\n')
                for line in lines:
                    line = line.strip()
                    if 'FOREIGN KEY' in line.upper():
                        foreign_keys.append({
                            'constraint_type': 'FOREIGN KEY',
                            'constraint_definition': line,
                            'source': 'DDL'
                        })
                
                if foreign_keys:
                    logger.info(f"Found {len(foreign_keys)} foreign keys in DDL")
                    return foreign_keys
                    
            except Exception as e:
                logger.warning(f"SHOW CREATE TABLE failed: {str(e)}")
            
            # Method 2: Query Hive's constraint tables directly
            try:
                # Query for foreign key constraints
                constraint_query = f"""
                SHOW CONSTRAINTS {database}.{table}
                """
                cursor.execute(constraint_query)
                constraints = cursor.fetchall()
                
                for constraint in constraints:
                    if len(constraint) >= 2:
                        constraint_type = str(constraint[1]).upper() if constraint[1] else ""
                        if 'FOREIGN' in constraint_type:
                            foreign_keys.append({
                                'constraint_name': constraint[0] if constraint[0] else 'unnamed',
                                'constraint_type': constraint[1] if len(constraint) > 1 else 'FOREIGN KEY',
                                'constraint_definition': constraint[2] if len(constraint) > 2 else '',
                                'source': 'SHOW CONSTRAINTS'
                            })
                
                if foreign_keys:
                    logger.info(f"Found {len(foreign_keys)} foreign keys via SHOW CONSTRAINTS")
                    return foreign_keys
                    
            except Exception as e:
                logger.warning(f"SHOW CONSTRAINTS failed: {str(e)}")
            
            # Method 3: Try alternative constraint query
            try:
                # Some Hive versions support this
                alt_query = f"DESCRIBE FORMATTED {database}.{table}"
                cursor.execute(alt_query)
                formatted_desc = cursor.fetchall()
                
                constraint_section = False
                for row in formatted_desc:
                    if row and len(row) > 0:
                        row_str = str(row[0]).strip()
                        
                        # Look for constraint section
                        if 'constraint' in row_str.lower() or 'foreign' in row_str.lower():
                            constraint_section = True
                            
                        if constraint_section and 'foreign key' in row_str.lower():
                            foreign_keys.append({
                                'constraint_info': row_str,
                                'details': row[1] if len(row) > 1 else None,
                                'source': 'DESCRIBE FORMATTED'
                            })
                
                if foreign_keys:
                    logger.info(f"Found {len(foreign_keys)} foreign keys via DESCRIBE FORMATTED")
                    return foreign_keys
                    
            except Exception as e:
                logger.warning(f"DESCRIBE FORMATTED constraint parsing failed: {str(e)}")
            
            # Method 4: Query metastore tables (if accessible)
            try:
                # This requires access to Hive metastore database
                metastore_query = f"""
                SELECT 
                    fk.fkey_name as constraint_name,
                    fk.fkeycol_name as column_name,
                    fk.pktable_db as referenced_db,
                    fk.pktable_name as referenced_table,
                    fk.pkcolumn_name as referenced_column
                FROM 
                    information_schema.table_constraints tc
                JOIN 
                    information_schema.referential_constraints rc 
                    ON tc.constraint_name = rc.constraint_name
                JOIN 
                    information_schema.key_column_usage fk 
                    ON rc.constraint_name = fk.constraint_name
                WHERE 
                    tc.table_schema = '{database}' 
                    AND tc.table_name = '{table}' 
                    AND tc.constraint_type = 'FOREIGN KEY'
                """
                
                cursor.execute(metastore_query)
                metastore_fks = cursor.fetchall()
                
                for fk in metastore_fks:
                    foreign_keys.append({
                        'constraint_name': fk[0],
                        'column_name': fk[1],
                        'referenced_database': fk[2],
                        'referenced_table': fk[3],
                        'referenced_column': fk[4],
                        'source': 'METASTORE'
                    })
                
                if foreign_keys:
                    logger.info(f"Found {len(foreign_keys)} foreign keys via metastore")
                    return foreign_keys
                    
            except Exception as e:
                logger.warning(f"Metastore query failed: {str(e)}")
            
            # If no foreign keys found, return empty list with diagnostic info
            logger.info(f"No foreign keys found for {database}.{table}")
            return []
                
    except Exception as e:
        logger.error(f"Error getting foreign keys: {str(e)}")
        raise

def get_table_constraints_metastore(database, table):
    """
    Alternative method: Query Hive metastore directly for constraints
    This requires access to the metastore database
    """
    try:
        with get_hive_connection() as conn:
            cursor = conn.cursor()
            
            # This would work if you have access to metastore tables
            # Uncomment and modify if your setup supports it
            """
            query = '''
            SELECT 
                fk.constraint_name,
                fk.child_col_name,
                fk.parent_db_name,
                fk.parent_tbl_name,
                fk.parent_col_name
            FROM 
                information_schema.table_constraints tc
            JOIN 
                information_schema.key_column_usage fk 
                ON tc.constraint_name = fk.constraint_name
            WHERE 
                tc.table_schema = %s 
                AND tc.table_name = %s 
                AND tc.constraint_type = 'FOREIGN KEY'
            '''
            cursor.execute(query, (database, table))
            return cursor.fetchall()
            """
            
            return []
            
    except Exception as e:
        logger.error(f"Metastore query failed: {str(e)}")
        return []

@app.route('/foreign_keys', methods=['GET'])
def get_foreign_keys():
    """API endpoint to get foreign keys for a table"""
    try:
        # Get parameters from query string
        database = request.args.get('db')
        table = request.args.get('table')
        
        if not database or not table:
            return jsonify({'error': 'Both db and table parameters are required'}), 400
        
        logger.info(f"Getting foreign keys for {database}.{table}")
        
        # Get foreign keys
        foreign_keys = get_foreign_keys_from_hive(database, table)
        
        return jsonify(foreign_keys)
        
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({'error': f'Failed to retrieve foreign keys: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        with get_hive_connection():
            return jsonify({'status': 'healthy', 'hive_connection': 'ok'})
    except Exception as e:
        return jsonify({
            'status': 'unhealthy', 
            'hive_connection': 'failed',
            'error': str(e)
        }), 503

@app.route('/debug/<database>/<table>', methods=['GET'])
def debug_table_info(database, table):
    """Debug endpoint to see all available table metadata"""
    try:
        debug_info = {}
        
        with get_hive_connection() as conn:
            cursor = conn.cursor()
            
            # Get SHOW CREATE TABLE output
            try:
                cursor.execute(f"SHOW CREATE TABLE {database}.{table}")
                create_table = cursor.fetchall()
                debug_info['create_table'] = [str(row[0]) for row in create_table if row]
            except Exception as e:
                debug_info['create_table_error'] = str(e)
            
            # Get DESCRIBE FORMATTED output
            try:
                cursor.execute(f"DESCRIBE FORMATTED {database}.{table}")
                formatted_desc = cursor.fetchall()
                debug_info['describe_formatted'] = [[str(col) if col else None for col in row] for row in formatted_desc]
            except Exception as e:
                debug_info['describe_formatted_error'] = str(e)
            
            # Try SHOW CONSTRAINTS
            try:
                cursor.execute(f"SHOW CONSTRAINTS {database}.{table}")
                constraints = cursor.fetchall()
                debug_info['show_constraints'] = [[str(col) if col else None for col in row] for row in constraints]
            except Exception as e:
                debug_info['show_constraints_error'] = str(e)
            
            # Get table properties
            try:
                cursor.execute(f"SHOW TBLPROPERTIES {database}.{table}")
                properties = cursor.fetchall()
                debug_info['table_properties'] = [[str(col) if col else None for col in row] for row in properties]
            except Exception as e:
                debug_info['table_properties_error'] = str(e)
        
        return jsonify({
            'database': database,
            'table': table,
            'debug_info': debug_info
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Debug failed: {str(e)}'
        }), 500
    """List all tables in a database"""
    try:
        with get_hive_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"SHOW TABLES IN {database}")
            tables = [row[0] for row in cursor.fetchall()]
            
            return jsonify({
                'database': database,
                'tables': tables,
                'count': len(tables)
            })
            
    except Exception as e:
        logger.error(f"Error listing tables: {str(e)}")
        return jsonify({
            'error': f'Failed to list tables: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Test connection on startup
    try:
        with get_hive_connection():
            logger.info("Hive connection test successful")
    except Exception as e:
        logger.error(f"Failed to connect to Hive on startup: {str(e)}")
        logger.error("Please check your Hive configuration and ensure the container is running")
    
    app.run(host='0.0.0.0', port=5000, debug=True)