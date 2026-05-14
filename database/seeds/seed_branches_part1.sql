-- ============================================================
-- SEED PART 1: Auth users · User profiles · Customers
-- Branches: CN Tân Bình · CN Quận 1 · CN Thanh Xuân
-- Chạy file này TRƯỚC, rồi chạy seed_branches_part2.sql
-- ============================================================
DO $$
DECLARE
  u_tb1 uuid := 'c1000001-0000-0000-0000-000000000001';
  u_tb2 uuid := 'c1000001-0000-0000-0000-000000000002';
  u_q11 uuid := 'c2000002-0000-0000-0000-000000000001';
  u_q12 uuid := 'c2000002-0000-0000-0000-000000000002';
  u_tx1 uuid := 'c3000003-0000-0000-0000-000000000001';
  u_tx2 uuid := 'c3000003-0000-0000-0000-000000000002';
BEGIN

-- 1. AUTH USERS
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,is_super_admin)
VALUES
  ('00000000-0000-0000-0000-000000000000',u_tb1,'authenticated','authenticated','hung.nv@phs.vn',  crypt('Phs@2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"role":"sa"}',false),
  ('00000000-0000-0000-0000-000000000000',u_tb2,'authenticated','authenticated','linh.tt@phs.vn',  crypt('Phs@2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"role":"sa"}',false),
  ('00000000-0000-0000-0000-000000000000',u_q11,'authenticated','authenticated','khoa.pv@phs.vn',  crypt('Phs@2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"role":"sa"}',false),
  ('00000000-0000-0000-0000-000000000000',u_q12,'authenticated','authenticated','anh.nt@phs.vn',   crypt('Phs@2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"role":"sa"}',false),
  ('00000000-0000-0000-0000-000000000000',u_tx1,'authenticated','authenticated','trang.lt@phs.vn', crypt('Phs@2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"role":"sa"}',false),
  ('00000000-0000-0000-0000-000000000000',u_tx2,'authenticated','authenticated','phong.mn@phs.vn', crypt('Phs@2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"role":"sa"}',false)
ON CONFLICT (id) DO NOTHING;

-- 2. USER PROFILES
INSERT INTO user_profiles (id,email,role,full_name,employee_code,phone,department,pic_name,branch,is_active,created_at,updated_at)
VALUES
  (u_tb1,'hung.nv@phs.vn',  'sa','Nguyễn Văn Hùng',  'SA-TB001','0911100001','SA','HUNG.NV', 'CN Tân Bình',  true,now(),now()),
  (u_tb2,'linh.tt@phs.vn',  'sa','Trần Thị Linh',    'SA-TB002','0911100002','SA','LINH.TT', 'CN Tân Bình',  true,now(),now()),
  (u_q11,'khoa.pv@phs.vn',  'sa','Phạm Văn Khoa',    'SA-Q1001','0922200001','SA','KHOA.PV', 'CN Quận 1',    true,now(),now()),
  (u_q12,'anh.nt@phs.vn',   'sa','Nguyễn Thị Anh',   'SA-Q1002','0922200002','SA','ANH.NT',  'CN Quận 1',    true,now(),now()),
  (u_tx1,'trang.lt@phs.vn', 'sa','Lê Thị Trang',     'SA-TX001','0933300001','SA','TRANG.LT','CN Thanh Xuân',true,now(),now()),
  (u_tx2,'phong.mn@phs.vn', 'sa','Minh Nguyệt Phong','SA-TX002','0933300002','SA','PHONG.MN','CN Thanh Xuân',true,now(),now())
ON CONFLICT (id) DO UPDATE SET
  full_name=EXCLUDED.full_name, branch=EXCLUDED.branch,
  pic_name=EXCLUDED.pic_name, is_active=EXCLUDED.is_active, updated_at=now();

-- 3. CUSTOMERS
INSERT INTO customers (account_id,full_name,branch,status,vip_tier,created_at) VALUES
  -- CN Tân Bình (HUNG.NV — 15 KH)
  ('TB10001','Nguyễn Hữu Phúc','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10002','Trần Minh Châu','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10003','Lê Thị Kim Ngân','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10004','Phạm Quốc Bảo','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10005','Hoàng Văn Sơn','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10006','Đặng Thị Lan Anh','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10007','Vũ Tiến Dũng','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10008','Bùi Thị Hằng','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10009','Đinh Quang Khải','CN Tân Bình','active','Bình thường',now()),
  ('TB10010','Ngô Thị Ánh Tuyết','CN Tân Bình','active','VIP Gold',now()),
  ('TB10011','Hà Văn Trọng','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10012','Phan Thị Diễm','CN Tân Bình','active','Bình thường',now()),
  ('TB10013','Lý Minh Đức','CN Tân Bình','inactive','Bình thường',now()),
  ('TB10014','Trịnh Thị Hoa','CN Tân Bình','active','Bình thường',now()),
  ('TB10015','Dương Văn Cường','CN Tân Bình','active','VIP Gold',now()),
  -- CN Tân Bình (LINH.TT — 10 KH)
  ('TB20001','Lê Hoàng Nam','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20002','Nguyễn Thị Quỳnh','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20003','Trần Đức Hải','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20004','Phạm Thị Thanh Hương','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20005','Đinh Văn Toàn','CN Tân Bình','active','Bình thường',now()),
  ('TB20006','Bùi Thị Ngọc Hà','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20007','Đỗ Minh Tuấn','CN Tân Bình','active','Bình thường',now()),
  ('TB20008','Ngô Thị Phương','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20009','Hồ Văn Lực','CN Tân Bình','inactive','Bình thường',now()),
  ('TB20010','Trương Thị Mai','CN Tân Bình','active','Bình thường',now()),
  -- CN Quận 1 (KHOA.PV — 15 KH)
  ('Q110001','Nguyễn Bá Cường','CN Quận 1','active','VIP Gold',now()),
  ('Q110002','Trần Thị Hồng Nhung','CN Quận 1','inactive','Bình thường',now()),
  ('Q110003','Lê Quang Minh','CN Quận 1','inactive','Bình thường',now()),
  ('Q110004','Phạm Thị Cẩm Tú','CN Quận 1','active','Bình thường',now()),
  ('Q110005','Hoàng Đức Phú','CN Quận 1','inactive','Bình thường',now()),
  ('Q110006','Đặng Thị Lan','CN Quận 1','active','VIP Gold',now()),
  ('Q110007','Vũ Ngọc Hà','CN Quận 1','inactive','Bình thường',now()),
  ('Q110008','Bùi Văn Hải','CN Quận 1','active','Bình thường',now()),
  ('Q110009','Đinh Thị Ánh Nguyệt','CN Quận 1','inactive','Bình thường',now()),
  ('Q110010','Ngô Văn Thịnh','CN Quận 1','active','VIP Platinum',now()),
  ('Q110011','Hà Thị Kim Oanh','CN Quận 1','inactive','Bình thường',now()),
  ('Q110012','Phan Văn Lộc','CN Quận 1','active','Bình thường',now()),
  ('Q110013','Lý Thị Mỹ Duyên','CN Quận 1','inactive','Bình thường',now()),
  ('Q110014','Trịnh Văn Dũng','CN Quận 1','active','Bình thường',now()),
  ('Q110015','Dương Thị Phương Thảo','CN Quận 1','inactive','Bình thường',now()),
  -- CN Quận 1 (ANH.NT — 8 KH)
  ('Q120001','Châu Văn Quang','CN Quận 1','inactive','Bình thường',now()),
  ('Q120002','Huỳnh Thị Thu Hà','CN Quận 1','inactive','Bình thường',now()),
  ('Q120003','Lê Thành Trung','CN Quận 1','inactive','Bình thường',now()),
  ('Q120004','Nguyễn Thị Ngọc Bích','CN Quận 1','inactive','Bình thường',now()),
  ('Q120005','Trần Văn Hải','CN Quận 1','inactive','Bình thường',now()),
  ('Q120006','Phạm Thị Thanh Loan','CN Quận 1','active','Bình thường',now()),
  ('Q120007','Hoàng Văn Khang','CN Quận 1','inactive','Bình thường',now()),
  ('Q120008','Đặng Thị Kim Chi','CN Quận 1','active','Bình thường',now()),
  -- CN Thanh Xuân (TRANG.LT — 15 KH)
  ('TX10001','Nguyễn Thế Hùng','CN Thanh Xuân','active','VIP Gold',now()),
  ('TX10002','Trần Thị Như Quỳnh','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10003','Lê Văn Bình','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10004','Phạm Thị Hương Giang','CN Thanh Xuân','active','Bình thường',now()),
  ('TX10005','Hoàng Minh Tuấn','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10006','Đặng Thị Ngọc Anh','CN Thanh Xuân','active','VIP Gold',now()),
  ('TX10007','Vũ Văn Hòa','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10008','Bùi Thị Lan Phương','CN Thanh Xuân','active','Bình thường',now()),
  ('TX10009','Đinh Văn Quân','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10010','Ngô Thị Kim Liên','CN Thanh Xuân','active','Bình thường',now()),
  ('TX10011','Hà Văn Thành','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10012','Phan Thị Bảo Châu','CN Thanh Xuân','active','Bình thường',now()),
  ('TX10013','Lý Quốc Khánh','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX10014','Trịnh Thị Thanh Nga','CN Thanh Xuân','active','Bình thường',now()),
  ('TX10015','Dương Văn Phú','CN Thanh Xuân','inactive','Bình thường',now()),
  -- CN Thanh Xuân (PHONG.MN — 8 KH)
  ('TX20001','Châu Minh Tiến','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX20002','Huỳnh Thị Mỹ Hạnh','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX20003','Lê Đức Trí','CN Thanh Xuân','active','Bình thường',now()),
  ('TX20004','Nguyễn Thị Bích Ngọc','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX20005','Trần Văn Toàn','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX20006','Phạm Thị Kim Anh','CN Thanh Xuân','active','Bình thường',now()),
  ('TX20007','Hoàng Đức Thịnh','CN Thanh Xuân','inactive','Bình thường',now()),
  ('TX20008','Đặng Thị Hải Vân','CN Thanh Xuân','active','Bình thường',now())
ON CONFLICT (account_id) DO NOTHING;

END $$;
