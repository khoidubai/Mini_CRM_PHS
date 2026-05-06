-- ============================================
-- PHS Mini CRM — Seed Data
-- Phân bổ theo spec: 167 customers, 786 tickets
-- ============================================

-- Helper: Random Vietnamese names (masked)
-- Nhóm phân bổ: E(53) F(42) D(46) C(11) A(5) B(3) H(6) G(1) = 167

DO $$
DECLARE
  i int;
  acc_id text;
  vip text;
  branch text;
  cust_name text;
  grp text;
  grp_letter char;
  branches text[] := ARRAY['QUẬN 3','QUẬN 1','QUẬN 7','TÂN BÌNH','PHÚ NHUẬN','BÌNH THẠNH','THỦ ĐỨC','GÒ VẤP','HÀ NỘI','ĐÀ NẴNG','HẢI PHÒNG','CẦN THƠ'];
  vips text[] := ARRAY['Bình thường','VIP Gold','VIP Platinum','VIP Diamond'];
  first_names text[] := ARRAY['NGUYỄN','TRẦN','LÊ','PHẠM','HOÀNG','HUỲNH','VÕ','PHAN','TRƯƠNG','BÙI','ĐẶNG','ĐỖ','NGÔ','DƯƠNG','LÝ'];
  last_names text[] := ARRAY['ANH','BÌNH','CƯỜNG','DŨNG','HẢI','HÙNG','HƯƠNG','KHOA','LINH','MINH','NAM','NGỌC','PHONG','QUANG','SƠN','THẢO','THIỆN','TRANG','TUẤN','VÂN'];
  pic_names text[] := ARRAY['Nguyễn Văn An','Trần Thị Bình','Lê Hoàng Cường','Phạm Minh Dũng','Hoàng Thị Hương','Võ Văn Khoa','Phan Ngọc Linh','Bùi Quang Nam'];
  call_results text[] := ARRAY['Nghe máy – trao đổi','Không nghe máy / không bắt máy','Thuê bao / số không tồn tại','Không có thông tin liên hệ','Trực tiếp'];
  interest_levels text[] := ARRAY['Rất quan tâm – muốn giao dịch ngay','Quan tâm – cần follow thêm','Nghe nhưng chưa có nhu cầu','Không quan tâm'];
  ticket_categories text[] := ARRAY['Quản lý Tài khoản PHS','Khác','Thay đổi bậc VIP','Hỗ trợ Giao dịch','Failed E-Kyc','CMSN','Khảo sát E-kyc','Nạp và Rút tiền','Công văn','Dịch vụ CSKH','Ứng dụng PHS','Môi giới'];
  ticket_sources text[] := ARRAY['Email','Hotline','Zalo','Chatbot_1','Mobile_app'];
  ticket_statuses text[] := ARRAY['Đã đóng','Đang xử lý','Chờ phản hồi'];
  classifications text[] := ARRAY['Yêu cầu xử lý','Thắc mắc','Khiếu nại','Yêu cầu thông tin','Góp ý'];

  group_letters char[] := ARRAY['E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E','E',
    'F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F',
    'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
    'C','C','C','C','C','C','C','C','C','C','C',
    'A','A','A','A','A',
    'B','B','B',
    'H','H','H','H','H','H',
    'G'];

  group_names text[];
  cr text;
  il text;
  t_code text;
  t_acc text;
  t_cat text;
  t_src text;
  t_stat text;
  t_cls text;
  t_total numeric;
  t_handling numeric;
  t_created timestamptz;
  vip_idx int;
  -- VIP distribution: Bình thường(477) Gold(56) Platinum(54) Diamond(61)
  -- For 167 customers proportionally: BT ~101, Gold ~12, Plat ~11, Diamond ~13
  -- we'll just random with weights
  rand_val float;
