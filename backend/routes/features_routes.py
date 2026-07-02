import os, uuid
from datetime import datetime, date, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Employee, Log, LeaveRequest, LeaveBalance, Holiday, Shift, EmployeeShift, Announcement, EmployeeDocument, Attendance
from auth import get_current_admin, get_current_employee, hash_password
from config import UPLOAD_DIR

router = APIRouter(tags=["Features"])

DOCUMENT_DIR = os.path.join(UPLOAD_DIR, "documents")
os.makedirs(DOCUMENT_DIR, exist_ok=True)

# ==================== LEAVES (Admin + Employee) ====================

class LeaveApplyRequest(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    reason: str

class LeaveStatusUpdate(BaseModel):
    status: str
    admin_remarks: Optional[str] = None


@router.post("/api/leaves/apply")
def apply_leave(
    data: LeaveApplyRequest,
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    emp = db.query(Employee).filter(Employee.employee_id == payload["employee_id"]).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    sd = datetime.strptime(data.start_date, "%Y-%m-%d").date()
    ed = datetime.strptime(data.end_date, "%Y-%m-%d").date()
    if ed < sd:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    total_days = (ed - sd).days + 1

    if data.leave_type not in ["Sick", "Casual", "Earned", "Other"]:
        raise HTTPException(status_code=400, detail="Invalid leave type")

    if data.leave_type != "Other":
        bal = db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == payload["employee_id"],
            LeaveBalance.year == sd.year,
        ).first()
        if bal:
            available = 0
            if data.leave_type == "Sick": available = bal.sick_leave
            elif data.leave_type == "Casual": available = bal.casual_leave
            elif data.leave_type == "Earned": available = bal.earned_leave
            if total_days > available:
                raise HTTPException(status_code=400, detail=f"Insufficient {data.leave_type} leave balance. Available: {available}")

    leave = LeaveRequest(
        employee_id=payload["employee_id"],
        employee_name=emp.employee_name,
        leave_type=data.leave_type,
        start_date=sd,
        end_date=ed,
        total_days=total_days,
        reason=data.reason,
    )
    db.add(leave)
    db.commit()
    return {"success": True, "message": "Leave applied successfully", "id": leave.id}


@router.get("/api/leaves/my")
def get_my_leaves(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
    status: str = Query(None),
):
    q = db.query(LeaveRequest).filter(LeaveRequest.employee_id == payload["employee_id"])
    if status:
        q = q.filter(LeaveRequest.status == status)
    leaves = q.order_by(LeaveRequest.applied_at.desc()).all()
    return {
        "success": True,
        "leaves": [
            {
                "id": l.id,
                "leave_type": l.leave_type,
                "start_date": str(l.start_date),
                "end_date": str(l.end_date),
                "total_days": l.total_days,
                "reason": l.reason,
                "status": l.status,
                "admin_remarks": l.admin_remarks,
                "applied_at": str(l.applied_at),
            }
            for l in leaves
        ],
    }


@router.get("/api/leaves/balance")
def get_leave_balance(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    today = date.today()
    bal = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == payload["employee_id"],
        LeaveBalance.year == today.year,
    ).first()
    if not bal:
        bal = LeaveBalance(employee_id=payload["employee_id"], year=today.year)
        db.add(bal)
        db.commit()
    return {
        "success": True,
        "balance": {
            "sick_leave": bal.sick_leave,
            "casual_leave": bal.casual_leave,
            "earned_leave": bal.earned_leave,
            "year": bal.year,
        },
    }


@router.get("/api/admin/leaves")
def get_all_leaves(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    status: str = Query(None),
    employee_id: str = Query(None),
):
    q = db.query(LeaveRequest)
    if status:
        q = q.filter(LeaveRequest.status == status)
    if employee_id:
        q = q.filter(LeaveRequest.employee_id == employee_id)
    leaves = q.order_by(LeaveRequest.applied_at.desc()).all()
    return {
        "success": True,
        "leaves": [
            {
                "id": l.id,
                "employee_id": l.employee_id,
                "employee_name": l.employee_name,
                "leave_type": l.leave_type,
                "start_date": str(l.start_date),
                "end_date": str(l.end_date),
                "total_days": l.total_days,
                "reason": l.reason,
                "status": l.status,
                "admin_remarks": l.admin_remarks,
                "applied_at": str(l.applied_at),
            }
            for l in leaves
        ],
    }


@router.put("/api/admin/leaves/{leave_id}/status")
def update_leave_status(
    leave_id: int,
    data: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if data.status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    leave.status = data.status
    if data.admin_remarks:
        leave.admin_remarks = data.admin_remarks

    if data.status == "Approved" and leave.leave_type != "Other":
        bal = db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == leave.employee_id,
            LeaveBalance.year == leave.start_date.year,
        ).first()
        if bal:
            if leave.leave_type == "Sick": bal.sick_leave -= leave.total_days
            elif leave.leave_type == "Casual": bal.casual_leave -= leave.total_days
            elif leave.leave_type == "Earned": bal.earned_leave -= leave.total_days

    log = Log(log_type="system", employee_id=leave.employee_id, employee_name=leave.employee_name,
              message=f"Leave {data.status}: {leave.leave_type} ({leave.start_date} to {leave.end_date})")
    db.add(log)
    db.commit()
    return {"success": True, "message": f"Leave {data.status}"}


# ==================== HOLIDAYS ====================

class HolidayCreate(BaseModel):
    date: str
    name: str
    is_optional: bool = False


@router.get("/api/holidays")
def get_holidays(
    db: Session = Depends(get_db),
    year: int = Query(None),
):
    q = db.query(Holiday)
    if year:
        q = q.filter(Holiday.year == year)
    else:
        q = q.filter(Holiday.year == date.today().year)
    holidays = q.order_by(Holiday.date).all()
    return {
        "success": True,
        "holidays": [
            {"id": h.id, "date": str(h.date), "name": h.name, "is_optional": h.is_optional, "year": h.year}
            for h in holidays
        ],
    }


@router.post("/api/admin/holidays")
def create_holiday(
    data: HolidayCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    d = datetime.strptime(data.date, "%Y-%m-%d").date()
    existing = db.query(Holiday).filter(Holiday.date == d).first()
    if existing:
        raise HTTPException(status_code=400, detail="Holiday already exists for this date")
    hol = Holiday(date=d, name=data.name, is_optional=data.is_optional, year=d.year)
    db.add(hol)
    db.commit()
    return {"success": True, "message": "Holiday added"}


@router.delete("/api/admin/holidays/{holiday_id}")
def delete_holiday(
    holiday_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    hol = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not hol:
        raise HTTPException(status_code=404, detail="Holiday not found")
    db.delete(hol)
    db.commit()
    return {"success": True, "message": "Holiday deleted"}


# ==================== SHIFTS ====================

class ShiftCreate(BaseModel):
    name: str
    start_time: str
    end_time: str
    late_threshold: int = 15
    description: Optional[str] = None


@router.get("/api/shifts")
def get_shifts(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    shifts = db.query(Shift).order_by(Shift.name).all()
    return {
        "success": True,
        "shifts": [
            {
                "id": s.id, "name": s.name, "start_time": str(s.start_time),
                "end_time": str(s.end_time), "late_threshold": s.late_threshold,
                "description": s.description, "is_active": s.is_active,
            }
            for s in shifts
        ],
    }


@router.post("/api/admin/shifts")
def create_shift(
    data: ShiftCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    existing = db.query(Shift).filter(Shift.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Shift name already exists")
    st = datetime.strptime(data.start_time, "%H:%M").time()
    et = datetime.strptime(data.end_time, "%H:%M").time()
    shift = Shift(name=data.name, start_time=st, end_time=et, late_threshold=data.late_threshold, description=data.description)
    db.add(shift)
    db.commit()
    return {"success": True, "message": "Shift created"}


@router.put("/api/admin/shifts/{shift_id}")
def update_shift(
    shift_id: int,
    data: ShiftCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    shift.name = data.name
    shift.start_time = datetime.strptime(data.start_time, "%H:%M").time()
    shift.end_time = datetime.strptime(data.end_time, "%H:%M").time()
    shift.late_threshold = data.late_threshold
    shift.description = data.description
    db.commit()
    return {"success": True, "message": "Shift updated"}


@router.delete("/api/admin/shifts/{shift_id}")
def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(shift)
    db.query(EmployeeShift).filter(EmployeeShift.shift_id == shift_id).delete()
    db.commit()
    return {"success": True, "message": "Shift deleted"}


@router.put("/api/admin/employees/{employee_id}/shift")
def assign_shift(
    employee_id: str,
    shift_id: int = Form(...),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    es = db.query(EmployeeShift).filter(EmployeeShift.employee_id == employee_id).first()
    if es:
        es.shift_id = shift_id
    else:
        es = EmployeeShift(employee_id=employee_id, shift_id=shift_id)
        db.add(es)
    db.commit()
    return {"success": True, "message": f"Shift assigned to {employee_id}"}


@router.get("/api/employee/shift")
def get_my_shift(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    es = db.query(EmployeeShift).filter(EmployeeShift.employee_id == payload["employee_id"]).first()
    if not es:
        return {"success": True, "shift": None}
    shift = db.query(Shift).filter(Shift.id == es.shift_id).first()
    if not shift:
        return {"success": True, "shift": None}
    return {
        "success": True,
        "shift": {
            "id": shift.id, "name": shift.name,
            "start_time": str(shift.start_time), "end_time": str(shift.end_time),
            "late_threshold": shift.late_threshold, "description": shift.description,
        },
    }


# ==================== ANNOUNCEMENTS ====================

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    priority: str = "Normal"


@router.get("/api/announcements")
def get_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20),
):
    anns = db.query(Announcement).order_by(Announcement.created_at.desc()).limit(limit).all()
    return {
        "success": True,
        "announcements": [
            {
                "id": a.id, "title": a.title, "message": a.message,
                "priority": a.priority, "created_by": a.created_by,
                "created_at": str(a.created_at),
            }
            for a in anns
        ],
    }


@router.post("/api/admin/announcements")
def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ann = Announcement(title=data.title, message=data.message, priority=data.priority, created_by=admin.get("username", "Admin"))
    db.add(ann)
    db.commit()
    return {"success": True, "message": "Announcement posted"}


@router.delete("/api/admin/announcements/{ann_id}")
def delete_announcement(
    ann_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"success": True, "message": "Announcement deleted"}


# ==================== DOCUMENTS ====================

@router.post("/api/admin/documents/upload")
async def upload_document(
    employee_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}:
        raise HTTPException(status_code=400, detail="Invalid file type")
    content = await file.read()
    fname = f"{employee_id}_{uuid.uuid4().hex}{ext}"
    fpath = os.path.join(DOCUMENT_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(content)
    doc = EmployeeDocument(employee_id=employee_id, document_type=document_type, file_name=file.filename, file_path=f"uploads/documents/{fname}")
    db.add(doc)
    db.commit()
    return {"success": True, "message": "Document uploaded"}


@router.get("/api/admin/documents")
def get_all_documents(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    employee_id: str = Query(None),
):
    q = db.query(EmployeeDocument)
    if employee_id:
        q = q.filter(EmployeeDocument.employee_id == employee_id)
    docs = q.order_by(EmployeeDocument.uploaded_at.desc()).all()
    return {
        "success": True,
        "documents": [
            {
                "id": d.id, "employee_id": d.employee_id,
                "document_type": d.document_type, "file_name": d.file_name,
                "file_path": d.file_path, "uploaded_at": str(d.uploaded_at),
            }
            for d in docs
        ],
    }


@router.get("/api/employee/documents")
def get_my_documents(
    payload: dict = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    docs = db.query(EmployeeDocument).filter(
        EmployeeDocument.employee_id == payload["employee_id"]
    ).order_by(EmployeeDocument.uploaded_at.desc()).all()
    return {
        "success": True,
        "documents": [
            {
                "id": d.id, "document_type": d.document_type,
                "file_name": d.file_name, "uploaded_at": str(d.uploaded_at),
            }
            for d in docs
        ],
    }


@router.delete("/api/admin/documents/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    doc = db.query(EmployeeDocument).filter(EmployeeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    fpath = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", doc.file_path)
    if os.path.exists(fpath):
        os.remove(fpath)
    db.delete(doc)
    db.commit()
    return {"success": True, "message": "Document deleted"}


# ==================== DEPARTMENT REPORTS ====================

@router.get("/api/admin/reports/departments")
def get_department_reports(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    start_date: str = Query(None),
    end_date: str = Query(None),
    month: int = Query(None),
    year: int = Query(None),
):
    today = date.today()
    sd = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else today.replace(day=1)
    ed = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else today
    if month and year:
        import calendar
        sd = date(year, month, 1)
        ed = date(year, month, calendar.monthrange(year, month)[1])

    depts = db.query(Employee.department, func.count(Employee.id).label("total")).filter(
        Employee.is_active == True
    ).group_by(Employee.department).all()

    result = []
    for dept in depts:
        total_emp = dept.total
        present_count = db.query(func.count(Attendance.id)).filter(
            Attendance.attendance_date.between(sd, ed),
            Attendance.employee_id.in_(
                db.query(Employee.employee_id).filter(Employee.department == dept.department)
            ),
        ).scalar() or 0
        total_working_days = (ed - sd).days + 1
        expected = total_emp * total_working_days
        attendance_pct = round(present_count / expected * 100, 1) if expected > 0 else 0

        late_count = db.query(func.count(Attendance.id)).filter(
            Attendance.attendance_date.between(sd, ed),
            Attendance.status == "Late",
            Attendance.employee_id.in_(
                db.query(Employee.employee_id).filter(Employee.department == dept.department)
            ),
        ).scalar() or 0

        result.append({
            "department": dept.department,
            "total_employees": total_emp,
            "present_count": present_count,
            "late_count": late_count,
            "expected_attendance": expected,
            "attendance_percentage": attendance_pct,
        })

    return {"success": True, "from": str(sd), "to": str(ed), "departments": result}
