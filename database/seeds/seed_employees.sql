-- ============================================================
-- SEED: Chi nhánh + Nhân viên SA + SA Records (KPI data)
-- ============================================================
-- LƯU Ý: Nếu user_profiles.id có FK → auth.users.id thì sẽ báo lỗi.
-- Trong trường hợp đó, hãy tạo tài khoản trong Supabase Dashboard
-- (Authentication > Users) trước, rồi UPDATE user_profiles thay vì INSERT.
-- ============================================================

-- Dùng UUIDs cố định để sa_records có thể tham chiếu đúng user
DO $$
DECLARE
  -- CN Hà Nội
  u_hn1 uuid := 'a1000001-0000-0000-0000-000000000001';
  u_hn2 uuid := 'a1000001-0000-0000-0000-000000000002';
  u_hn3 uuid := 'a1000001-0000-0000-0000-000000000003';
  -- CN Hồ Chí Minh
  u_hcm1 uuid := 'a2000002-0000-0000-0000-000000000001';
  u_hcm2 uuid := 'a2000002-0000-0000-0000-000000000002';
  u_hcm3 uuid := 'a2000002-0000-0000-0000-000000000003';
  u_hcm4 uuid := 'a2000002-0000-0000-0000-000000000004';
  -- CN Đà Nẵng
  u_dn1 uuid := 'a3000003-0000-0000-0000-000000000001';
  u_dn2 uuid := 'a3000003-0000-0000-0000-000000000002';
  u_dn3 uuid := 'a3000003-0000-0000-0000-000000000003';
  -- CN Cần Thơ
  u_ct1 uuid := 'a4000004-0000-0000-0000-000000000001';
  u_ct2 uuid := 'a4000004-0000-0000-0000-000000000002';
  u_ct3 uuid := 'a4000004-0000-0000-0000-000000000003';
BEGIN

