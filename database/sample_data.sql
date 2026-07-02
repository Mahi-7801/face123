USE face_attendance;

INSERT INTO admin (username, email, password_hash, full_name) VALUES
('admin', 'admin@faceattendance.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', 'System Administrator');

INSERT INTO employees (employee_id, employee_name, department, designation, phone, email, password_hash, joining_date, salary, bank_name, bank_account, ifsc_code, uan_number, pf_number) VALUES
('EMP001', 'Alice Johnson', 'Engineering', 'Senior Developer', '+1-555-0101', 'alice@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-01-15', 95000.00, 'State Bank of India', 'SBIN0001234', 'SBIN0001234', 'UAN123456789', 'PFEMP001'),
('EMP002', 'Bob Smith', 'Marketing', 'Marketing Lead', '+1-555-0102', 'bob@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-03-01', 75000.00, 'HDFC Bank', 'HDFC0005678', 'HDFC0005678', 'UAN234567890', 'PFEMP002'),
('EMP003', 'Charlie Brown', 'Sales', 'Sales Executive', '+1-555-0103', 'charlie@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-06-10', 55000.00, 'ICICI Bank', 'ICICI0009012', 'ICICI0009012', 'UAN345678901', 'PFEMP003'),
('EMP004', 'Diana Prince', 'HR', 'HR Manager', '+1-555-0104', 'diana@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2022-11-20', 80000.00, 'Axis Bank', 'AXIS0003456', 'AXIS0003456', 'UAN456789012', 'PFEMP004'),
('EMP005', 'Eve Davis', 'Finance', 'Accountant', '+1-555-0105', 'eve@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-02-14', 60000.00, 'Kotak Bank', 'KOTAK0007890', 'KOTAK0007890', 'UAN567890123', 'PFEMP005'),
('EMP006', 'Frank Miller', 'Engineering', 'Frontend Developer', '+1-555-0106', 'frank@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-08-05', 70000.00, 'State Bank of India', 'SBIN0004567', 'SBIN0004567', 'UAN678901234', 'PFEMP006'),
('EMP007', 'Grace Lee', 'Design', 'UX Designer', '+1-555-0107', 'grace@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-04-22', 65000.00, 'HDFC Bank', 'HDFC0008901', 'HDFC0008901', 'UAN789012345', 'PFEMP007'),
('EMP008', 'Henry Wilson', 'Operations', 'Operations Manager', '+1-555-0108', 'henry@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2022-09-15', 78000.00, 'ICICI Bank', 'ICICI0002345', 'ICICI0002345', 'UAN890123456', 'PFEMP008'),
('EMP009', 'Ivy Chen', 'Engineering', 'Backend Developer', '+1-555-0109', 'ivy@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-07-01', 72000.00, 'Axis Bank', 'AXIS0006789', 'AXIS0006789', 'UAN901234567', 'PFEMP009'),
('EMP010', 'Jack Taylor', 'Support', 'Support Lead', '+1-555-0110', 'jack@company.com', '$2b$12$LJ3m4ys3Lz6dYx9Yx9Yx9uYx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9Yx9e', '2023-05-12', 58000.00, 'Kotak Bank', 'KOTAK0001122', 'KOTAK0001122', 'UAN012345678', 'PFEMP010');

INSERT INTO attendance (employee_id, employee_name, attendance_date, attendance_time, status, confidence_score, camera_device) VALUES
('EMP001', 'Alice Johnson', CURDATE(), '09:00:00', 'Present', 97.50, 'Webcam'),
('EMP002', 'Bob Smith', CURDATE(), '09:15:00', 'Present', 96.80, 'Webcam'),
('EMP003', 'Charlie Brown', CURDATE(), '09:30:00', 'Present', 95.20, 'Webcam'),
('EMP004', 'Diana Prince', CURDATE(), '08:55:00', 'Present', 98.10, 'Webcam'),
('EMP005', 'Eve Davis', CURDATE(), '10:00:00', 'Late', 94.50, 'Webcam'),
('EMP006', 'Frank Miller', CURDATE(), '09:10:00', 'Present', 96.00, 'Webcam');

