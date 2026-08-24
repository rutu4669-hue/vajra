"""
Database migration script to add ownership and visibility columns to the companies table
"""
import sys
import os
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import engine

def run_migration():
    print("Running migration for companies table...")
    with engine.connect() as conn:
        try:
            # Check dialect
            dialect_name = engine.dialect.name
            print(f"Connected to database dialect: {dialect_name}")

            if dialect_name == "postgresql":
                # PostgreSQL migrations
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);"))
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_name VARCHAR;"))
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_email VARCHAR;"))
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT TRUE;"))
                
                # Update existing records to is_global = True if null
                conn.execute(text("UPDATE companies SET is_global = TRUE WHERE is_global IS NULL;"))
                
                # Drop unique constraint on domain if present to allow user-scoped monitoring
                conn.execute(text("""
                    DO $$ 
                    DECLARE
                        r RECORD;
                    BEGIN
                        FOR r IN (
                            SELECT constraint_name 
                            FROM information_schema.table_constraints 
                            WHERE table_name = 'companies' 
                            AND constraint_type = 'UNIQUE'
                            AND constraint_name LIKE '%domain%'
                        ) LOOP
                            EXECUTE 'ALTER TABLE companies DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
                        END LOOP;
                    END $$;
                """))
                conn.commit()
                print("PostgreSQL migration completed successfully!")

            elif dialect_name == "sqlite":
                # SQLite migrations
                # Check existing columns
                cols_res = conn.execute(text("PRAGMA table_info(companies);")).fetchall()
                col_names = [col[1] for col in cols_res]
                
                if "created_by_user_id" not in col_names:
                    conn.execute(text("ALTER TABLE companies ADD COLUMN created_by_user_id INTEGER REFERENCES users(id);"))
                if "created_by_user_name" not in col_names:
                    conn.execute(text("ALTER TABLE companies ADD COLUMN created_by_user_name TEXT;"))
                if "created_by_user_email" not in col_names:
                    conn.execute(text("ALTER TABLE companies ADD COLUMN created_by_user_email TEXT;"))
                if "is_global" not in col_names:
                    conn.execute(text("ALTER TABLE companies ADD COLUMN is_global BOOLEAN DEFAULT 1;"))
                
                conn.execute(text("UPDATE companies SET is_global = 1 WHERE is_global IS NULL;"))
                conn.commit()
                print("SQLite migration completed successfully!")

        except Exception as e:
            print(f"Error during migration: {e}")
            raise e

if __name__ == "__main__":
    run_migration()
