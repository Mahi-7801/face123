from sqlalchemy import create_engine, Column, Integer, String, Text, Date, Time, Boolean, DECIMAL, Enum, TIMESTAMP, UniqueConstraint, Index, func, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), unique=True, nullable=False)
    employee_name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    password_hash = Column(String(255))
    joining_date = Column(Date)
    face_image_path = Column(String(500))
    face_encoding_path = Column(String(500))
    is_active = Column(Boolean, default=True)
    salary = Column(DECIMAL(12, 2), default=0.00)
    bank_name = Column(String(255))
    bank_account = Column(String(50))
    ifsc_code = Column(String(20))
    uan_number = Column(String(50))
    pf_number = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_employee_id", "employee_id"),
        Index("idx_department", "department"),
        Index("idx_is_active", "is_active"),
    )


class SalaryPayment(Base):
    __tablename__ = "salary_payments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), nullable=False)
    employee_name = Column(String(255), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    deductions = Column(DECIMAL(12, 2), default=0.00)
    net_amount = Column(DECIMAL(12, 2), nullable=False)
    status = Column(Enum("Paid", "Pending", "Cancelled", native_enum=False), default="Pending")
    payment_date = Column(Date)
    remarks = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("idx_salary_employee", "employee_id"),
        Index("idx_salary_month_year", "month", "year"),
        UniqueConstraint("employee_id", "month", "year", name="unique_salary"),
    )

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), nullable=False)
    employee_name = Column(String(255), nullable=False)
    attendance_date = Column(Date, nullable=False)
    attendance_time = Column(Time, nullable=False)
    check_out_time = Column(Time, nullable=True)
    total_hours = Column(DECIMAL(4, 1), nullable=True)
    status = Column(Enum("Present", "Absent", "Late", "Half-Day", native_enum=False), default="Present")
    confidence_score = Column(DECIMAL(5, 2))
    check_out_confidence = Column(DECIMAL(5, 2))
    camera_device = Column(String(255))
    ip_address = Column(String(45))
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("idx_att_employee_id", "employee_id"),
        Index("idx_attendance_date", "attendance_date"),
        Index("idx_att_status", "status"),
        UniqueConstraint("employee_id", "attendance_date", name="unique_attendance"),
    )

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    log_type = Column(Enum("recognition", "failed_attempt", "registration", "system", "error", native_enum=False), nullable=False)
    employee_id = Column(String(50))
    employee_name = Column(String(255))
    message = Column(Text, nullable=False)
    confidence_score = Column(DECIMAL(5, 2))
    image_path = Column(String(500))
    ip_address = Column(String(45))
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("idx_log_type", "log_type"),
        Index("idx_log_created_at", "created_at"),
        Index("idx_log_employee_id", "employee_id"),
    )

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), nullable=False)
    employee_name = Column(String(255), nullable=False)
    leave_type = Column(Enum("Sick", "Casual", "Earned", "Other", native_enum=False), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(Enum("Pending", "Approved", "Rejected", native_enum=False), default="Pending")
    admin_remarks = Column(Text)
    applied_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    __table_args__ = (
        Index("idx_leave_employee", "employee_id"),
        Index("idx_leave_status", "status"),
        Index("idx_leave_dates", "start_date", "end_date"),
    )


class LeaveBalance(Base):
    __tablename__ = "leave_balances"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    sick_leave = Column(Integer, default=12)
    casual_leave = Column(Integer, default=12)
    earned_leave = Column(Integer, default=0)
    __table_args__ = (
        UniqueConstraint("employee_id", "year", name="unique_leave_balance"),
    )


class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    is_optional = Column(Boolean, default=False)
    year = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    __table_args__ = (Index("idx_holiday_date", "date"),)


class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    late_threshold = Column(Integer, default=15)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())


class EmployeeShift(Base):
    __tablename__ = "employee_shifts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), nullable=False, unique=True)
    shift_id = Column(Integer, nullable=False)
    effective_from = Column(Date, server_default=func.current_date())
    created_at = Column(TIMESTAMP, server_default=func.now())
    __table_args__ = (
        Index("idx_empshift_employee", "employee_id"),
        Index("idx_empshift_shift", "shift_id"),
    )


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(Enum("Low", "Normal", "High", native_enum=False), default="Normal")
    created_by = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class EmployeeDocument(Base):
    __tablename__ = "employee_documents"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String(50), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    __table_args__ = (Index("idx_doc_employee", "employee_id"),)


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        from auth import hash_password
        session = SessionLocal()
        try:
            existing = session.query(Admin).filter(
                (Admin.username == "admin") | (Admin.email == "pmahi7801@gmail.com")
            ).first()
            if not existing:
                admin = Admin(
                    username="admin",
                    email="pmahi7801@gmail.com",
                    password_hash=hash_password("7418520963"),
                    full_name="System Administrator",
                )
                session.add(admin)
                session.commit()
                print("Default admin created (pmahi7801@gmail.com / 7418520963)")
            else:
                existing.email = "pmahi7801@gmail.com"
                existing.password_hash = hash_password("7418520963")
                session.commit()
                print("Admin credentials updated")
        except Exception as e:
            session.rollback()
            print(f"Admin creation skipped: {e}")
        finally:
            session.close()
    except Exception as e:
        print(f"Database initialization failed (server will boot anyway): {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