INSERT INTO salary_payments (employee_id, employee_name, month, year, amount, deductions, net_amount, status, payment_date) VALUES
('EMP001', 'Alice Johnson', 6, 2026, 95000.00, 8500.00, 86500.00, 'Paid', '2026-07-01'),
('EMP002', 'Bob Smith', 6, 2026, 75000.00, 6800.00, 68200.00, 'Paid', '2026-07-01'),
('EMP003', 'Charlie Brown', 6, 2026, 55000.00, 5200.00, 49800.00, 'Paid', '2026-07-01'),
('EMP004', 'Diana Prince', 6, 2026, 80000.00, 7200.00, 72800.00, 'Paid', '2026-07-01'),
('EMP005', 'Eve Davis', 6, 2026, 60000.00, 5600.00, 54400.00, 'Pending', NULL),
('EMP001', 'Alice Johnson', 5, 2026, 95000.00, 8500.00, 86500.00, 'Paid', '2026-06-01'),
('EMP002', 'Bob Smith', 5, 2026, 75000.00, 6800.00, 68200.00, 'Paid', '2026-06-01'),
('EMP003', 'Charlie Brown', 5, 2026, 55000.00, 5200.00, 49800.00, 'Paid', '2026-06-01'),
('EMP004', 'Diana Prince', 5, 2026, 80000.00, 7200.00, 72800.00, 'Paid', '2026-06-01'),
('EMP005', 'Eve Davis', 5, 2026, 60000.00, 5600.00, 54400.00, 'Paid', '2026-06-01');

INSERT INTO logs (log_type, employee_id, employee_name, message, confidence_score) VALUES
('recognition', 'EMP001', 'Alice Johnson', 'Attendance marked - Present', 97.50),
('recognition', 'EMP002', 'Bob Smith', 'Attendance marked - Present', 96.80),
('recognition', 'EMP003', 'Charlie Brown', 'Attendance marked - Present', 95.20),
('failed_attempt', NULL, NULL, 'Unknown person attempted recognition', NULL),
('recognition', 'EMP004', 'Diana Prince', 'Attendance marked - Present', 98.10);

-- -----------------------------------------------------------
-- Sample Data: Leave Requests
-- -----------------------------------------------------------
INSERT INTO leave_requests (employee_id, employee_name, leave_type, start_date, end_date, total_days, reason, status, admin_remarks) VALUES
('EMP002', 'Bob Smith', 'Casual', '2026-06-15', '2026-06-16', 2, 'Family function', 'Approved', 'Approved'),
('EMP003', 'Charlie Brown', 'Sick', '2026-06-20', '2026-06-21', 2, 'Not feeling well', 'Approved', 'Take rest'),
('EMP005', 'Eve Davis', 'Earned', '2026-07-10', '2026-07-14', 5, 'Annual vacation plan', 'Approved', 'Enjoy your vacation'),
('EMP006', 'Frank Miller', 'Sick', '2026-06-25', '2026-06-25', 1, 'Doctor appointment', 'Approved', 'Approved'),
('EMP008', 'Henry Wilson', 'Casual', '2026-07-05', '2026-07-05', 1, 'Personal work', 'Pending', NULL),
('EMP009', 'Ivy Chen', 'Other', '2026-07-20', '2026-07-22', 3, 'Conference attendance', 'Pending', NULL),
('EMP001', 'Alice Johnson', 'Earned', '2026-08-01', '2026-08-10', 10, 'International trip', 'Pending', NULL);

-- -----------------------------------------------------------
-- Sample Data: Leave Balances (Year 2026)
-- -----------------------------------------------------------
INSERT INTO leave_balances (employee_id, year, sick_leave, casual_leave, earned_leave) VALUES
('EMP001', 2026, 10, 8, 15),
('EMP002', 2026, 12, 9, 10),
('EMP003', 2026, 8, 10, 5),
('EMP004', 2026, 12, 12, 20),
('EMP005', 2026, 11, 11, 12),
('EMP006', 2026, 10, 12, 8),
('EMP007', 2026, 12, 12, 6),
('EMP008', 2026, 12, 11, 18),
('EMP009', 2026, 12, 12, 10),
('EMP010', 2026, 12, 12, 4);

-- -----------------------------------------------------------
-- Sample Data: Holidays (Year 2026)
-- -----------------------------------------------------------
INSERT INTO holidays (date, name, is_optional, year) VALUES
('2026-01-26', 'Republic Day', FALSE, 2026),
('2026-03-29', 'Holi', FALSE, 2026),
('2026-04-14', 'Ambedkar Jayanti', FALSE, 2026),
('2026-05-01', 'Labour Day', FALSE, 2026),
('2026-08-15', 'Independence Day', FALSE, 2026),
('2026-08-27', 'Janmashtami', TRUE, 2026),
('2026-10-02', 'Gandhi Jayanti', FALSE, 2026),
('2026-10-22', 'Diwali', FALSE, 2026),
('2026-11-15', 'Guru Nanak Jayanti', TRUE, 2026),
('2026-12-25', 'Christmas', FALSE, 2026);

