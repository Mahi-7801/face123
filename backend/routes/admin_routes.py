from datetime import datetime, date
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Admin, Employee, SalaryPayment, Log
from auth import hash_password, verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class AdminProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


@router.get("/profile")
def get_admin_profile(
    payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    admin = db.query(Admin).filter(Admin.id == payload["id"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {
        "success": True,
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
        },
    }


@router.put("/profile")
def update_admin_profile(
    data: AdminProfileUpdate,
    payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    admin = db.query(Admin).filter(Admin.id == payload["id"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if data.full_name is not None:
        admin.full_name = data.full_name
    if data.email is not None:
        existing = db.query(Admin).filter(Admin.email == data.email, Admin.id != admin.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        admin.email = data.email

    if data.current_password and data.new_password:
        if not verify_password(data.current_password, admin.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        admin.password_hash = hash_password(data.new_password)

    db.commit()
    return {"success": True, "message": "Profile updated successfully"}


@router.get("/employees")
def get_all_employees(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    employees = db.query(
        Employee.employee_id,
        Employee.employee_name,
        Employee.department,
        Employee.designation,
        Employee.email,
        Employee.phone,
        Employee.is_active,
        Employee.salary,
        Employee.bank_name,
        Employee.bank_account,
        Employee.ifsc_code,
        Employee.uan_number,
        Employee.pf_number,
        Employee.joining_date,
    ).order_by(Employee.employee_name).all()

    return {
        "success": True,
        "employees": [
            {
                "employee_id": e.employee_id,
                "employee_name": e.employee_name,
                "department": e.department,
                "designation": e.designation,
                "email": e.email,
                "phone": e.phone,
                "is_active": e.is_active,
                "salary": float(e.salary) if e.salary else 0,
                "bank_name": e.bank_name,
                "bank_account": e.bank_account,
                "ifsc_code": e.ifsc_code,
                "uan_number": e.uan_number,
                "pf_number": e.pf_number,
                "joining_date": str(e.joining_date) if e.joining_date else None,
            }
            for e in employees
        ],
    }


@router.get("/salary/payments")
def get_all_salary_payments(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    employee_id: str = Query(None),
    month: int = Query(None),
    year: int = Query(None),
):
    q = db.query(SalaryPayment)
    if employee_id:
        q = q.filter(SalaryPayment.employee_id == employee_id)
    if month:
        q = q.filter(SalaryPayment.month == month)
    if year:
        q = q.filter(SalaryPayment.year == year)
    payments = q.order_by(SalaryPayment.year.desc(), SalaryPayment.month.desc()).all()

    return {
        "success": True,
        "payments": [
            {
                "id": p.id,
                "employee_id": p.employee_id,
                "employee_name": p.employee_name,
                "month": p.month,
                "year": p.year,
                "amount": float(p.amount),
                "deductions": float(p.deductions),
                "net_amount": float(p.net_amount),
                "status": p.status,
                "payment_date": str(p.payment_date) if p.payment_date else None,
                "remarks": p.remarks,
            }
            for p in payments
        ],
    }


class SalaryPaymentCreate(BaseModel):
    employee_id: str
    month: int
    year: int
    amount: float
    deductions: float = 0
    status: str = "Pending"
    payment_date: Optional[str] = None
    remarks: Optional[str] = None


@router.post("/salary/payments")
def create_salary_payment(
    data: SalaryPaymentCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    emp = db.query(Employee).filter(Employee.employee_id == data.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(SalaryPayment).filter(
        SalaryPayment.employee_id == data.employee_id,
        SalaryPayment.month == data.month,
        SalaryPayment.year == data.year,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Payment already exists for this period")

    pd = None
    if data.payment_date:
        try:
            pd = datetime.strptime(data.payment_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    payment = SalaryPayment(
        employee_id=data.employee_id,
        employee_name=emp.employee_name,
        month=data.month,
        year=data.year,
        amount=data.amount,
        deductions=data.deductions,
        net_amount=data.amount - data.deductions,
        status=data.status,
        payment_date=pd or date.today(),
        remarks=data.remarks,
    )
    db.add(payment)

    log = Log(
        log_type="system",
        employee_id=data.employee_id,
        employee_name=emp.employee_name,
        message=f"Salary payment of ₹{data.amount - data.deductions:,.2f} for {data.month}/{data.year} added",
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": "Salary payment added successfully"}


@router.put("/salary/payments/{payment_id}")
def update_salary_payment(
    payment_id: int,
    data: SalaryPaymentCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    payment = db.query(SalaryPayment).filter(SalaryPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.month = data.month
    payment.year = data.year
    payment.amount = data.amount
    payment.deductions = data.deductions
    payment.net_amount = data.amount - data.deductions
    payment.status = data.status
    if data.payment_date:
        try:
            payment.payment_date = datetime.strptime(data.payment_date, "%Y-%m-%d").date()
        except ValueError:
            pass
    payment.remarks = data.remarks
    db.commit()

    return {"success": True, "message": "Salary payment updated successfully"}


@router.delete("/salary/payments/{payment_id}")
def delete_salary_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    payment = db.query(SalaryPayment).filter(SalaryPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()
    return {"success": True, "message": "Salary payment deleted"}


@router.get("/logs")
def get_system_logs(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    log_type: str = Query(None),
    employee_id: str = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
):
    q = db.query(Log)
    if log_type:
        q = q.filter(Log.log_type == log_type)
    if employee_id:
        q = q.filter(Log.employee_id == employee_id)
    total = q.count()
    logs = q.order_by(Log.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "success": True,
        "total": total,
        "logs": [
            {
                "id": l.id,
                "log_type": l.log_type,
                "employee_id": l.employee_id,
                "employee_name": l.employee_name,
                "message": l.message,
                "confidence_score": float(l.confidence_score) if l.confidence_score else None,
                "ip_address": l.ip_address,
                "created_at": str(l.created_at),
            }
            for l in logs
        ],
    }
