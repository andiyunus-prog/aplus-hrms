CREATE TABLE public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_id UUID NOT NULL
        REFERENCES public.employees(id)
        ON DELETE RESTRICT,

    attendance_date DATE NOT NULL,

    clock_in TIME,
    clock_out TIME,

    -- 1. LATE
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    late_minutes INTEGER NOT NULL DEFAULT 0,

    -- 2. NO-SHOW
    is_no_show BOOLEAN NOT NULL DEFAULT FALSE,

    -- 3. OVERTIME
    overtime_minutes INTEGER NOT NULL DEFAULT 0,

    -- 4. PUBLIC HOLIDAY
    is_public_holiday BOOLEAN NOT NULL DEFAULT FALSE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- An employee can only have one attendance record per day
    CONSTRAINT uq_attendance_employee_date
        UNIQUE (employee_id, attendance_date),

    CONSTRAINT chk_attendance_late_minutes
        CHECK (late_minutes >= 0),

    CONSTRAINT chk_attendance_overtime_minutes
        CHECK (overtime_minutes >= 0)
);

CREATE INDEX idx_attendances_employee
    ON public.attendances(employee_id);

CREATE INDEX idx_attendances_date
    ON public.attendances(attendance_date);