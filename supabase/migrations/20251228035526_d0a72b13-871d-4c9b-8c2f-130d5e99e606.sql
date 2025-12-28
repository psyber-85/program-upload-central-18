-- =============================================
-- STAFF PORTAL DATABASE SCHEMA
-- All tables prefixed with sp_ for isolation
-- =============================================

-- =============================================
-- ENUMS
-- =============================================
create type public.sp_app_role as enum ('admin', 'staff');
create type public.sp_business_arm as enum ('Training', 'Solutions');
create type public.sp_request_status as enum ('Pending', 'Approved', 'Rejected');
create type public.sp_leave_type as enum ('AL', 'SL', 'Custom');
create type public.sp_training_status as enum ('Submitted', 'Approved', 'Rejected', 'Completed', 'Claimed');
create type public.sp_invoice_status as enum ('Draft', 'Sent', 'Paid');
create type public.sp_bill_status as enum ('Draft', 'Paid');
create type public.sp_quotation_status as enum ('Draft', 'Sent', 'Accepted', 'Rejected', 'Converted');
create type public.sp_po_status as enum ('Draft', 'Sent', 'Received', 'Closed');
create type public.sp_payment_method as enum ('Bank Transfer', 'Cash', 'Cheque', 'Card');
create type public.sp_payroll_status as enum ('Draft', 'Finalized');

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- User roles table (CRITICAL: separate from profiles for security)
create table public.sp_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role sp_app_role not null default 'staff',
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- Staff profiles table
create table public.sp_staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  business_arm sp_business_arm default 'Training',
  join_date date not null default current_date,
  is_active boolean default true,
  salary_base numeric default 0,
  epf_rate numeric default 11,
  socso_rate numeric default 2,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leave balances per user per year
create table public.sp_leave_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year integer not null,
  al_total integer default 14,
  al_used integer default 0,
  al_carry_forward integer default 0,
  sl_total integer default 10,
  sl_used integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year)
);

-- Training entitlements
create table public.sp_training_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  eligible_from date not null default current_date,
  annual_amount numeric default 1500,
  used_amount numeric default 0,
  override_eligible boolean default false,
  override_balance numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- =============================================
-- REQUEST TABLES
-- =============================================

-- Leave requests
create table public.sp_leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status sp_request_status default 'Pending',
  leave_type sp_leave_type not null,
  start_date date not null,
  end_date date not null,
  half_day boolean default false,
  reason text,
  custom_leave_type text,
  attachment_url text,
  admin_comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Claim requests
create table public.sp_claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status sp_request_status default 'Pending',
  amount numeric not null,
  category text not null,
  description text,
  receipt_file_name text,
  receipt_file_size integer,
  receipt_file_type text,
  receipt_uploaded_at timestamptz,
  auto_approved boolean default false,
  included_in_payroll_month text,
  linked_training_app_id uuid,
  attachment_url text,
  admin_comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Training applications
create table public.sp_training_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_name text not null,
  provider text not null,
  cost numeric not null,
  link text,
  justification text,
  status sp_training_status default 'Submitted',
  attachment_url text,
  approved_at timestamptz,
  completed_at timestamptz,
  claimed_at timestamptz,
  included_in_payroll_month text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- FINANCE TABLES
-- =============================================

