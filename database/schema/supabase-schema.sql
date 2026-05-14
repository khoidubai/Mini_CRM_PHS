-- ============================================
-- PHS Mini CRM — Supabase Database Schema
-- ============================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    text UNIQUE NOT NULL,
  full_name     text,
  branch        text,
  status        text,
  vip_tier      text CHECK (vip_tier IN ('Bình thường','VIP Gold','VIP Platinum','VIP Diamond')) DEFAULT 'Bình thường',
  created_at    timestamptz DEFAULT now()
);

-- 2. USER PROFILES TABLE (must be before sa_records due to FK reference)
CREATE TABLE IF NOT EXISTS user_profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          text,
  role           text CHECK (role IN ('sa', 'ccc', 'admin')) DEFAULT 'sa',
  full_name      text,
  employee_code  text UNIQUE,
  phone          text,
  department     text,
  pic_name       text,
  branch         text,   -- chi nhánh SA (VD: 'CN Quận 1', 'CN Bình Thạnh'); CCC để null (Hội sở)
  is_active      boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- 3. SA RECORDS TABLE
CREATE TABLE IF NOT EXISTS sa_records (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id              text REFERENCES customers(account_id),
  pic                     text,
  pic_user_id             uuid REFERENCES user_profiles(id),
  call_date               date,
  follow_count            int DEFAULT 1,
  call_result             text,
  interest_level          text,
  customer_group          text,
  product_introduced      boolean DEFAULT false,
  reactivation            boolean DEFAULT false,
  info_support            boolean DEFAULT false,
  total_transaction_value numeric,
  transaction_fee         numeric,
  notes                   text,
  handover_rm             text,
  next_action_date        date,
  status_at_call          text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- 4. CRM TICKETS TABLE
CREATE TABLE IF NOT EXISTS crm_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code     text UNIQUE NOT NULL,
  account_id      text REFERENCES customers(account_id),
  created_at      timestamptz DEFAULT now(),
  category        text,
  classification  text,
  customer_type   text,
  source          text,
  status          text DEFAULT 'Đang xử lý',
  priority        text DEFAULT 'Bình thường',
  description     text,
  resolution      text,
  total_time      numeric,
  handling_time   numeric,
  is_unlinked     boolean DEFAULT false,
  csat_score      int CHECK (csat_score BETWEEN 1 AND 5),
  root_cause_tag  text CHECK (root_cause_tag IN ('SYSTEM_BUG','SOP_GAP','INFO_GAP','PROCESS_GAP','USER_ERROR','OTHER')),
  is_recurring    boolean DEFAULT false,
  linked_manually boolean DEFAULT false
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sa_records_account ON sa_records(account_id);
CREATE INDEX IF NOT EXISTS idx_sa_records_pic_user ON sa_records(pic_user_id);
CREATE INDEX IF NOT EXISTS idx_sa_records_call_date ON sa_records(call_date);
CREATE INDEX IF NOT EXISTS idx_sa_records_group ON sa_records(customer_group);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_account ON crm_tickets(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_status ON crm_tickets(status);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_category ON crm_tickets(category);
CREATE INDEX IF NOT EXISTS idx_crm_tickets_unlinked ON crm_tickets(is_unlinked);
CREATE INDEX IF NOT EXISTS idx_crm_root_cause ON crm_tickets(root_cause_tag);
CREATE INDEX IF NOT EXISTS idx_crm_is_recurring ON crm_tickets(is_recurring);
CREATE INDEX IF NOT EXISTS idx_sa_next_action ON sa_records(next_action_date);

-- 5. TRANSACTION LOGS TABLE
CREATE TABLE IF NOT EXISTS transaction_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id          text REFERENCES customers(account_id) NOT NULL,
  trade_date          date NOT NULL,
  trade_time          time,
  product_type        text NOT NULL CHECK (product_type IN ('Cổ phiếu','Trái phiếu','Chứng chỉ quỹ','Phái sinh','Margin')),
  ticker              text,
  order_type          text CHECK (order_type IN ('Mua','Bán')),
  order_volume        numeric NOT NULL,
  matched_volume      numeric,
  price               numeric NOT NULL,
  transaction_value   numeric,
  transaction_fee     numeric,
  status              text CHECK (status IN ('Khớp toàn phần','Khớp một phần','Hủy','Chờ khớp')),
  channel             text CHECK (channel IN ('App PHS','Web','Môi giới','Điện thoại')),
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_account ON transaction_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_txn_trade_date ON transaction_logs(trade_date);
CREATE INDEX IF NOT EXISTS idx_txn_product ON transaction_logs(product_type);

-- 6. KPI TARGETS TABLE
CREATE TABLE IF NOT EXISTS kpi_targets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  metric        text NOT NULL CHECK (metric IN (
    'a1_sop', 'a1_nvqltk', 'a1_nvkd', 'a1_admin', 'a1_other',
    'a2_project', 'a2_improve',
    'a3_compliance', 'a3_teamwork',
    'a4_knowledge', 'a4_share',
    'call_count', 'contact_success_rate',
    'icp_grouping_rate', 'icp_data_quality',
    'reactivation_count', 'ltv_fee', 'referral_rate',
    'support_count', 'new_product_count', 'group_conversion_rate'
  )),
  target_value  numeric NOT NULL DEFAULT 0,
  actual_override numeric DEFAULT NULL,
  month         text NOT NULL,  -- format: 'YYYY-MM'
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, metric, month)
);

CREATE INDEX IF NOT EXISTS idx_kpi_user_month ON kpi_targets(user_id, month);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all customers
CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert/update customers
CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true);

-- SA records: SA and Admin can CRUD
CREATE POLICY "SA records readable by authenticated"
  ON sa_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SA records insertable by authenticated"
  ON sa_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "SA records updatable by authenticated"
  ON sa_records FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "SA records deletable by authenticated"
  ON sa_records FOR DELETE
  TO authenticated
  USING (true);

-- CRM tickets: CCC and Admin can CRUD
CREATE POLICY "CRM tickets readable by authenticated"
  ON crm_tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CRM tickets insertable by authenticated"
  ON crm_tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "CRM tickets updatable by authenticated"
  ON crm_tickets FOR UPDATE
  TO authenticated
  USING (true);

-- Transaction logs: readable by authenticated, insertable for import
CREATE POLICY "Transaction logs readable by authenticated"
  ON transaction_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Transaction logs insertable by authenticated"
  ON transaction_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Transaction logs deletable by authenticated"
  ON transaction_logs FOR DELETE
  TO authenticated
  USING (true);

-- User profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- KPI targets
CREATE POLICY "Authenticated can read kpi_targets"
  ON kpi_targets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert kpi_targets"
  ON kpi_targets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update kpi_targets"
  ON kpi_targets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete kpi_targets"
  ON kpi_targets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, full_name, pic_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'sa'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'pic_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
