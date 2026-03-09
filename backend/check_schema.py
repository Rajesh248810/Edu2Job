import os
import django
from django.conf import settings
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def check_table():
    with open('schema_output.txt', 'w') as f:
        with connection.cursor() as cursor:
            for table_name in ['certification', 'user']:
                try:
                    cursor.execute(f"DESCRIBE {table_name}")
                    columns = cursor.fetchall()
                    f.write(f"Table: {table_name}\n")
                    for col in columns:
                        f.write(f"  {col}\n")
                    
                    # Check constraints
                    f.write(f"\nConstraints for {table_name}:\n")
                    cursor.execute(f"SHOW CREATE TABLE {table_name}")
                    create_stmt = cursor.fetchone()
                    f.write(f"  {create_stmt[1]}\n\n")
                except Exception as e:
                    f.write(f"Error describing {table_name}: {e}\n")

if __name__ == "__main__":
    check_table()