-- -----------------------------------------------------------
-- Sample Data: Shifts
-- -----------------------------------------------------------
INSERT INTO shifts (name, start_time, end_time, late_threshold, description, is_active) VALUES
('General Shift', '09:00:00', '18:00:00', 15, 'Standard 9-to-6 work shift', TRUE),
('Morning Shift', '07:00:00', '15:00:00', 10, 'Early morning shift for support team', TRUE),
('Night Shift', '21:00:00', '05:00:00', 15, 'Night shift for operations team', TRUE),
('Flexi Shift', '10:00:00', '19:00:00', 30, 'Flexible hours with 30-min late threshold', TRUE);

-- -----------------------------------------------------------
-- Sample Data: Employee Shift Assignments
-- -----------------------------------------------------------
INSERT INTO employee_shifts (employee_id, shift_id, effective_from) VALUES
('EMP001', 1, '2026-01-01'),
('EMP002', 1, '2026-01-01'),
('EMP003', 1, '2026-01-01'),
('EMP004', 1, '2026-01-01'),
('EMP005', 1, '2026-01-01'),
('EMP006', 1, '2026-01-01'),
('EMP007', 1, '2026-01-01'),
('EMP008', 2, '2026-01-01'),
('EMP009', 1, '2026-01-01'),
('EMP010', 2, '2026-01-01');

-- -----------------------------------------------------------
-- Sample Data: Announcements
-- -----------------------------------------------------------
INSERT INTO announcements (title, message, priority, created_by) VALUES
('Office Closed for Republic Day', 'The office will remain closed on 26th Jan 2026 on account of Republic Day.', 'High', 'Admin'),
('Team Outing Next Month', 'We are planning a team outing in August. Stay tuned for details!', 'Normal', 'Admin'),
('Facial Recognition System Upgrade', 'The attendance system will be upgraded this weekend. Please ensure all face data is up to date.', 'High', 'Admin'),
('New Parking Slots Available', 'New parking slots have been allocated for employees in the basement level 2.', 'Low', 'Admin'),
('Diwali Celebration Event', 'Diwali celebration will be held on 21st Oct 2026 in the main hall. All employees are invited.', 'Normal', 'Admin');

-- -----------------------------------------------------------
-- Sample Data: Employee Documents
-- -----------------------------------------------------------
INSERT INTO employee_documents (employee_id, document_type, file_name, file_path) VALUES
('EMP001', 'Offer Letter', 'offer_letter_EMP001.pdf', 'uploads/documents/offer_EMP001.pdf'),
('EMP001', 'ID Proof', 'pan_card_EMP001.pdf', 'uploads/documents/pan_EMP001.pdf'),
('EMP002', 'Offer Letter', 'offer_letter_EMP002.pdf', 'uploads/documents/offer_EMP002.pdf'),
('EMP004', 'Experience Letter', 'experience_EMP004.pdf', 'uploads/documents/exp_EMP004.pdf');

-- -----------------------------------------------------------
-- Sample Data: Attendance with Check-Out (extra records)
-- -----------------------------------------------------------
INSERT INTO attendance (employee_id, employee_name, attendance_date, attendance_time, check_out_time, total_hours, status, confidence_score, camera_device) VALUES
('EMP001', 'Alice Johnson', '2026-06-30', '09:02:00', '18:05:00', 9.1, 'Present', 97.50, 'Webcam'),
('EMP002', 'Bob Smith', '2026-06-30', '08:55:00', '17:45:00', 8.8, 'Present', 96.80, 'Webcam'),
('EMP003', 'Charlie Brown', '2026-06-30', '09:30:00', '18:00:00', 8.5, 'Late', 95.20, 'Webcam'),
('EMP004', 'Diana Prince', '2026-06-30', '08:50:00', '18:10:00', 9.3, 'Present', 98.10, 'Webcam'),
('EMP005', 'Eve Davis', '2026-06-30', '10:00:00', '15:30:00', 5.5, 'Half-Day', 94.50, 'Webcam'),
('EMP006', 'Frank Miller', '2026-06-30', '09:10:00', '17:50:00', 8.7, 'Present', 96.00, 'Webcam'),
('EMP007', 'Grace Lee', '2026-06-30', '09:05:00', '18:15:00', 9.2, 'Present', 97.80, 'Webcam'),
('EMP008', 'Henry Wilson', '2026-06-30', '06:55:00', '15:00:00', 8.1, 'Present', 96.50, 'Webcam'),
('EMP009', 'Ivy Chen', '2026-06-30', '09:00:00', '18:30:00', 9.5, 'Present', 97.00, 'Webcam'),
('EMP010', 'Jack Taylor', '2026-06-30', '06:50:00', '15:10:00', 8.3, 'Present', 95.80, 'Webcam');
