-- ============================================================
-- SEED PART 2: SA Records — T1 to T5/2026
-- Progression per customer: E/D → C → B → A (reactivation=true)
-- Chạy SAU seed_branches_part1.sql
-- ============================================================
DO $$
DECLARE
  u_tb1 uuid := 'c1000001-0000-0000-0000-000000000001'; -- HUNG.NV
  u_tb2 uuid := 'c1000001-0000-0000-0000-000000000002'; -- LINH.TT
  u_q11 uuid := 'c2000002-0000-0000-0000-000000000001'; -- KHOA.PV
  u_q12 uuid := 'c2000002-0000-0000-0000-000000000002'; -- ANH.NT
  u_tx1 uuid := 'c3000003-0000-0000-0000-000000000001'; -- TRANG.LT
  u_tx2 uuid := 'c3000003-0000-0000-0000-000000000002'; -- PHONG.MN
BEGIN

INSERT INTO sa_records
  (id,account_id,pic,pic_user_id,call_date,follow_count,call_result,interest_level,
   customer_group,product_introduced,reactivation,info_support,
   total_transaction_value,transaction_fee,notes,handover_rm,
   next_action_date,status_at_call,created_at,updated_at)
VALUES

-- ================================================================
-- HUNG.NV · CN Tân Bình (top performer)
-- ================================================================
-- TB10001: E→D→C→B→A
(gen_random_uuid(),'TB10001','HUNG.NV',u_tb1,'2026-01-08',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'Không bắt máy','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10001','HUNG.NV',u_tb1,'2026-02-10',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'Chưa có nhu cầu','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10001','HUNG.NV',u_tb1,'2026-03-12',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Bắt đầu quan tâm CK',NULL,'2026-03-26',NULL,now(),now()),
(gen_random_uuid(),'TB10001','HUNG.NV',u_tb1,'2026-04-05',4,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,30000000,75000,'Đang cân nhắc mở TK',NULL,'2026-04-19','active',now(),now()),
(gen_random_uuid(),'TB10001','HUNG.NV',u_tb1,'2026-04-22',5,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,120000000,300000,'Tái kích hoạt thành công','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10001','HUNG.NV',u_tb1,'2026-05-06',6,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,150000000,375000,'GD tiếp tục T5','RM-TB01','2026-05-20','active',now(),now()),

-- TB10002: E→C→B→A
(gen_random_uuid(),'TB10002','HUNG.NV',u_tb1,'2026-01-14',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10002','HUNG.NV',u_tb1,'2026-02-18',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'Hẹn gọi lại T3',NULL,'2026-03-18',NULL,now(),now()),
(gen_random_uuid(),'TB10002','HUNG.NV',u_tb1,'2026-03-20',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,20000000,50000,'GD nhỏ',NULL,'2026-04-03','active',now(),now()),
(gen_random_uuid(),'TB10002','HUNG.NV',u_tb1,'2026-04-10',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,85000000,212500,'Reactivation T4','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10002','HUNG.NV',u_tb1,'2026-05-08',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,100000000,250000,'Follow T5','RM-TB01','2026-05-22','active',now(),now()),

-- TB10003: D→C→B→A
(gen_random_uuid(),'TB10003','HUNG.NV',u_tb1,'2026-01-20',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10003','HUNG.NV',u_tb1,'2026-02-25',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Cần tư vấn thêm',NULL,'2026-03-11',NULL,now(),now()),
(gen_random_uuid(),'TB10003','HUNG.NV',u_tb1,'2026-03-25',3,'Trực tiếp','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,40000000,100000,'Gặp trực tiếp',NULL,'2026-04-08','active',now(),now()),
(gen_random_uuid(),'TB10003','HUNG.NV',u_tb1,'2026-04-15',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,200000000,500000,'KH lớn tái kích hoạt','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10003','HUNG.NV',u_tb1,'2026-05-12',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,180000000,450000,'GD tiếp tục','RM-TB01','2026-05-26','active',now(),now()),

-- TB10004: E→D→B→A
(gen_random_uuid(),'TB10004','HUNG.NV',u_tb1,'2026-01-09',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10004','HUNG.NV',u_tb1,'2026-02-12',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10004','HUNG.NV',u_tb1,'2026-03-18',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,25000000,62500,'Bắt đầu hứng thú',NULL,'2026-04-01','active',now(),now()),
(gen_random_uuid(),'TB10004','HUNG.NV',u_tb1,'2026-04-18',4,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,160000000,400000,'Tái kích hoạt T4','RM-TB02',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10004','HUNG.NV',u_tb1,'2026-05-14',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,140000000,350000,'Duy trì A T5','RM-TB02','2026-05-28','active',now(),now()),

-- TB10005: D→C→B (chưa lên A)
(gen_random_uuid(),'TB10005','HUNG.NV',u_tb1,'2026-01-15',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10005','HUNG.NV',u_tb1,'2026-02-20',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'Đang tìm hiểu',NULL,'2026-03-06',NULL,now(),now()),
(gen_random_uuid(),'TB10005','HUNG.NV',u_tb1,'2026-04-25',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,18000000,45000,'GD nhỏ T4',NULL,'2026-05-09','active',now(),now()),

-- TB10006: E→D→C→A
(gen_random_uuid(),'TB10006','HUNG.NV',u_tb1,'2026-01-22',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10006','HUNG.NV',u_tb1,'2026-02-26',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10006','HUNG.NV',u_tb1,'2026-03-30',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Cần demo thêm',NULL,'2026-04-13',NULL,now(),now()),
(gen_random_uuid(),'TB10006','HUNG.NV',u_tb1,'2026-04-28',4,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,250000000,625000,'Bước nhảy C→A','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10006','HUNG.NV',u_tb1,'2026-05-15',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,220000000,550000,'KH lớn T5','RM-TB01','2026-05-29','active',now(),now()),

-- TB10007: E→D→B
(gen_random_uuid(),'TB10007','HUNG.NV',u_tb1,'2026-02-05',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10007','HUNG.NV',u_tb1,'2026-03-10',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10007','HUNG.NV',u_tb1,'2026-04-20',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,15000000,37500,'',NULL,'2026-05-04','active',now(),now()),

-- TB10008: D→C→A→A
(gen_random_uuid(),'TB10008','HUNG.NV',u_tb1,'2026-02-08',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10008','HUNG.NV',u_tb1,'2026-03-15',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-03-29',NULL,now(),now()),
(gen_random_uuid(),'TB10008','HUNG.NV',u_tb1,'2026-04-12',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,95000000,237500,'Reactivation nhanh','RM-TB02',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10008','HUNG.NV',u_tb1,'2026-05-07',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,90000000,225000,'Duy trì T5','RM-TB02','2026-05-21','active',now(),now()),

-- TB10009: E→C→A
(gen_random_uuid(),'TB10009','HUNG.NV',u_tb1,'2026-01-28',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10009','HUNG.NV',u_tb1,'2026-03-05',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-03-19',NULL,now(),now()),
(gen_random_uuid(),'TB10009','HUNG.NV',u_tb1,'2026-04-08',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,130000000,325000,'Reactivation T4','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10009','HUNG.NV',u_tb1,'2026-05-10',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,118000000,295000,'Duy trì T5','RM-TB01','2026-05-24','active',now(),now()),

-- TB10010: B→A→A→A→A (VIP Gold đã sẵn sàng)
(gen_random_uuid(),'TB10010','HUNG.NV',u_tb1,'2026-01-10',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,50000000,125000,'KH VIP cũ follow',NULL,'2026-01-24','active',now(),now()),
(gen_random_uuid(),'TB10010','HUNG.NV',u_tb1,'2026-02-14',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,300000000,750000,'VIP Gold reactivation T2','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10010','HUNG.NV',u_tb1,'2026-03-17',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,280000000,700000,'GD đều T3','RM-TB01','2026-04-01','active',now(),now()),
(gen_random_uuid(),'TB10010','HUNG.NV',u_tb1,'2026-04-21',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,320000000,800000,'GD lớn T4','RM-TB01','2026-05-05','active',now(),now()),
(gen_random_uuid(),'TB10010','HUNG.NV',u_tb1,'2026-05-09',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,290000000,725000,'VIP Gold T5','RM-TB01','2026-05-23','active',now(),now()),

-- TB10011: E→D→B
(gen_random_uuid(),'TB10011','HUNG.NV',u_tb1,'2026-01-17',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10011','HUNG.NV',u_tb1,'2026-02-22',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10011','HUNG.NV',u_tb1,'2026-04-06',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,22000000,55000,'GD nhỏ T4',NULL,'2026-04-20','active',now(),now()),

-- TB10012: C→B→A
(gen_random_uuid(),'TB10012','HUNG.NV',u_tb1,'2026-01-23',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-02-06',NULL,now(),now()),
(gen_random_uuid(),'TB10012','HUNG.NV',u_tb1,'2026-03-03',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,28000000,70000,'',NULL,'2026-03-17','active',now(),now()),
(gen_random_uuid(),'TB10012','HUNG.NV',u_tb1,'2026-05-05',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,110000000,275000,'Reactivation T5','RM-TB02',NULL,'active',now(),now()),

-- TB10013: E→D→C
(gen_random_uuid(),'TB10013','HUNG.NV',u_tb1,'2026-02-03',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB10013','HUNG.NV',u_tb1,'2026-03-07',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB10013','HUNG.NV',u_tb1,'2026-04-16',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Đang cân nhắc',NULL,'2026-04-30',NULL,now(),now()),

-- TB10014: B→A→A→A
(gen_random_uuid(),'TB10014','HUNG.NV',u_tb1,'2026-01-25',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,35000000,87500,'',NULL,'2026-02-08','active',now(),now()),
(gen_random_uuid(),'TB10014','HUNG.NV',u_tb1,'2026-02-28',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,175000000,437500,'Reactivation T2','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10014','HUNG.NV',u_tb1,'2026-04-03',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,160000000,400000,'GD đều','RM-TB01','2026-04-17','active',now(),now()),
(gen_random_uuid(),'TB10014','HUNG.NV',u_tb1,'2026-05-10',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,145000000,362500,'Duy trì T5','RM-TB01','2026-05-24','active',now(),now()),

-- TB10015: B→A→A (VIP Gold từ T1)
(gen_random_uuid(),'TB10015','HUNG.NV',u_tb1,'2026-01-07',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,60000000,150000,'KH VIP cũ',NULL,'2026-01-21','active',now(),now()),
(gen_random_uuid(),'TB10015','HUNG.NV',u_tb1,'2026-02-11',2,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,380000000,950000,'VIP Gold tái kích hoạt T2','RM-TB01',NULL,'active',now(),now()),
(gen_random_uuid(),'TB10015','HUNG.NV',u_tb1,'2026-03-16',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,350000000,875000,'GD T3','RM-TB01','2026-03-30','active',now(),now()),
(gen_random_uuid(),'TB10015','HUNG.NV',u_tb1,'2026-04-17',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,400000000,1000000,'KH lớn T4','RM-TB01','2026-05-01','active',now(),now()),
(gen_random_uuid(),'TB10015','HUNG.NV',u_tb1,'2026-05-13',5,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,420000000,1050000,'VIP T5','RM-TB01','2026-05-27','active',now(),now()),

-- ================================================================
-- LINH.TT · CN Tân Bình (mid performer)
-- ================================================================
-- TB20001: E→D→B→A
(gen_random_uuid(),'TB20001','LINH.TT',u_tb2,'2026-01-11',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB20001','LINH.TT',u_tb2,'2026-02-15',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB20001','LINH.TT',u_tb2,'2026-03-19',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,20000000,50000,'',NULL,'2026-04-02','active',now(),now()),
(gen_random_uuid(),'TB20001','LINH.TT',u_tb2,'2026-04-23',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,80000000,200000,'Reactivation T4','RM-TB02',NULL,'active',now(),now()),
(gen_random_uuid(),'TB20001','LINH.TT',u_tb2,'2026-05-17',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,72000000,180000,'GD T5','RM-TB02','2026-05-31','active',now(),now()),

-- TB20002: D→C→B
(gen_random_uuid(),'TB20002','LINH.TT',u_tb2,'2026-01-16',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB20002','LINH.TT',u_tb2,'2026-03-10',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-03-24',NULL,now(),now()),
(gen_random_uuid(),'TB20002','LINH.TT',u_tb2,'2026-04-20',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,15000000,37500,'',NULL,'2026-05-04','active',now(),now()),

-- TB20003: E→C→A
(gen_random_uuid(),'TB20003','LINH.TT',u_tb2,'2026-02-04',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB20003','LINH.TT',u_tb2,'2026-03-11',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-03-25',NULL,now(),now()),
(gen_random_uuid(),'TB20003','LINH.TT',u_tb2,'2026-05-04',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,60000000,150000,'Reactivation T5','RM-TB02',NULL,'active',now(),now()),

-- TB20004: D→C
(gen_random_uuid(),'TB20004','LINH.TT',u_tb2,'2026-01-24',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB20004','LINH.TT',u_tb2,'2026-04-13',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-04-27',NULL,now(),now()),

-- TB20005: C→B→A→A
(gen_random_uuid(),'TB20005','LINH.TT',u_tb2,'2026-02-06',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-02-20',NULL,now(),now()),
(gen_random_uuid(),'TB20005','LINH.TT',u_tb2,'2026-03-13',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,12000000,30000,'',NULL,'2026-03-27','active',now(),now()),
(gen_random_uuid(),'TB20005','LINH.TT',u_tb2,'2026-04-26',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,55000000,137500,'Reactivation T4','RM-TB02',NULL,'active',now(),now()),
(gen_random_uuid(),'TB20005','LINH.TT',u_tb2,'2026-05-16',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,50000000,125000,'Duy trì T5','RM-TB02','2026-05-30','active',now(),now()),

-- TB20006: E→D→C
(gen_random_uuid(),'TB20006','LINH.TT',u_tb2,'2026-01-27',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB20006','LINH.TT',u_tb2,'2026-03-24',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB20006','LINH.TT',u_tb2,'2026-05-08',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Đang xem xét',NULL,'2026-05-22',NULL,now(),now()),

-- TB20007: B→A→A
(gen_random_uuid(),'TB20007','LINH.TT',u_tb2,'2026-02-13',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,10000000,25000,'',NULL,'2026-02-27','active',now(),now()),
(gen_random_uuid(),'TB20007','LINH.TT',u_tb2,'2026-03-27',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,70000000,175000,'Reactivation T3','RM-TB02',NULL,'active',now(),now()),
(gen_random_uuid(),'TB20007','LINH.TT',u_tb2,'2026-05-12',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,65000000,162500,'Duy trì T5','RM-TB02','2026-05-26','active',now(),now()),

-- TB20008: E→D
(gen_random_uuid(),'TB20008','LINH.TT',u_tb2,'2026-01-30',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TB20008','LINH.TT',u_tb2,'2026-04-17',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),

-- TB20009: D→C
(gen_random_uuid(),'TB20009','LINH.TT',u_tb2,'2026-02-21',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TB20009','LINH.TT',u_tb2,'2026-04-05',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-04-19',NULL,now(),now()),

-- TB20010: C→B→A
(gen_random_uuid(),'TB20010','LINH.TT',u_tb2,'2026-01-08',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-01-22',NULL,now(),now()),
(gen_random_uuid(),'TB20010','LINH.TT',u_tb2,'2026-03-06',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,16000000,40000,'',NULL,'2026-03-20','active',now(),now()),
(gen_random_uuid(),'TB20010','LINH.TT',u_tb2,'2026-05-06',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,72000000,180000,'Reactivation T5','RM-TB02',NULL,'active',now(),now()),

-- ================================================================
-- KHOA.PV · CN Quận 1 (top performer)
-- ================================================================
-- Q110001: B→A→A→A→A (VIP Gold)
(gen_random_uuid(),'Q110001','KHOA.PV',u_q11,'2026-01-06',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,80000000,200000,'KH VIP Gold cũ',NULL,'2026-01-20','active',now(),now()),
(gen_random_uuid(),'Q110001','KHOA.PV',u_q11,'2026-02-09',2,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,450000000,1125000,'VIP Gold reactivation T2','RM-Q1-01',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110001','KHOA.PV',u_q11,'2026-03-13',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,400000000,1000000,'GD T3','RM-Q1-01','2026-03-27','active',now(),now()),
(gen_random_uuid(),'Q110001','KHOA.PV',u_q11,'2026-04-14',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,500000000,1250000,'GD lớn T4','RM-Q1-01','2026-04-28','active',now(),now()),
(gen_random_uuid(),'Q110001','KHOA.PV',u_q11,'2026-05-12',5,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,480000000,1200000,'VIP T5','RM-Q1-01','2026-05-26','active',now(),now()),

-- Q110002: E→D→C→A→A
(gen_random_uuid(),'Q110002','KHOA.PV',u_q11,'2026-01-13',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110002','KHOA.PV',u_q11,'2026-02-17',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q110002','KHOA.PV',u_q11,'2026-03-21',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-04-04',NULL,now(),now()),
(gen_random_uuid(),'Q110002','KHOA.PV',u_q11,'2026-04-16',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,120000000,300000,'Reactivation T4','RM-Q1-02',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110002','KHOA.PV',u_q11,'2026-05-14',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,110000000,275000,'GD T5','RM-Q1-02','2026-05-28','active',now(),now()),

-- Q110003: E→D→B→A
(gen_random_uuid(),'Q110003','KHOA.PV',u_q11,'2026-01-18',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110003','KHOA.PV',u_q11,'2026-02-24',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q110003','KHOA.PV',u_q11,'2026-04-02',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,30000000,75000,'',NULL,'2026-04-16','active',now(),now()),
(gen_random_uuid(),'Q110003','KHOA.PV',u_q11,'2026-05-07',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,140000000,350000,'Reactivation T5','RM-Q1-01',NULL,'active',now(),now()),

-- Q110004: C→B→A→A
(gen_random_uuid(),'Q110004','KHOA.PV',u_q11,'2026-01-21',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-02-04',NULL,now(),now()),
(gen_random_uuid(),'Q110004','KHOA.PV',u_q11,'2026-03-01',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,25000000,62500,'',NULL,'2026-03-15','active',now(),now()),
(gen_random_uuid(),'Q110004','KHOA.PV',u_q11,'2026-04-04',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,190000000,475000,'Reactivation T4','RM-Q1-02',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110004','KHOA.PV',u_q11,'2026-05-09',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,170000000,425000,'GD T5','RM-Q1-02','2026-05-23','active',now(),now()),

-- Q110005: E→D→C
(gen_random_uuid(),'Q110005','KHOA.PV',u_q11,'2026-01-26',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110005','KHOA.PV',u_q11,'2026-02-28',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q110005','KHOA.PV',u_q11,'2026-04-07',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-04-21',NULL,now(),now()),

-- Q110006: B→A→A→A→A (VIP Gold)
(gen_random_uuid(),'Q110006','KHOA.PV',u_q11,'2026-01-08',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,70000000,175000,'KH VIP Gold',NULL,'2026-01-22','active',now(),now()),
(gen_random_uuid(),'Q110006','KHOA.PV',u_q11,'2026-02-12',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,320000000,800000,'VIP Gold reactivation T2','RM-Q1-01',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110006','KHOA.PV',u_q11,'2026-03-18',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,300000000,750000,'GD T3','RM-Q1-01','2026-04-01','active',now(),now()),
(gen_random_uuid(),'Q110006','KHOA.PV',u_q11,'2026-04-19',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,350000000,875000,'GD T4','RM-Q1-01','2026-05-03','active',now(),now()),
(gen_random_uuid(),'Q110006','KHOA.PV',u_q11,'2026-05-15',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,330000000,825000,'VIP T5','RM-Q1-01','2026-05-29','active',now(),now()),

-- Q110007: E→D→B
(gen_random_uuid(),'Q110007','KHOA.PV',u_q11,'2026-02-03',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110007','KHOA.PV',u_q11,'2026-03-08',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q110007','KHOA.PV',u_q11,'2026-04-11',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,18000000,45000,'',NULL,'2026-04-25','active',now(),now()),

-- Q110008: C→B→A
(gen_random_uuid(),'Q110008','KHOA.PV',u_q11,'2026-01-15',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-01-29',NULL,now(),now()),
(gen_random_uuid(),'Q110008','KHOA.PV',u_q11,'2026-02-20',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,22000000,55000,'',NULL,'2026-03-06','active',now(),now()),
(gen_random_uuid(),'Q110008','KHOA.PV',u_q11,'2026-04-24',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,95000000,237500,'Reactivation T4','RM-Q1-02',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110008','KHOA.PV',u_q11,'2026-05-19',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,88000000,220000,'GD T5','RM-Q1-02','2026-06-02','active',now(),now()),

-- Q110009: E→C
(gen_random_uuid(),'Q110009','KHOA.PV',u_q11,'2026-01-29',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110009','KHOA.PV',u_q11,'2026-04-27',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Vừa tái liên hệ',NULL,'2026-05-11',NULL,now(),now()),

-- Q110010: A→A→A→A→A (VIP Platinum siêu KH)
(gen_random_uuid(),'Q110010','KHOA.PV',u_q11,'2026-01-07',1,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,600000000,1500000,'KH VIP Platinum lớn nhất','RM-Q1-01',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110010','KHOA.PV',u_q11,'2026-02-11',2,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,550000000,1375000,'GD T2','RM-Q1-01','2026-02-25','active',now(),now()),
(gen_random_uuid(),'Q110010','KHOA.PV',u_q11,'2026-03-12',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,580000000,1450000,'GD T3','RM-Q1-01','2026-03-26','active',now(),now()),
(gen_random_uuid(),'Q110010','KHOA.PV',u_q11,'2026-04-10',4,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,620000000,1550000,'GD lớn nhất T4','RM-Q1-01','2026-04-24','active',now(),now()),
(gen_random_uuid(),'Q110010','KHOA.PV',u_q11,'2026-05-08',5,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,590000000,1475000,'VIP Platinum T5','RM-Q1-01','2026-05-22','active',now(),now()),

-- Q110011: E→D→C
(gen_random_uuid(),'Q110011','KHOA.PV',u_q11,'2026-02-06',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110011','KHOA.PV',u_q11,'2026-03-16',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q110011','KHOA.PV',u_q11,'2026-05-10',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Đang xem xét lại',NULL,'2026-05-24',NULL,now(),now()),

-- Q110012: C→B→A→A
(gen_random_uuid(),'Q110012','KHOA.PV',u_q11,'2026-01-23',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-02-06',NULL,now(),now()),
(gen_random_uuid(),'Q110012','KHOA.PV',u_q11,'2026-03-05',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,35000000,87500,'',NULL,'2026-03-19','active',now(),now()),
(gen_random_uuid(),'Q110012','KHOA.PV',u_q11,'2026-04-22',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,155000000,387500,'Reactivation T4','RM-Q1-02',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110012','KHOA.PV',u_q11,'2026-05-18',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,140000000,350000,'GD T5','RM-Q1-02','2026-06-01','active',now(),now()),

-- Q110013: E→D
(gen_random_uuid(),'Q110013','KHOA.PV',u_q11,'2026-02-14',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110013','KHOA.PV',u_q11,'2026-04-29',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),

-- Q110014: B→A→A
(gen_random_uuid(),'Q110014','KHOA.PV',u_q11,'2026-01-30',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,28000000,70000,'',NULL,'2026-02-13','active',now(),now()),
(gen_random_uuid(),'Q110014','KHOA.PV',u_q11,'2026-03-04',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,130000000,325000,'Reactivation T3','RM-Q1-01',NULL,'active',now(),now()),
(gen_random_uuid(),'Q110014','KHOA.PV',u_q11,'2026-05-06',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,115000000,287500,'Duy trì T5','RM-Q1-01','2026-05-20','active',now(),now()),

-- Q110015: E→D→C
(gen_random_uuid(),'Q110015','KHOA.PV',u_q11,'2026-02-09',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q110015','KHOA.PV',u_q11,'2026-03-23',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q110015','KHOA.PV',u_q11,'2026-05-13',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-05-27',NULL,now(),now()),

-- ================================================================
-- ANH.NT · CN Quận 1 (mid performer)
-- ================================================================
-- Q120001: E→D→B→A
(gen_random_uuid(),'Q120001','ANH.NT',u_q12,'2026-01-14',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q120001','ANH.NT',u_q12,'2026-02-19',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q120001','ANH.NT',u_q12,'2026-03-26',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,18000000,45000,'',NULL,'2026-04-09','active',now(),now()),
(gen_random_uuid(),'Q120001','ANH.NT',u_q12,'2026-05-04',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,70000000,175000,'Reactivation T5','RM-Q1-02',NULL,'active',now(),now()),

-- Q120002: D→C→B
(gen_random_uuid(),'Q120002','ANH.NT',u_q12,'2026-01-22',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'Q120002','ANH.NT',u_q12,'2026-03-15',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-03-29',NULL,now(),now()),
(gen_random_uuid(),'Q120002','ANH.NT',u_q12,'2026-04-25',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,12000000,30000,'',NULL,'2026-05-09','active',now(),now()),

-- Q120003: E→C→A
(gen_random_uuid(),'Q120003','ANH.NT',u_q12,'2026-02-11',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q120003','ANH.NT',u_q12,'2026-04-08',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-04-22',NULL,now(),now()),
(gen_random_uuid(),'Q120003','ANH.NT',u_q12,'2026-05-17',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,55000000,137500,'Reactivation T5','RM-Q1-02',NULL,'active',now(),now()),

-- Q120004: C→D
(gen_random_uuid(),'Q120004','ANH.NT',u_q12,'2026-01-28',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-02-11',NULL,now(),now()),
(gen_random_uuid(),'Q120004','ANH.NT',u_q12,'2026-03-20',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'KH đổi ý','',NULL,'inactive',now(),now()),

-- Q120005: E→D
(gen_random_uuid(),'Q120005','ANH.NT',u_q12,'2026-02-16',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q120005','ANH.NT',u_q12,'2026-04-18',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),

-- Q120006: B→A→A
(gen_random_uuid(),'Q120006','ANH.NT',u_q12,'2026-01-10',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,15000000,37500,'',NULL,'2026-01-24','active',now(),now()),
(gen_random_uuid(),'Q120006','ANH.NT',u_q12,'2026-03-09',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,65000000,162500,'Reactivation T3','RM-Q1-02',NULL,'active',now(),now()),
(gen_random_uuid(),'Q120006','ANH.NT',u_q12,'2026-05-13',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,60000000,150000,'Duy trì T5','RM-Q1-02','2026-05-27','active',now(),now()),

-- Q120007: E→C
(gen_random_uuid(),'Q120007','ANH.NT',u_q12,'2026-02-24',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'Q120007','ANH.NT',u_q12,'2026-04-14',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-04-28',NULL,now(),now()),

-- Q120008: C→B→A
(gen_random_uuid(),'Q120008','ANH.NT',u_q12,'2026-01-17',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-01-31',NULL,now(),now()),
(gen_random_uuid(),'Q120008','ANH.NT',u_q12,'2026-03-26',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,10000000,25000,'',NULL,'2026-04-09','active',now(),now()),
(gen_random_uuid(),'Q120008','ANH.NT',u_q12,'2026-05-07',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,45000000,112500,'Reactivation T5','RM-Q1-02',NULL,'active',now(),now()),

-- ================================================================
-- TRANG.LT · CN Thanh Xuân (top performer)
-- ================================================================
-- TX10001: B→A→A→A→A (VIP Gold)
(gen_random_uuid(),'TX10001','TRANG.LT',u_tx1,'2026-01-05',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,75000000,187500,'KH VIP Gold TX',NULL,'2026-01-19','active',now(),now()),
(gen_random_uuid(),'TX10001','TRANG.LT',u_tx1,'2026-02-09',2,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,420000000,1050000,'VIP Gold reactivation T2','RM-TX-01',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10001','TRANG.LT',u_tx1,'2026-03-11',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,390000000,975000,'GD T3','RM-TX-01','2026-03-25','active',now(),now()),
(gen_random_uuid(),'TX10001','TRANG.LT',u_tx1,'2026-04-13',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,460000000,1150000,'GD T4','RM-TX-01','2026-04-27','active',now(),now()),
(gen_random_uuid(),'TX10001','TRANG.LT',u_tx1,'2026-05-11',5,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,440000000,1100000,'VIP T5','RM-TX-01','2026-05-25','active',now(),now()),

-- TX10002: E→D→C→A→A
(gen_random_uuid(),'TX10002','TRANG.LT',u_tx1,'2026-01-12',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10002','TRANG.LT',u_tx1,'2026-02-16',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX10002','TRANG.LT',u_tx1,'2026-03-20',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-04-03',NULL,now(),now()),
(gen_random_uuid(),'TX10002','TRANG.LT',u_tx1,'2026-04-15',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,115000000,287500,'Reactivation T4','RM-TX-02',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10002','TRANG.LT',u_tx1,'2026-05-13',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,105000000,262500,'GD T5','RM-TX-02','2026-05-27','active',now(),now()),

-- TX10003: E→D→B→A
(gen_random_uuid(),'TX10003','TRANG.LT',u_tx1,'2026-01-19',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10003','TRANG.LT',u_tx1,'2026-02-23',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX10003','TRANG.LT',u_tx1,'2026-04-01',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,28000000,70000,'',NULL,'2026-04-15','active',now(),now()),
(gen_random_uuid(),'TX10003','TRANG.LT',u_tx1,'2026-05-06',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,130000000,325000,'Reactivation T5','RM-TX-01',NULL,'active',now(),now()),

-- TX10004: C→B→A→A
(gen_random_uuid(),'TX10004','TRANG.LT',u_tx1,'2026-01-22',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-02-05',NULL,now(),now()),
(gen_random_uuid(),'TX10004','TRANG.LT',u_tx1,'2026-02-27',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,22000000,55000,'',NULL,'2026-03-13','active',now(),now()),
(gen_random_uuid(),'TX10004','TRANG.LT',u_tx1,'2026-04-03',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,180000000,450000,'Reactivation T4','RM-TX-02',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10004','TRANG.LT',u_tx1,'2026-05-08',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,160000000,400000,'GD T5','RM-TX-02','2026-05-22','active',now(),now()),

-- TX10005: E→D→C
(gen_random_uuid(),'TX10005','TRANG.LT',u_tx1,'2026-01-27',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10005','TRANG.LT',u_tx1,'2026-03-02',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX10005','TRANG.LT',u_tx1,'2026-04-06',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-04-20',NULL,now(),now()),

-- TX10006: B→A→A→A→A (VIP Gold)
(gen_random_uuid(),'TX10006','TRANG.LT',u_tx1,'2026-01-09',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,65000000,162500,'KH VIP Gold TX',NULL,'2026-01-23','active',now(),now()),
(gen_random_uuid(),'TX10006','TRANG.LT',u_tx1,'2026-02-13',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,310000000,775000,'VIP Gold reactivation T2','RM-TX-01',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10006','TRANG.LT',u_tx1,'2026-03-17',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,290000000,725000,'GD T3','RM-TX-01','2026-03-31','active',now(),now()),
(gen_random_uuid(),'TX10006','TRANG.LT',u_tx1,'2026-04-18',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,340000000,850000,'GD T4','RM-TX-01','2026-05-02','active',now(),now()),
(gen_random_uuid(),'TX10006','TRANG.LT',u_tx1,'2026-05-16',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,320000000,800000,'VIP T5','RM-TX-01','2026-05-30','active',now(),now()),

-- TX10007: E→D→B
(gen_random_uuid(),'TX10007','TRANG.LT',u_tx1,'2026-02-04',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10007','TRANG.LT',u_tx1,'2026-03-09',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX10007','TRANG.LT',u_tx1,'2026-04-10',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,16000000,40000,'',NULL,'2026-04-24','active',now(),now()),

-- TX10008: C→B→A→A
(gen_random_uuid(),'TX10008','TRANG.LT',u_tx1,'2026-01-16',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-01-30',NULL,now(),now()),
(gen_random_uuid(),'TX10008','TRANG.LT',u_tx1,'2026-02-21',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,20000000,50000,'',NULL,'2026-03-07','active',now(),now()),
(gen_random_uuid(),'TX10008','TRANG.LT',u_tx1,'2026-04-23',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,90000000,225000,'Reactivation T4','RM-TX-02',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10008','TRANG.LT',u_tx1,'2026-05-19',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,82000000,205000,'GD T5','RM-TX-02','2026-06-02','active',now(),now()),

-- TX10009: E→C
(gen_random_uuid(),'TX10009','TRANG.LT',u_tx1,'2026-01-30',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10009','TRANG.LT',u_tx1,'2026-04-28',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Vừa tái tiếp cận',NULL,'2026-05-12',NULL,now(),now()),

-- TX10010: B→A→A→A→A
(gen_random_uuid(),'TX10010','TRANG.LT',u_tx1,'2026-01-08',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,42000000,105000,'',NULL,'2026-01-22','active',now(),now()),
(gen_random_uuid(),'TX10010','TRANG.LT',u_tx1,'2026-02-12',2,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,200000000,500000,'Reactivation T2','RM-TX-01',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10010','TRANG.LT',u_tx1,'2026-03-16',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,185000000,462500,'GD T3','RM-TX-01','2026-03-30','active',now(),now()),
(gen_random_uuid(),'TX10010','TRANG.LT',u_tx1,'2026-04-20',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,210000000,525000,'GD T4','RM-TX-01','2026-05-04','active',now(),now()),
(gen_random_uuid(),'TX10010','TRANG.LT',u_tx1,'2026-05-14',5,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,195000000,487500,'Duy trì T5','RM-TX-01','2026-05-28','active',now(),now()),

-- TX10011: E→D→C
(gen_random_uuid(),'TX10011','TRANG.LT',u_tx1,'2026-02-07',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10011','TRANG.LT',u_tx1,'2026-03-14',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX10011','TRANG.LT',u_tx1,'2026-05-09',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Tiến triển T5',NULL,'2026-05-23',NULL,now(),now()),

-- TX10012: C→B→A→A
(gen_random_uuid(),'TX10012','TRANG.LT',u_tx1,'2026-01-24',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-02-07',NULL,now(),now()),
(gen_random_uuid(),'TX10012','TRANG.LT',u_tx1,'2026-03-06',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,32000000,80000,'',NULL,'2026-03-20','active',now(),now()),
(gen_random_uuid(),'TX10012','TRANG.LT',u_tx1,'2026-04-21',3,'Trực tiếp','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,145000000,362500,'Reactivation T4','RM-TX-02',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10012','TRANG.LT',u_tx1,'2026-05-17',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,135000000,337500,'GD T5','RM-TX-02','2026-05-31','active',now(),now()),

-- TX10013: E→D
(gen_random_uuid(),'TX10013','TRANG.LT',u_tx1,'2026-02-14',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10013','TRANG.LT',u_tx1,'2026-04-29',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),

-- TX10014: B→A→A
(gen_random_uuid(),'TX10014','TRANG.LT',u_tx1,'2026-01-31',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,25000000,62500,'',NULL,'2026-02-14','active',now(),now()),
(gen_random_uuid(),'TX10014','TRANG.LT',u_tx1,'2026-03-07',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,120000000,300000,'Reactivation T3','RM-TX-01',NULL,'active',now(),now()),
(gen_random_uuid(),'TX10014','TRANG.LT',u_tx1,'2026-05-05',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,108000000,270000,'GD T5','RM-TX-01','2026-05-19','active',now(),now()),

-- TX10015: E→D→C
(gen_random_uuid(),'TX10015','TRANG.LT',u_tx1,'2026-02-10',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX10015','TRANG.LT',u_tx1,'2026-03-24',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX10015','TRANG.LT',u_tx1,'2026-05-14',3,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-05-28',NULL,now(),now()),

-- ================================================================
-- PHONG.MN · CN Thanh Xuân (mid performer)
-- ================================================================
-- TX20001: E→D→B→A
(gen_random_uuid(),'TX20001','PHONG.MN',u_tx2,'2026-01-13',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX20001','PHONG.MN',u_tx2,'2026-02-18',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX20001','PHONG.MN',u_tx2,'2026-03-25',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,14000000,35000,'',NULL,'2026-04-08','active',now(),now()),
(gen_random_uuid(),'TX20001','PHONG.MN',u_tx2,'2026-05-05',4,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,58000000,145000,'Reactivation T5','RM-TX-02',NULL,'active',now(),now()),

-- TX20002: D→C→B
(gen_random_uuid(),'TX20002','PHONG.MN',u_tx2,'2026-01-20',1,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),
(gen_random_uuid(),'TX20002','PHONG.MN',u_tx2,'2026-03-12',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-03-26',NULL,now(),now()),
(gen_random_uuid(),'TX20002','PHONG.MN',u_tx2,'2026-04-22',3,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,11000000,27500,'',NULL,'2026-05-06','active',now(),now()),

-- TX20003: C→B→A
(gen_random_uuid(),'TX20003','PHONG.MN',u_tx2,'2026-02-03',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'',NULL,'2026-02-17',NULL,now(),now()),
(gen_random_uuid(),'TX20003','PHONG.MN',u_tx2,'2026-03-17',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,13000000,32500,'',NULL,'2026-03-31','active',now(),now()),
(gen_random_uuid(),'TX20003','PHONG.MN',u_tx2,'2026-05-08',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,52000000,130000,'Reactivation T5','RM-TX-02',NULL,'active',now(),now()),

-- TX20004: E→D
(gen_random_uuid(),'TX20004','PHONG.MN',u_tx2,'2026-01-25',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX20004','PHONG.MN',u_tx2,'2026-04-10',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),

-- TX20005: E→C
(gen_random_uuid(),'TX20005','PHONG.MN',u_tx2,'2026-02-10',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX20005','PHONG.MN',u_tx2,'2026-04-16',2,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,true,NULL,NULL,'Đang quan tâm',NULL,'2026-04-30',NULL,now(),now()),

-- TX20006: B→A→A
(gen_random_uuid(),'TX20006','PHONG.MN',u_tx2,'2026-01-08',1,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,12000000,30000,'',NULL,'2026-01-22','active',now(),now()),
(gen_random_uuid(),'TX20006','PHONG.MN',u_tx2,'2026-03-10',2,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,55000000,137500,'Reactivation T3','RM-TX-02',NULL,'active',now(),now()),
(gen_random_uuid(),'TX20006','PHONG.MN',u_tx2,'2026-05-12',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,false,true,50000000,125000,'Duy trì T5','RM-TX-02','2026-05-26','active',now(),now()),

-- TX20007: E→D
(gen_random_uuid(),'TX20007','PHONG.MN',u_tx2,'2026-02-20',1,'Không nghe máy / không bắt máy',NULL,'E – Không nghe máy',false,false,false,NULL,NULL,'','',NULL,NULL,now(),now()),
(gen_random_uuid(),'TX20007','PHONG.MN',u_tx2,'2026-04-25',2,'Nghe máy – trao đổi','Không quan tâm','D – Không tiềm năng',false,false,false,NULL,NULL,'','',NULL,'inactive',now(),now()),

-- TX20008: C→B→A
(gen_random_uuid(),'TX20008','PHONG.MN',u_tx2,'2026-01-15',1,'Nghe máy – trao đổi','Nghe nhưng chưa có nhu cầu','C – Nuôi dưỡng',true,false,false,NULL,NULL,'',NULL,'2026-01-29',NULL,now(),now()),
(gen_random_uuid(),'TX20008','PHONG.MN',u_tx2,'2026-03-22',2,'Nghe máy – trao đổi','Quan tâm – cần follow thêm','B – Tiềm năng',true,false,true,9000000,22500,'',NULL,'2026-04-05','active',now(),now()),
(gen_random_uuid(),'TX20008','PHONG.MN',u_tx2,'2026-05-18',3,'Nghe máy – trao đổi','Rất quan tâm – muốn giao dịch ngay','A – Rất tiềm năng',true,true,true,40000000,100000,'Reactivation T5','RM-TX-02',NULL,'active',now(),now());

END $$;
