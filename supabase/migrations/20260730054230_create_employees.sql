create table public.employees (
  id uuid not null default gen_random_uuid (),
  company_id uuid not null,
  employee_code text not null,
  full_name text not null,
  nickname text null,
  gender text not null,
  religion text not null,
  nik text not null,
  npwp text null,
  birth_place text null,
  birth_date date not null,
  phone text null,
  email text null,
  address text null,
  department text null, -- <-- Added department column here
  emergency_contact_name text null,
  emergency_contact_phone text null,
  hire_date date not null,
  resign_date date null,
  employment_status text not null,
  marital_status text not null,
  bank_id uuid null,
  bank_account text null,
  bank_account_name text null,
  photo_url text null,
  notes text null,
  status text not null default 'ACTIVE'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint employees_pkey primary key (id),
  constraint uq_employee_company_code unique (company_id, employee_code),
  constraint uq_employee_nik unique (nik),
  constraint employees_company_id_fkey foreign KEY (company_id) references companies (id) on delete RESTRICT,
  constraint employees_bank_id_fkey foreign KEY (bank_id) references banks (id) on delete RESTRICT,
  constraint employees_status_check check (
    (
      status = any (array['ACTIVE'::text, 'INACTIVE'::text])
    )
  ),
  constraint employees_marital_status_check check (
    (
      marital_status = any (
        array['SINGLE'::text, 'MARRIED'::text, 'DIVORCED'::text]
      )
    )
  ),
  constraint employees_employment_status_check check (
    (
      employment_status = any (
        array[
          'PROBATION'::text,
          'PERMANENT'::text,
          'CONTRACT'::text,
          'DAILY'::text,
          'PART_TIME'::text,
          'RESIGNED'::text
        ]
      )
    )
  ),
  constraint employees_gender_check check (
    (
      gender = any (array['MALE'::text, 'FEMALE'::text])
    )
  ),
  constraint chk_employee_resign_date check (
    (
      (resign_date is null)
      or (resign_date >= hire_date)
    )
  ),
  constraint employees_religion_check check (
    (
      religion = any (
        array[
          'ISLAM'::text,
          'PROTESTANT'::text,
          'CATHOLIC'::text,
          'HINDU'::text,
          'BUDDHIST'::text,
          'CONFUCIAN'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_employees_company on public.employees using btree (company_id) TABLESPACE pg_default;
create index IF not exists idx_employees_status on public.employees using btree (status) TABLESPACE pg_default;
create index IF not exists idx_employees_employment_status on public.employees using btree (employment_status) TABLESPACE pg_default;
create index IF not exists idx_employees_full_name on public.employees using btree (full_name) TABLESPACE pg_default;