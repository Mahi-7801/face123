import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, EMAIL_FROM, EMAIL_FROM_NAME


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[EMAIL] SMTP not configured. Would send to {to_email}: {subject}")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        print(f"[EMAIL] Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False


def send_attendance_email(employee_name: str, to_email: str, status: str, time: str, date: str, confidence: float):
    subject = f"Attendance Marked - {date}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:12px;">
        <div style="text-align:center;padding:20px 0;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px 12px 0 0;color:white;">
            <h2 style="margin:0;">FaceTrack Attendance System</h2>
        </div>
        <div style="padding:20px;">
            <p>Hello <strong>{employee_name}</strong>,</p>
            <p>Your attendance has been recorded successfully.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Date</td><td style="padding:8px;border:1px solid #e0e0e0;">{date}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Time</td><td style="padding:8px;border:1px solid #e0e0e0;">{time}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Status</td><td style="padding:8px;border:1px solid #e0e0e0;color:#22c55e;font-weight:bold;">{status}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Confidence</td><td style="padding:8px;border:1px solid #e0e0e0;">{confidence:.2f}%</td></tr>
            </table>
            <p style="color:#666;font-size:12px;">This is an automated notification from the FaceTrack Attendance System.</p>
        </div>
    </div>
    """
    return send_email(to_email, subject, html)


def send_checkout_email(employee_name: str, to_email: str, date: str, check_in: str, check_out: str, total_hours: float, status: str, overtime: float = 0):
    subject = f"Check-out Recorded - {date}"
    ot_row = ""
    if overtime > 0:
        ot_row = f'<tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;color:#f59e0b;">Overtime</td><td style="padding:8px;border:1px solid #e0e0e0;color:#f59e0b;font-weight:bold;">{overtime:.1f} hrs</td></tr>'
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:12px;">
        <div style="text-align:center;padding:20px 0;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px 12px 0 0;color:white;">
            <h2 style="margin:0;">FaceTrack Attendance System</h2>
        </div>
        <div style="padding:20px;">
            <p>Hello <strong>{employee_name}</strong>,</p>
            <p>Your check-out has been recorded. Here is your daily summary:</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Date</td><td style="padding:8px;border:1px solid #e0e0e0;">{date}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Check-in</td><td style="padding:8px;border:1px solid #e0e0e0;">{check_in}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Check-out</td><td style="padding:8px;border:1px solid #e0e0e0;">{check_out}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Total Hours</td><td style="padding:8px;border:1px solid #e0e0e0;">{total_hours:.1f} hrs</td></tr>
                {ot_row}
                <tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Status</td><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">{status}</td></tr>
            </table>
            <p style="color:#666;font-size:12px;">This is an automated notification from the FaceTrack Attendance System.</p>
        </div>
    </div>
    """
    return send_email(to_email, subject, html)


def send_welcome_email(
    employee_name: str,
    to_email: str,
    employee_id: str,
    username: str,
    password: str,
    department: str,
    designation: str,
    login_url: str = "http://localhost:5174/employee/login",
):
    subject = f"Welcome to FaceTrack — Your Login Credentials"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:white;font-size:24px;">🎉 Welcome to FaceTrack!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">AI-Powered Attendance System</p>
        </div>

        <!-- Body -->
        <div style="background:white;padding:32px 24px;">
            <p style="font-size:16px;color:#111827;">Hello <strong>{employee_name}</strong>,</p>
            <p style="color:#374151;line-height:1.6;">Your employee account has been created successfully.
            Below are your login credentials for the <strong>FaceTrack Employee Portal</strong>.
            Please keep them confidential.</p>

            <!-- Credentials box -->
            <div style="background:#f0f0ff;border:1px solid #c7d2fe;border-radius:12px;padding:24px;margin:24px 0;">
                <h3 style="margin:0 0 16px;color:#4338ca;font-size:14px;text-transform:uppercase;letter-spacing:1px;">🔐 Your Login Credentials</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;width:40%;">Employee ID</td>
                        <td style="padding:8px 0;color:#111827;font-weight:bold;font-size:13px;font-family:monospace;">{employee_id}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Username</td>
                        <td style="padding:8px 0;color:#111827;font-weight:bold;font-size:13px;font-family:monospace;">{username}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Password</td>
                        <td style="padding:8px 0;color:#111827;font-weight:bold;font-size:13px;font-family:monospace;">{password}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Department</td>
                        <td style="padding:8px 0;color:#111827;font-size:13px;">{department}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Designation</td>
                        <td style="padding:8px 0;color:#111827;font-size:13px;">{designation}</td>
                    </tr>
                </table>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin:24px 0;">
                <a href="{login_url}"
                   style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;
                          text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px;">
                    Login to Employee Portal →
                </a>
            </div>

            <p style="color:#6b7280;font-size:12px;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:16px;">
                ⚠️ Please change your password after your first login.
                This is an automated email — do not reply.
            </p>
        </div>
    </div>
    """
    return send_email(to_email, subject, html)
