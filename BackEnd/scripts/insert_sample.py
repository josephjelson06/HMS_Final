import sys
import os

# Add the project directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text

def insert_data():
    with engine.begin() as conn:
        conn.execute(text("""
            DO $$
            DECLARE
                new_role_id UUID;
            BEGIN
                -- 1. Insert a dummy role to satisfy the foreign key constraint
                INSERT INTO platform_roles (name) 
                VALUES ('Dummy Role 2') 
                RETURNING id INTO new_role_id;

                -- 2. Insert the dummy platform user
                INSERT INTO platform_users (email, phone, name, password_hash, role_id) 
                VALUES ('sample.user2@example.com', '+1234567890', 'Sample User', 'hashed_password_123', new_role_id);
            END
            $$;
        """))
    print("Sample data inserted successfully into platform_users!")

if __name__ == "__main__":
    insert_data()