-- ============================================================
-- 1. USER PROFILES (SA employees)
-- ============================================================
INSERT INTO user_profiles (id, email, role, full_name, employee_code, phone, department, pic_name, branch, is_active, created_at, updated_at)
VALUES
  -- CN Hà Nội (3 SA)
  (u_hn1, 'nguyen.thi.lan@phs.vn',    'sa', 'Nguyễn Thị Lan',    'SA-HN001', '0912100001', 'SA', 'LAN.NT',  'CN Hà Nội',       true, now(), now()),
  (u_hn2, 'tran.van.minh@phs.vn',     'sa', 'Trần Văn Minh',     'SA-HN002', '0912100002', 'SA', 'MINH.TV', 'CN Hà Nội',       true, now(), now()),
  (u_hn3, 'le.thi.hoa@phs.vn',        'sa', 'Lê Thị Hoa',        'SA-HN003', '0912100003', 'SA', 'HOA.LT',  'CN Hà Nội',       true, now(), now()),
  -- CN Hồ Chí Minh (4 SA)
  (u_hcm1, 'pham.van.duc@phs.vn',     'sa', 'Phạm Văn Đức',      'SA-HCM001','0912200001', 'SA', 'DUC.PV',  'CN Hồ Chí Minh',  true, now(), now()),
  (u_hcm2, 'hoang.thi.mai@phs.vn',    'sa', 'Hoàng Thị Mai',     'SA-HCM002','0912200002', 'SA', 'MAI.HT',  'CN Hồ Chí Minh',  true, now(), now()),
  (u_hcm3, 'nguyen.van.tuan@phs.vn',  'sa', 'Nguyễn Văn Tuấn',   'SA-HCM003','0912200003', 'SA', 'TUAN.NV', 'CN Hồ Chí Minh',  true, now(), now()),
  (u_hcm4, 'do.thi.thu@phs.vn',       'sa', 'Đỗ Thị Thu',        'SA-HCM004','0912200004', 'SA', 'THU.DT',  'CN Hồ Chí Minh',  true, now(), now()),
  -- CN Đà Nẵng (3 SA)
  (u_dn1,  'vo.van.long@phs.vn',      'sa', 'Võ Văn Long',       'SA-DN001', '0912300001', 'SA', 'LONG.VV', 'CN Đà Nẵng',      true, now(), now()),
  (u_dn2,  'bui.thi.ngan@phs.vn',     'sa', 'Bùi Thị Ngân',      'SA-DN002', '0912300002', 'SA', 'NGAN.BT', 'CN Đà Nẵng',      true, now(), now()),
  (u_dn3,  'tran.quoc_hung@phs.vn',   'sa', 'Trần Quốc Hùng',    'SA-DN003', '0912300003', 'SA', 'HUNG.TQ', 'CN Đà Nẵng',      true, now(), now()),
  -- CN Cần Thơ (3 SA)
  (u_ct1,  'ly.van_khanh@phs.vn',     'sa', 'Lý Văn Khánh',      'SA-CT001', '0912400001', 'SA', 'KHANH.LV','CN Cần Thơ',      true, now(), now()),
  (u_ct2,  'nguyen.thi.xuan@phs.vn',  'sa', 'Nguyễn Thị Xuân',   'SA-CT002', '0912400002', 'SA', 'XUAN.NT', 'CN Cần Thơ',      true, now(), now()),
  (u_ct3,  'dang.van.binh@phs.vn',    'sa', 'Đặng Văn Bình',     'SA-CT003', '0912400003', 'SA', 'BINH.DV', 'CN Cần Thơ',      true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  branch    = EXCLUDED.branch,
  pic_name  = EXCLUDED.pic_name,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ============================================================
-- 2. SA RECORDS — tháng 04 và 05/2026
--    call_result options: 'Nghe máy – trao đổi' | 'Không nghe máy / không bắt máy' | 'Trực tiếp'
--    interest_level: 'Rất quan tâm – muốn giao dịch ngay' | 'Quan tâm – cần follow thêm' | 'Không quan tâm'
--    customer_group: 'A – Rất tiềm năng' | 'B – Tiềm năng' | 'C – Nuôi dưỡng'
-- ============================================================
INSERT INTO sa_records
  (id, account_id, pic, pic_user_id, call_date, follow_count, call_result, interest_level,
   customer_group, product_introduced, reactivation, info_support,
   total_transaction_value, transaction_fee, notes, handover_rm,
   next_action_date, status_at_call, indirect_type, indirect_fee, record_history,
   created_at, updated_at)
VALUES
-- == LAN.NT (Hà Nội) — top performer ==
(gen_random_uuid(),'HN10001','LAN.NT',u_hn1,'2026-04-03',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,150000000,375000,'KH muốn mua thêm cổ phiếu','RM-HN01','2026-04-10','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10002','LAN.NT',u_hn1,'2026-04-05',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,50000000,125000,'Follow thêm tuần sau',NULL,'2026-04-12','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10003','LAN.NT',u_hn1,'2026-04-08',1,'Không nghe máy / không bắt máy',NULL,'C – Nuôi dưỡng',false,false,false,NULL,NULL,'Gọi lại','',NULL,'inactive',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10004','LAN.NT',u_hn1,'2026-04-10',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,200000000,500000,'KH tái kích hoạt','RM-HN01','2026-04-17','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10005','LAN.NT',u_hn1,'2026-04-12',1,'Trực tiếp','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,80000000,200000,'Gặp trực tiếp tại CN',NULL,'2026-04-19','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10006','LAN.NT',u_hn1,'2026-04-15',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'Đang cân nhắc',NULL,'2026-04-22',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10007','LAN.NT',u_hn1,'2026-04-18',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,300000000,750000,'KH lớn bàn giao RM','RM-HN02','2026-04-25','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10008','LAN.NT',u_hn1,'2026-04-22',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'Gọi 3 lần không bắt','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10001','LAN.NT',u_hn1,'2026-05-02',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,120000000,300000,'Follow T5','RM-HN01','2026-05-09','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN10009','LAN.NT',u_hn1,'2026-05-04',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,true,true,90000000,225000,'KH mới tiếp cận',NULL,'2026-05-11','active',NULL,NULL,'[]',now(),now()),

-- == MINH.TV (Hà Nội) ==
(gen_random_uuid(),'HN20001','MINH.TV',u_hn2,'2026-04-04',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,60000000,150000,'KH quan tâm trái phiếu',NULL,'2026-04-11','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN20002','MINH.TV',u_hn2,'2026-04-07',1,'Không nghe máy / không bắt máy',NULL,'C – Nuôi dưỡng',false,false,false,NULL,NULL,'Để lại voicemail','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN20003','MINH.TV',u_hn2,'2026-04-09',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,180000000,450000,'Reactivation thành công','RM-HN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN20004','MINH.TV',u_hn2,'2026-04-14',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'KH từ chối','',NULL,'inactive',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN20005','MINH.TV',u_hn2,'2026-04-16',1,'Trực tiếp','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,45000000,112500,'Gặp KH tại văn phòng',NULL,'2026-04-23','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN20006','MINH.TV',u_hn2,'2026-04-21',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','A – Rất tiềm năng',true,true,false,220000000,550000,'KH VIP tái kích hoạt','RM-HN02',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN20001','MINH.TV',u_hn2,'2026-05-03',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',false,false,true,NULL,NULL,'Follow T5',NULL,'2026-05-10',NULL,NULL,NULL,'[]',now(),now()),

-- == HOA.LT (Hà Nội) — mid performer ==
(gen_random_uuid(),'HN30001','HOA.LT',u_hn3,'2026-04-06',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'Không liên lạc được','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN30002','HOA.LT',u_hn3,'2026-04-09',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'KH bận','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN30003','HOA.LT',u_hn3,'2026-04-13',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','C – Nuôi dưỡng',true,false,true,30000000,75000,'Cần thêm thời gian',NULL,'2026-04-20',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN30004','HOA.LT',u_hn3,'2026-04-17',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,100000000,250000,'','RM-HN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HN30005','HOA.LT',u_hn3,'2026-05-05',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'Mới gọi lần đầu',NULL,'2026-05-12',NULL,NULL,NULL,'[]',now(),now()),

-- == DUC.PV (HCM) — top ==
(gen_random_uuid(),'HCM10001','DUC.PV',u_hcm1,'2026-04-03',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,500000000,1250000,'KH lớn nhất CN','RM-HCM01','2026-04-10','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10002','DUC.PV',u_hcm1,'2026-04-05',1,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,350000000,875000,'Gặp trực tiếp, ký hợp đồng','RM-HCM01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10003','DUC.PV',u_hcm1,'2026-04-08',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,80000000,200000,'Follow up lần 2',NULL,'2026-04-15','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10004','DUC.PV',u_hcm1,'2026-04-11',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,420000000,1050000,'Reactivation lớn','RM-HCM02','2026-04-18','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10005','DUC.PV',u_hcm1,'2026-04-14',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10006','DUC.PV',u_hcm1,'2026-04-17',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,120000000,300000,'Đang xem xét portfolio',NULL,'2026-04-24','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10007','DUC.PV',u_hcm1,'2026-04-22',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,280000000,700000,'KH VIP follow dài hạn','RM-HCM01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10008','DUC.PV',u_hcm1,'2026-05-04',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,160000000,400000,'Tháng 5 mở đầu tốt','RM-HCM01','2026-05-11','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM10009','DUC.PV',u_hcm1,'2026-05-06',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,NULL,NULL,'Mới tiếp cận',NULL,'2026-05-13',NULL,NULL,NULL,'[]',now(),now()),

-- == MAI.HT (HCM) ==
(gen_random_uuid(),'HCM20001','MAI.HT',u_hcm2,'2026-04-04',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,70000000,175000,'',NULL,'2026-04-11',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM20002','MAI.HT',u_hcm2,'2026-04-07',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,250000000,625000,'Bàn giao RM thành công','RM-HCM02',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM20003','MAI.HT',u_hcm2,'2026-04-10',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM20004','MAI.HT',u_hcm2,'2026-04-15',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,true,true,110000000,275000,'Lần 2 chốt được reactivation',NULL,NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM20005','MAI.HT',u_hcm2,'2026-04-19',1,'Trực tiếp','Không quan tâm','C – Nuôi dưỡng',false,false,true,NULL,NULL,'Chỉ hỗ trợ thông tin','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM20006','MAI.HT',u_hcm2,'2026-04-24',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,190000000,475000,'Sắp bàn giao RM','RM-HCM02','2026-05-01','active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM20001','MAI.HT',u_hcm2,'2026-05-05',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'Follow T5',NULL,'2026-05-12',NULL,NULL,NULL,'[]',now(),now()),

-- == TUAN.NV (HCM) — low performer ==
(gen_random_uuid(),'HCM30001','TUAN.NV',u_hcm3,'2026-04-06',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM30002','TUAN.NV',u_hcm3,'2026-04-10',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'KH từ chối hoàn toàn','',NULL,'inactive',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM30003','TUAN.NV',u_hcm3,'2026-04-14',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','C – Nuôi dưỡng',true,false,true,25000000,62500,'',NULL,'2026-04-21',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM30004','TUAN.NV',u_hcm3,'2026-04-20',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM30005','TUAN.NV',u_hcm3,'2026-05-04',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),

-- == THU.DT (HCM) ==
(gen_random_uuid(),'HCM40001','THU.DT',u_hcm4,'2026-04-05',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,320000000,800000,'KH lớn T4','RM-HCM01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM40002','THU.DT',u_hcm4,'2026-04-09',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,55000000,137500,'',NULL,'2026-04-16',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM40003','THU.DT',u_hcm4,'2026-04-13',1,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,210000000,525000,'Gặp trực tiếp bàn giao','RM-HCM02',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM40004','THU.DT',u_hcm4,'2026-04-18',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'Follow lần 2',NULL,'2026-04-25',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM40005','THU.DT',u_hcm4,'2026-04-23',1,'Nghe máy – trao đổi','Không quan tâm','C – Nuôi dưỡng',false,false,true,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'HCM40001','THU.DT',u_hcm4,'2026-05-03',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,180000000,450000,'','RM-HCM01','2026-05-10','active',NULL,NULL,'[]',now(),now()),

-- == LONG.VV (Đà Nẵng) ==
(gen_random_uuid(),'DN10001','LONG.VV',u_dn1,'2026-04-04',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,200000000,500000,'Reactivation CN ĐN','RM-DN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN10002','LONG.VV',u_dn1,'2026-04-08',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,65000000,162500,'',NULL,'2026-04-15',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN10003','LONG.VV',u_dn1,'2026-04-14',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN10004','LONG.VV',u_dn1,'2026-04-18',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,150000000,375000,'Bàn giao RM','RM-DN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN10005','LONG.VV',u_dn1,'2026-04-22',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN10001','LONG.VV',u_dn1,'2026-05-04',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,NULL,NULL,'Follow T5',NULL,'2026-05-11',NULL,NULL,NULL,'[]',now(),now()),

-- == NGAN.BT (Đà Nẵng) ==
(gen_random_uuid(),'DN20001','NGAN.BT',u_dn2,'2026-04-06',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,40000000,100000,'',NULL,'2026-04-13',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN20002','NGAN.BT',u_dn2,'2026-04-11',1,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,130000000,325000,'Gặp trực tiếp KH DN','RM-DN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN20003','NGAN.BT',u_dn2,'2026-04-16',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','C – Nuôi dưỡng',false,false,true,NULL,NULL,'Cần thêm info',NULL,'2026-04-23',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN20004','NGAN.BT',u_dn2,'2026-04-21',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,175000000,437500,'','RM-DN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN20001','NGAN.BT',u_dn2,'2026-05-05',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'',NULL,'2026-05-12',NULL,NULL,NULL,'[]',now(),now()),

-- == HUNG.TQ (Đà Nẵng) ==
(gen_random_uuid(),'DN30001','HUNG.TQ',u_dn3,'2026-04-07',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN30002','HUNG.TQ',u_dn3,'2026-04-12',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,35000000,87500,'',NULL,'2026-04-19',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN30003','HUNG.TQ',u_dn3,'2026-04-17',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN30004','HUNG.TQ',u_dn3,'2026-04-24',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,95000000,237500,'','RM-DN01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'DN30001','HUNG.TQ',u_dn3,'2026-05-04',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',false,false,true,NULL,NULL,'T5 mới gọi',NULL,'2026-05-11',NULL,NULL,NULL,'[]',now(),now()),

-- == KHANH.LV (Cần Thơ) ==
(gen_random_uuid(),'CT10001','KHANH.LV',u_ct1,'2026-04-05',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,140000000,350000,'Reactivation Cần Thơ','RM-CT01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT10002','KHANH.LV',u_ct1,'2026-04-09',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT10003','KHANH.LV',u_ct1,'2026-04-14',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,60000000,150000,'',NULL,'2026-04-21',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT10004','KHANH.LV',u_ct1,'2026-04-19',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,190000000,475000,'','RM-CT01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT10005','KHANH.LV',u_ct1,'2026-04-23',1,'Nghe máy – trao đổi','Không quan tâm','C – Nuôi dưỡng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT10001','KHANH.LV',u_ct1,'2026-05-03',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,NULL,NULL,'Follow T5',NULL,'2026-05-10',NULL,NULL,NULL,'[]',now(),now()),

-- == XUAN.NT (Cần Thơ) ==
(gen_random_uuid(),'CT20001','XUAN.NT',u_ct2,'2026-04-06',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'',NULL,'2026-04-13',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT20002','XUAN.NT',u_ct2,'2026-04-11',1,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,160000000,400000,'','RM-CT01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT20003','XUAN.NT',u_ct2,'2026-04-15',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT20004','XUAN.NT',u_ct2,'2026-04-20',1,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,120000000,300000,'','RM-CT01',NULL,'active',NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT20001','XUAN.NT',u_ct2,'2026-05-04',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',false,false,true,NULL,NULL,'',NULL,'2026-05-11',NULL,NULL,NULL,'[]',now(),now()),

-- == BINH.DV (Cần Thơ) — low ==
(gen_random_uuid(),'CT30001','BINH.DV',u_ct3,'2026-04-08',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT30002','BINH.DV',u_ct3,'2026-04-13',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT30003','BINH.DV',u_ct3,'2026-04-17',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','C – Nuôi dưỡng',true,false,true,20000000,50000,'',NULL,'2026-04-24',NULL,NULL,NULL,'[]',now(),now()),
(gen_random_uuid(),'CT30004','BINH.DV',u_ct3,'2026-05-06',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,false,NULL,NULL,'Mới gọi T5',NULL,'2026-05-13',NULL,NULL,NULL,'[]',now(),now());

END $$;
