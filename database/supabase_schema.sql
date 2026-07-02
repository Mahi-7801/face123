-- ============================================================
--  FaceTrack Attendance System — Supabase PostgreSQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  Last updated: 2026-07-02
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ADMIN
-- ============================================================
CREATE TABLE IF NOT EXISTS admin (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 2. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
    id                  SERIAL PRIMARY KEY,
    employee_id         VARCHAR(50)    NOT NULL UNIQUE,
    employee_name       VARCHAR(255)   NOT NULL,
    department          VARCHAR(255)   NOT NULL,
    designation         VARCHAR(255)   NOT NULL,
    phone               VARCHAR(20),
    email               VARCHAR(255),
    password_hash       VARCHAR(255),
    joining_date        DATE,
    face_image_path     VARCHAR(500),
    face_encoding_path  VARCHAR(500),
    is_active           BOOLEAN        DEFAULT TRUE,
    salary              NUMERIC(12, 2) DEFAULT 0.00,
    bank_name           VARCHAR(255),
    bank_account        VARCHAR(50),
    ifsc_code           VARCHAR(20),
    uan_number          VARCHAR(50),
    pf_number           VARCHAR(50),
    created_at          TIMESTAMPTZ    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_id  ON employees (employee_id);
CREATE INDEX IF NOT EXISTS idx_department   ON employees (department);
CREATE INDEX IF NOT EXISTS idx_is_active    ON employees (is_active);

-- ============================================================
-- 3. SALARY PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS salary_payments (
    id            SERIAL PRIMARY KEY,
    employee_id   VARCHAR(50)    NOT NULL,
    employee_name VARCHAR(255)   NOT NULL,
    month         INTEGER        NOT NULL CHECK (month BETWEEN 1 AND 12),
    year          INTEGER        NOT NULL,
    amount        NUMERIC(12, 2) NOT NULL,
    deductions    NUMERIC(12, 2) DEFAULT 0.00,
    net_amount    NUMERIC(12, 2) NOT NULL,
    status        VARCHAR(20)    DEFAULT 'Pending' CHECK (status IN ('Paid','Pending','Cancelled')),
    payment_date  DATE,
    remarks       TEXT,
    created_at    TIMESTAMPTZ    DEFAULT NOW(),
    UNIQUE (employee_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_salary_employee       ON salary_payments (employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_month_year     ON salary_payments (month, year);

-- ============================================================
-- 4. ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id                   SERIAL PRIMARY KEY,
    employee_id          VARCHAR(50)   NOT NULL,
    employee_name        VARCHAR(255)  NOT NULL,
    attendance_date      DATE          NOT NULL,
    attendance_time      TIME          NOT NULL,
    check_out_time       TIME,
    total_hours          NUMERIC(4, 1),
    status               VARCHAR(20)   DEFAULT 'Present' CHECK (status IN ('Present','Absent','Late','Half-Day')),
    confidence_score     NUMERIC(5, 2),
    check_out_confidence NUMERIC(5, 2),
    camera_device        VARCHAR(255),
    ip_address           VARCHAR(45),
    created_at           TIMESTAMPTZ   DEFAULT NOW(),
    UNIQUE (employee_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_att_employee_id ON attendance (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date  ON attendance (attendance_date);
CREATE INDEX IF NOT EXISTS idx_att_status       ON attendance (status);

-- ============================================================
-- 5. LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
    id               SERIAL PRIMARY KEY,
    log_type         VARCHAR(20)   NOT NULL CHECK (log_type IN ('recognition','failed_attempt','registration','system','error')),
    employee_id      VARCHAR(50),
    employee_name    VARCHAR(255),
    message          TEXT          NOT NULL,
    confidence_score NUMERIC(5, 2),
    image_path       VARCHAR(500),
    ip_address       VARCHAR(45),
    created_at       TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_type        ON logs (log_type);
CREATE INDEX IF NOT EXISTS idx_log_created_at  ON logs (created_at);
CREATE INDEX IF NOT EXISTS idx_log_employee_id ON logs (employee_id);

-- ============================================================
-- 6. LEAVE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
    id            SERIAL PRIMARY KEY,
    employee_id   VARCHAR(50)  NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    leave_type    VARCHAR(20)  NOT NULL CHECK (leave_type IN ('Sick','Casual','Earned','Other')),
    start_date    DATE         NOT NULL,
    end_date      DATE         NOT NULL,
    total_days    INTEGER      NOT NULL,
    reason        TEXT         NOT NULL,
    status        VARCHAR(20)  DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
    admin_remarks TEXT,
    applied_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status   ON leave_requests (status);
CREATE INDEX IF NOT EXISTS idx_leave_dates    ON leave_requests (start_date, end_date);

-- ============================================================
-- 7. LEAVE BALANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_balances (
    id            SERIAL PRIMARY KEY,
    employee_id   VARCHAR(50) NOT NULL,
    year          INTEGER     NOT NULL,
    sick_leave    INTEGER     DEFAULT 12,
    casual_leave  INTEGER     DEFAULT 12,
    earned_leave  INTEGER     DEFAULT 0,
    UNIQUE (employee_id, year)
);

-- ============================================================
-- 8. HOLIDAYS
-- ============================================================
CREATE TABLE IF NOT EXISTS holidays (
    id          SERIAL PRIMARY KEY,
    date        DATE         NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    is_optional BOOLEAN      DEFAULT FALSE,
    year        INTEGER      NOT NULL,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holiday_date ON holidays (date);

-- ============================================================
-- 9. SHIFTS
-- ============================================================
CREATE TABLE IF NOT EXISTS shifts (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    start_time      TIME         NOT NULL,
    end_time        TIME         NOT NULL,
    late_threshold  INTEGER      DEFAULT 15,
    description     TEXT,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 10. EMPLOYEE SHIFTS
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_shifts (
    id             SERIAL PRIMARY KEY,
    employee_id    VARCHAR(50) NOT NULL UNIQUE,
    shift_id       INTEGER     NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    effective_from DATE        DEFAULT CURRENT_DATE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empshift_employee ON employee_shifts (employee_id);
CREATE INDEX IF NOT EXISTS idx_empshift_shift     ON employee_shifts (shift_id);

-- ============================================================
-- 11. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    priority   VARCHAR(10)  DEFAULT 'Normal' CHECK (priority IN ('Low','Normal','High')),
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT NOW(),
    updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 12. EMPLOYEE DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_documents (
    id            SERIAL PRIMARY KEY,
    employee_id   VARCHAR(50)  NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_name     VARCHAR(500) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    uploaded_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_employee ON employee_documents (employee_id);

-- ============================================================
-- AUTO-UPDATE updated_at via trigger (PostgreSQL equivalent)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    -- admin
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_admin_updated_at') THEN
        CREATE TRIGGER trg_admin_updated_at
        BEFORE UPDATE ON admin
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;

    -- employees
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employees_updated_at') THEN
        CREATE TRIGGER trg_employees_updated_at
        BEFORE UPDATE ON employees
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;

    -- leave_requests
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leave_updated_at') THEN
        CREATE TRIGGER trg_leave_updated_at
        BEFORE UPDATE ON leave_requests
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;

    -- announcements
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_announcements_updated_at') THEN
        CREATE TRIGGER trg_announcements_updated_at
        BEFORE UPDATE ON announcements
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- ============================================================
-- DEFAULT ADMIN (password: 7418520963  — bcrypt hashed)
-- Run only once. Skip if admin already exists.
-- ============================================================
INSERT INTO admin (username, email, password_hash, full_name)
SELECT 'admin', 'pmahi7801@gmail.com',
       '$2b$12$placeholder_replace_with_real_bcrypt_hash',
       'System Administrator'
WHERE NOT EXISTS (SELECT 1 FROM admin WHERE username = 'admin');

-- NOTE: The admin password is managed by init_db() in database.py.
-- You do NOT need to set it manually here — the backend will hash
-- and upsert it on every startup.