-- Invoices
create table public.sp_invoices (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  invoice_number text not null unique,
  business_arm sp_business_arm,
  client_name text,
  client_email text,
  client_address text,
  client_phone text,
  reference text,
  payment_terms text,
  notes text,
  issue_date date not null default current_date,
  due_date date,
  status sp_invoice_status default 'Draft',
  items jsonb not null default '[]',
  total numeric not null default 0,
  paid_date date,
  quotation_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quotations
create table public.sp_quotations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  quotation_number text not null unique,
  business_arm sp_business_arm,
  client_name text,
  client_email text,
  client_address text,
  client_phone text,
  reference text,
  notes text,
  issue_date date not null default current_date,
  valid_until date,
  status sp_quotation_status default 'Draft',
  items jsonb not null default '[]',
  total numeric not null default 0,
  converted_invoice_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bills
create table public.sp_bills (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  vendor_name text not null,
  category text not null,
  amount numeric not null,
  due_date date,
  status sp_bill_status default 'Draft',
  paid_date date,
  attachment_file_name text,
  attachment_file_size integer,
  attachment_file_type text,
  attachment_uploaded_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Purchase Orders
create table public.sp_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  po_number text not null unique,
  vendor_name text not null,
  vendor_email text,
  vendor_address text,
  items jsonb not null default '[]',
  total numeric not null default 0,
  status sp_po_status default 'Draft',
  expected_delivery date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments
create table public.sp_payments (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  payment_number text not null unique,
  bill_id uuid references public.sp_bills(id) on delete set null,
  po_id uuid references public.sp_purchase_orders(id) on delete set null,
  vendor_name text not null,
  amount numeric not null,
  payment_date date not null default current_date,
  payment_method sp_payment_method not null,
  reference text,
  notes text,
  created_at timestamptz default now()
);

-- =============================================
-- PAYROLL TABLES
-- =============================================

-- Payroll runs
create table public.sp_payroll_runs (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  status sp_payroll_status default 'Draft',
  created_at timestamptz default now(),
  finalized_at timestamptz,
  updated_at timestamptz default now()
);

-- Payroll items per staff per run
create table public.sp_payroll_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.sp_payroll_runs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text not null,
  base_salary numeric not null default 0,
  epf numeric default 0,
  socso numeric default 0,
  employer_epf numeric default 0,
  employer_socso numeric default 0,
  claims_total numeric default 0,
  training_claims_total numeric default 0,
  net_pay numeric not null default 0,
  total_company_cost numeric not null default 0,
  created_at timestamptz default now(),
  unique(run_id, user_id)
);

-- Payslips
create table public.sp_payslips (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.sp_payroll_runs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  base_salary numeric not null,
  epf numeric default 0,
  socso numeric default 0,
  employer_epf numeric default 0,
  employer_socso numeric default 0,
  claims_total numeric default 0,
  training_claims_total numeric default 0,
  net_pay numeric not null,
  created_at timestamptz default now()
);

-- =============================================
-- OTHER TABLES
-- =============================================

-- Document links
create table public.sp_doc_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  url text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- App settings (counters, config)
create table public.sp_app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- =============================================
-- SECURITY DEFINER FUNCTION
-- =============================================

create or replace function public.has_sp_role(_user_id uuid, _role sp_app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sp_user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

alter table public.sp_user_roles enable row level security;
alter table public.sp_staff_profiles enable row level security;
alter table public.sp_leave_balances enable row level security;
alter table public.sp_training_entitlements enable row level security;
alter table public.sp_leave_requests enable row level security;
alter table public.sp_claim_requests enable row level security;
alter table public.sp_training_applications enable row level security;
alter table public.sp_invoices enable row level security;
alter table public.sp_quotations enable row level security;
alter table public.sp_bills enable row level security;
alter table public.sp_purchase_orders enable row level security;
alter table public.sp_payments enable row level security;
alter table public.sp_payroll_runs enable row level security;
alter table public.sp_payroll_items enable row level security;
alter table public.sp_payslips enable row level security;
alter table public.sp_doc_links enable row level security;
alter table public.sp_app_settings enable row level security;

-- =============================================
-- RLS POLICIES
-- =============================================

-- sp_user_roles: Only admins can manage, users can read their own
create policy "Users can read own roles" on public.sp_user_roles
  for select to authenticated
  using (user_id = auth.uid());

create policy "Admins can manage all roles" on public.sp_user_roles
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_staff_profiles: Users can read/update own, admins can manage all
create policy "Users can read own profile" on public.sp_staff_profiles
  for select to authenticated
  using (id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Users can update own profile" on public.sp_staff_profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admins can insert profiles" on public.sp_staff_profiles
  for insert to authenticated
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can delete profiles" on public.sp_staff_profiles
  for delete to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'));

-- sp_leave_balances: Users read own, admins manage all
create policy "Users can read own leave balances" on public.sp_leave_balances
  for select to authenticated
  using (user_id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage leave balances" on public.sp_leave_balances
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_training_entitlements: Users read own, admins manage all
create policy "Users can read own training entitlements" on public.sp_training_entitlements
  for select to authenticated
  using (user_id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage training entitlements" on public.sp_training_entitlements
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_leave_requests: Users manage own, admins manage all
create policy "Users can read own leave requests" on public.sp_leave_requests
  for select to authenticated
  using (user_id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Users can insert own leave requests" on public.sp_leave_requests
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own pending leave requests" on public.sp_leave_requests
  for update to authenticated
  using (user_id = auth.uid() and status = 'Pending')
  with check (user_id = auth.uid());

create policy "Admins can manage all leave requests" on public.sp_leave_requests
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_claim_requests: Users manage own, admins manage all
create policy "Users can read own claim requests" on public.sp_claim_requests
  for select to authenticated
  using (user_id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Users can insert own claim requests" on public.sp_claim_requests
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own pending claim requests" on public.sp_claim_requests
  for update to authenticated
  using (user_id = auth.uid() and status = 'Pending')
  with check (user_id = auth.uid());

create policy "Admins can manage all claim requests" on public.sp_claim_requests
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_training_applications: Users manage own, admins manage all
create policy "Users can read own training apps" on public.sp_training_applications
  for select to authenticated
  using (user_id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Users can insert own training apps" on public.sp_training_applications
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own submitted training apps" on public.sp_training_applications
  for update to authenticated
  using (user_id = auth.uid() and status = 'Submitted')
  with check (user_id = auth.uid());

create policy "Admins can manage all training apps" on public.sp_training_applications
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- Finance tables: Admins only for now
create policy "Admins can manage invoices" on public.sp_invoices
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage quotations" on public.sp_quotations
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage bills" on public.sp_bills
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage purchase orders" on public.sp_purchase_orders
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage payments" on public.sp_payments
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- Payroll tables: Admins manage all, users read own payslips
create policy "Admins can manage payroll runs" on public.sp_payroll_runs
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage payroll items" on public.sp_payroll_items
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

create policy "Users can read own payslips" on public.sp_payslips
  for select to authenticated
  using (user_id = auth.uid() or public.has_sp_role(auth.uid(), 'admin'));

create policy "Admins can manage all payslips" on public.sp_payslips
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_doc_links: All authenticated can read, admins can manage
create policy "Authenticated users can read doc links" on public.sp_doc_links
  for select to authenticated
  using (true);

create policy "Admins can manage doc links" on public.sp_doc_links
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- sp_app_settings: Admins only
create policy "Admins can manage app settings" on public.sp_app_settings
  for all to authenticated
  using (public.has_sp_role(auth.uid(), 'admin'))
  with check (public.has_sp_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

create trigger update_sp_staff_profiles_updated_at
  before update on public.sp_staff_profiles
  for each row execute function public.update_updated_at_column();

create trigger update_sp_leave_balances_updated_at
  before update on public.sp_leave_balances
  for each row execute function public.update_updated_at_column();

create trigger update_sp_training_entitlements_updated_at
  before update on public.sp_training_entitlements
  for each row execute function public.update_updated_at_column();

create trigger update_sp_leave_requests_updated_at
  before update on public.sp_leave_requests
  for each row execute function public.update_updated_at_column();

create trigger update_sp_claim_requests_updated_at
  before update on public.sp_claim_requests
  for each row execute function public.update_updated_at_column();

create trigger update_sp_training_applications_updated_at
  before update on public.sp_training_applications
  for each row execute function public.update_updated_at_column();

create trigger update_sp_invoices_updated_at
  before update on public.sp_invoices
  for each row execute function public.update_updated_at_column();

create trigger update_sp_quotations_updated_at
  before update on public.sp_quotations
  for each row execute function public.update_updated_at_column();

create trigger update_sp_bills_updated_at
  before update on public.sp_bills
  for each row execute function public.update_updated_at_column();

create trigger update_sp_purchase_orders_updated_at
  before update on public.sp_purchase_orders
  for each row execute function public.update_updated_at_column();

create trigger update_sp_payroll_runs_updated_at
  before update on public.sp_payroll_runs
  for each row execute function public.update_updated_at_column();

create trigger update_sp_doc_links_updated_at
  before update on public.sp_doc_links
  for each row execute function public.update_updated_at_column();

create trigger update_sp_app_settings_updated_at
  before update on public.sp_app_settings
  for each row execute function public.update_updated_at_column();

-- =============================================
-- INITIAL DATA: App Settings (counters)
-- =============================================

insert into public.sp_app_settings (key, value) values
  ('invoice_counter', '{"next": 1001}'::jsonb),
  ('quotation_counter', '{"next": 1001}'::jsonb),
  ('po_counter', '{"next": 1001}'::jsonb),
  ('payment_counter', '{"next": 1001}'::jsonb)
on conflict (key) do nothing;