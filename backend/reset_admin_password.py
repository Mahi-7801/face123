"""
Resets the admin password to a known value.
Run: python reset_admin_password.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Admin, engine, Base
from auth import hash_password

ADMIN_USERNAME   = "admin"
NEW_PASSWORD     = "admin@123"

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == ADMIN_USERNAME).first()
        if not admin:
            print(f"[!] Admin '{ADMIN_USERNAME}' not found. Run create_admin.py first.")
            return

        admin.password_hash = hash_password(NEW_PASSWORD)
        db.commit()

        print("=" * 45)
        print("  Password reset successfully!")
        print("=" * 45)
        print(f"  Username : {admin.username}")
        print(f"  Password : {NEW_PASSWORD}")
        print(f"  Email    : {admin.email}")
        print("=" * 45)
        print("  Login at: http://localhost:5173/login")
        print("=" * 45)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
