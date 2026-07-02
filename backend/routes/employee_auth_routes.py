from datetime import datetime, date, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Employee, Attendance, SalaryPayment, Log
from auth import hash_password, verify_password, create_access_token, get_current_employee

router = APIRouter(prefix="/api/employee", tags=["Employee"])


class EmployeeLoginRequest(BaseModel):
    employee_id: str
    password: str


class EmployeeUpdateProfile(BaseModel):
    employee_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


@router.post("/login")
def employee_login(request: EmployeeLoginRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == request.employee_id).first()
    if not emp:
        raise HTTPException(status_code=401, detail="Invalid employee ID or password")
    if not emp.password_hash:
        raise HTTPException(status_code=401, detail="Account not set up for login. Contact admin.")
    if not verify_password(request.password, emp.password_hash):
        raise HTTPException(status_code=401, detail="Invalid employee ID or password")
    if not emp.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact admin.")

    token = create_access_token({
        "id": emp.id,
        "employee_id": emp.employee_id,
        "role": "employee",
    })
    return {
        "success": True,
        "token": token,
        "employee": {
            "employee_id": emp.employee_id,
            "employee_name": emp.employee_name,
            "department": emp.department,
            "designation": emp.designation,
            "email": emp.email,
            "phone": emp.phone,
        },
    }


@router.get("/me")
def get_employee_profile(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    emp = db.query(Employee).filter(Employee.employee_id == payload["employee_id"]).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {
        "success": True,
        "employee": {
            "employee_id": emp.employee_id,
            "employee_name": emp.employee_name,
            "department": emp.department,
            "designation": emp.designation,
            "phone": emp.phone,
            "email": emp.email,
            "joining_date": str(emp.joining_date) if emp.joining_date else None,
            "salary": float(emp.salary) if emp.salary else 0,
            "bank_name": emp.bank_name,
            "bank_account": emp.bank_account,
            "ifsc_code": emp.ifsc_code,
            "uan_number": emp.uan_number,
            "pf_number": emp.pf_number,
            "is_active": emp.is_active,
        },
    }


@router.put("/profile")
def update_employee_profile(
    data: EmployeeUpdateProfile,
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    emp = db.query(Employee).filter(Employee.employee_id == payload["employee_id"]).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if data.employee_name:
        emp.employee_name = data.employee_name
    if data.phone is not None:
        emp.phone = data.phone
    if data.email is not None:
        emp.email = data.email

    if data.current_password and data.new_password:
        if not verify_password(data.current_password, emp.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        emp.password_hash = hash_password(data.new_password)

    db.commit()
    return {"success": True, "message": "Profile updated successfully"}


@router.get("/dashboard")
def get_employee_dashboard(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    emp_id = payload["employee_id"]
    today = date.today()

    total_present = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == emp_id,
    ).scalar() or 0

    this_month_present = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == emp_id,
        func.extract('month', Attendance.attendance_date) == today.month,
        func.extract('year', Attendance.attendance_date) == today.year,
    ).scalar() or 0

    today_marked = db.query(Attendance).filter(
        Attendance.employee_id == emp_id,
        Attendance.attendance_date == today,
    ).first()

    recent_attendance = db.query(Attendance).filter(
        Attendance.employee_id == emp_id,
    ).order_by(Attendance.attendance_date.desc()).limit(10).all()

    month_ago = today - timedelta(days=30)
    calendar_data = db.query(Attendance.attendance_date, Attendance.status).filter(
        Attendance.employee_id == emp_id,
        Attendance.attendance_date >= month_ago,
        Attendance.attendance_date <= today,
    ).order_by(Attendance.attendance_date).all()

    return {
        "success": True,
        "dashboard": {
            "total_present": total_present,
            "this_month_present": this_month_present,
            "today_marked": bool(today_marked),
            "today_record": {
                "status": today_marked.status,
                "check_in": str(today_marked.attendance_time),
                "check_out": str(today_marked.check_out_time) if today_marked and today_marked.check_out_time else None,
                "total_hours": float(today_marked.total_hours) if today_marked and today_marked.total_hours else None,
                "confidence": float(today_marked.confidence_score) if today_marked and today_marked.confidence_score else None,
                "check_out_confidence": float(today_marked.check_out_confidence) if today_marked and today_marked.check_out_confidence else None,
            } if today_marked else None,
            "recent_attendance": [
                {
                    "date": str(a.attendance_date),
                    "check_in": str(a.attendance_time),
                    "check_out": str(a.check_out_time) if a.check_out_time else None,
                    "total_hours": float(a.total_hours) if a.total_hours else None,
                    "status": a.status,
                }
                for a in recent_attendance
            ],
            "calendar_data": [
                {"date": str(c.attendance_date), "status": c.status}
                for c in calendar_data
            ],
        },
    }


@router.get("/salary")
def get_employee_salary(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
    year: int = Query(None),
):
    emp = db.query(Employee).filter(Employee.employee_id == payload["employee_id"]).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    query = db.query(SalaryPayment).filter(
        SalaryPayment.employee_id == payload["employee_id"],
    )
    if year:
        query = query.filter(SalaryPayment.year == year)
    payments = query.order_by(SalaryPayment.year.desc(), SalaryPayment.month.desc()).all()

    return {
        "success": True,
        "current_salary": float(emp.salary) if emp.salary else 0,
        "bank_name": emp.bank_name,
        "bank_account": emp.bank_account,
        "ifsc_code": emp.ifsc_code,
        "uan_number": emp.uan_number,
        "pf_number": emp.pf_number,
        "payments": [
            {
                "id": p.id,
                "month": p.month,
                "year": p.year,
                "amount": float(p.amount),
                "deductions": float(p.deductions),
                "net_amount": float(p.net_amount),
                "status": p.status,
                "payment_date": str(p.payment_date) if p.payment_date else None,
            }
            for p in payments
        ],
    }


@router.get("/attendance/calendar")
def get_employee_calendar(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
    month: int = Query(None),
    year: int = Query(None),
):
    today = date.today()
    m = month or today.month
    y = year or today.year

    records = db.query(Attendance).filter(
        Attendance.employee_id == payload["employee_id"],
        func.extract('month', Attendance.attendance_date) == m,
        func.extract('year', Attendance.attendance_date) == y,
    ).order_by(Attendance.attendance_date).all()

    days_in_month = [0, 31, 29 if y % 4 == 0 and (y % 100 != 0 or y % 400 == 0) else 28,
                     31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    total_days = days_in_month[m]

    present_days = [r.attendance_date.day for r in records if r.status == "Present"]
    late_days = [r.attendance_date.day for r in records if r.status == "Late"]
    half_days = [r.attendance_date.day for r in records if r.status == "Half-Day"]

    return {
        "success": True,
        "calendar": {
            "month": m,
            "year": y,
            "total_days": total_days,
            "present_days": present_days,
            "late_days": late_days,
            "half_days": half_days,
            "records": [
                {
                    "day": r.attendance_date.day,
                    "status": r.status,
                    "check_in": str(r.attendance_time),
                    "check_out": str(r.check_out_time) if r.check_out_time else None,
                    "total_hours": float(r.total_hours) if r.total_hours else None,
                }
                for r in records
            ],
        },
    }
