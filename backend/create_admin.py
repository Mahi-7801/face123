"""
Run this script once to create the admin account in Supabase.
Usage: python create_admin.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Admin, engine, Base
from auth import hash_password

# ── Admin credentials ─────────────────────────────────────────
ADMIN_USERNAME  = "admin"
ADMIN_EMAIL     = "admin@facetrack.com"
ADMIN_PASSWORD  = "admin@123"
ADMIN_FULL_NAME = "Administrator"
# ─────────────────────────────────────────────────────────────

def main():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(
            (Admin.username == ADMIN_USERNAME) | (Admin.email == ADMIN_EMAIL)
        ).first()

        if existing:
            print(f"[!] Admin '{existing.username}' already exists. No changes made.")
            return

        admin = Admin(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            full_name=ADMIN_FULL_NAME,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("=" * 45)
        print("  Admin account created successfully!")
        print("=" * 45)
        print(f"  Username : {ADMIN_USERNAME}")
        print(f"  Password : {ADMIN_PASSWORD}")
        print(f"  Email    : {ADMIN_EMAIL}")
        print(f"  ID       : {admin.id}")
        print("=" * 45)
        print("  Login at: http://localhost:5173/login")
        print("=" * 45)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to create admin: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