BEGIN
  group_names := ARRAY[
    'A – Rất tiềm năng','B – Tiềm năng','C – Nuôi dưỡng','D – Không tiềm năng',
    'E – Không nghe máy','F – SĐT không hợp lệ','G – Không có SĐT','H – Tài khoản ảo'
  ];

  -- ========== INSERT 167 CUSTOMERS ==========
  FOR i IN 1..167 LOOP
    acc_id := '022C' || LPAD(i::text, 6, '0');
    grp_letter := group_letters[i];

    rand_val := random();
    IF rand_val < 0.605 THEN vip := 'Bình thường';
    ELSIF rand_val < 0.695 THEN vip := 'VIP Gold';
    ELSIF rand_val < 0.78 THEN vip := 'VIP Platinum';
    ELSE vip := 'VIP Diamond';
    END IF;

    branch := branches[1 + floor(random() * array_length(branches, 1))::int];
    cust_name := first_names[1 + floor(random() * array_length(first_names, 1))::int]
      || '****** '
      || last_names[1 + floor(random() * array_length(last_names, 1))::int];

    CASE grp_letter
      WHEN 'A' THEN grp := 'A – Rất tiềm năng';
      WHEN 'B' THEN grp := 'B – Tiềm năng';
      WHEN 'C' THEN grp := 'C – Nuôi dưỡng';
      WHEN 'D' THEN grp := 'D – Không tiềm năng';
      WHEN 'E' THEN grp := 'E – Không nghe máy';
      WHEN 'F' THEN grp := 'F – SĐT không hợp lệ';
      WHEN 'G' THEN grp := 'G – Không có SĐT';
      WHEN 'H' THEN grp := 'H – Tài khoản ảo';
    END CASE;

    INSERT INTO customers (account_id, full_name, branch, status, vip_tier)
    VALUES (acc_id, cust_name, branch, 'NAV, QM SSI', vip)
    ON CONFLICT (account_id) DO NOTHING;

    -- Create SA record for each customer
    IF grp_letter IN ('A','B','C') THEN
      cr := call_results[1]; -- Nghe máy – trao đổi
      il := interest_levels[1 + floor(random() * 3)::int]; -- one of first 3
    ELSIF grp_letter = 'D' THEN
      cr := CASE WHEN random() < 0.5 THEN call_results[1] ELSE call_results[5] END;
      il := interest_levels[4]; -- Không quan tâm
    ELSIF grp_letter = 'E' THEN
      cr := call_results[2]; -- Không nghe máy
      il := NULL;
    ELSIF grp_letter = 'F' THEN
      cr := call_results[3]; -- Thuê bao
      il := NULL;
    ELSIF grp_letter = 'G' THEN
      cr := call_results[4]; -- Không có thông tin
      il := NULL;
    ELSE -- H
      cr := call_results[2];
      il := NULL;
    END IF;

    INSERT INTO sa_records (account_id, pic, call_date, follow_count, call_result, interest_level,
      customer_group, product_introduced, reactivation, info_support, notes, handover_rm)
    VALUES (
      acc_id,
      pic_names[1 + floor(random() * array_length(pic_names, 1))::int],
      CURRENT_DATE - (floor(random() * 90))::int,
      CASE WHEN grp_letter IN ('A','B','C') THEN 2 + floor(random() * 4)::int ELSE 1 END,
      cr,
      il,
      grp,
      grp_letter IN ('A','B','C') AND random() > 0.3,
      grp_letter IN ('A','B') AND random() > 0.5,
      random() > 0.5,
      CASE WHEN grp_letter IN ('A','B') THEN 'KH tiềm năng, cần follow sát' ELSE '' END,
      CASE WHEN grp_letter = 'A' AND random() > 0.5 THEN pic_names[1 + floor(random() * 4)::int] ELSE '' END
    );
  END LOOP;

  -- ========== INSERT 786 CRM TICKETS ==========
  -- 57% linked (448), 43% unlinked (338)
  FOR i IN 1..786 LOOP
    t_code := '#' || LPAD((20126000 + i)::text, 9, '0');
    t_cat := ticket_categories[1 + floor(random() * array_length(ticket_categories, 1))::int];
    t_src := ticket_sources[1 + floor(random() * array_length(ticket_sources, 1))::int];

    rand_val := random();
    IF rand_val < 0.7 THEN t_stat := 'Đã đóng';
    ELSIF rand_val < 0.9 THEN t_stat := 'Đang xử lý';
    ELSE t_stat := 'Chờ phản hồi';
    END IF;

    t_cls := classifications[1 + floor(random() * array_length(classifications, 1))::int];
    t_created := NOW() - (floor(random() * 180) || ' days')::interval - (floor(random() * 24) || ' hours')::interval;

    t_total := 10 + floor(random() * 500)::int;
    t_handling := floor(t_total * (0.3 + random() * 0.6));

    IF i <= 448 THEN
      -- Linked ticket
      t_acc := '022C' || LPAD((1 + floor(random() * 167))::text, 6, '0');
      INSERT INTO crm_tickets (ticket_code, account_id, created_at, category, classification,
        customer_type, source, status, priority, description, resolution, total_time, handling_time, is_unlinked)
      VALUES (
        t_code, t_acc, t_created, t_cat, t_cls,
        'KH có tài khoản', t_src, t_stat, 'Bình thường',
        'Khách hàng ' || t_acc || ' yêu cầu hỗ trợ về ' || t_cat,
        CASE WHEN t_stat = 'Đã đóng' THEN 'Đã xử lý và phản hồi khách hàng' ELSE NULL END,
        t_total, t_handling, false
      )
      ON CONFLICT (ticket_code) DO NOTHING;
    ELSE
      -- Unlinked ticket
      INSERT INTO crm_tickets (ticket_code, account_id, created_at, category, classification,
        customer_type, source, status, priority, description, resolution, total_time, handling_time, is_unlinked)
      VALUES (
        t_code, NULL, t_created, t_cat, t_cls,
        'KH không có tài khoản', t_src, t_stat, 'Bình thường',
        'Yêu cầu hỗ trợ về ' || t_cat || ' — không có thông tin TK',
        CASE WHEN t_stat = 'Đã đóng' THEN 'Đã xử lý và phản hồi' ELSE NULL END,
        t_total, t_handling, true
      )
      ON CONFLICT (ticket_code) DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE 'Seed data inserted: 167 customers, 167 SA records, 786 CRM tickets';
END $$;
