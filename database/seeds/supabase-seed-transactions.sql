-- PHS Mini CRM — Seed Transaction Logs
-- ~2500 realistic transaction records for existing customers
-- Run AFTER supabase-schema.sql and after customers exist
-- ============================================

DO $$
DECLARE
  cust RECORD;
  i INT;
  num_trades INT;
  t_date DATE;
  t_time TIME;
  t_product TEXT;
  t_ticker TEXT;
  t_order TEXT;
  t_volume NUMERIC;
  t_matched NUMERIC;
  t_price NUMERIC;
  t_value NUMERIC;
  t_fee NUMERIC;
  t_status TEXT;
  t_channel TEXT;
  last_trade_offset INT;
  r FLOAT;
  product_roll FLOAT;
  channel_roll FLOAT;
  status_roll FLOAT;

  -- Mã CK thực tế trên sàn HOSE/HNX
  tickers_stock TEXT[] := ARRAY['VNM','HPG','FPT','VIC','VHM','MWG','TCB','VPB','ACB','STB','SSI','VND','HCM','MBB','BID','CTG','TPB','MSN','REE','PNJ','DGC','GAS','PLX','POW','KDH','NVL','VRE','GMD','PVD','DPM'];
  tickers_bond TEXT[] := ARRAY['VCB_BOND','BID_BOND','CTG_BOND','TCB_BOND','VPB_BOND'];
  tickers_fund TEXT[] := ARRAY['VFMVN30','E1VFVN30','FUEVFVND','FUESSVFL','FUEDCMID'];
  tickers_deriv TEXT[] := ARRAY['VN30F2506','VN30F2503','VN30F2504','VN30F2507'];

BEGIN
  FOR cust IN SELECT account_id, vip_tier FROM customers LOOP

    -- Số giao dịch tùy VIP tier (KH VIP giao dịch nhiều hơn)
    IF cust.vip_tier = 'VIP Diamond' THEN
      num_trades := 15 + floor(random() * 10)::INT;  -- 15-24
    ELSIF cust.vip_tier = 'VIP Platinum' THEN
      num_trades := 12 + floor(random() * 8)::INT;   -- 12-19
    ELSIF cust.vip_tier = 'VIP Gold' THEN
      num_trades := 8 + floor(random() * 8)::INT;    -- 8-15
    ELSE
      num_trades := 3 + floor(random() * 12)::INT;   -- 3-14
    END IF;

    -- Phần lớn KH inactive 90-365 ngày (SA reactivation target)
    -- 30% active gần đây (<90 ngày), 70% inactive
    IF random() < 0.30 THEN
      last_trade_offset := floor(random() * 89)::INT;   -- 0-89 ngày trước
    ELSE
      last_trade_offset := 90 + floor(random() * 275)::INT;  -- 90-365 ngày trước
    END IF;

    FOR i IN 1..num_trades LOOP
      -- Ngày giao dịch: rải từ last_trade_offset đến 365 ngày trước
      t_date := CURRENT_DATE - (last_trade_offset + floor(random() * (365 - last_trade_offset))::INT);
      IF t_date < '2025-01-01' THEN t_date := '2025-01-01' + floor(random() * 100)::INT; END IF;

      -- Giờ giao dịch: 9:00 - 14:45 (giờ giao dịch sàn)
      t_time := '09:00:00'::TIME + (floor(random() * 345)::INT * INTERVAL '1 minute');

      -- Product type distribution: Cổ phiếu(70%) Margin(15%) CCQ(10%) Trái phiếu(3%) Phái sinh(2%)
      product_roll := random();
      IF product_roll < 0.70 THEN
        t_product := 'Cổ phiếu';
        t_ticker := tickers_stock[1 + floor(random() * array_length(tickers_stock, 1))::INT];
      ELSIF product_roll < 0.85 THEN
        t_product := 'Margin';
        t_ticker := tickers_stock[1 + floor(random() * 15)::INT]; -- top 15 tickers for margin
      ELSIF product_roll < 0.95 THEN
        t_product := 'Chứng chỉ quỹ';
        t_ticker := tickers_fund[1 + floor(random() * array_length(tickers_fund, 1))::INT];
      ELSIF product_roll < 0.98 THEN
        t_product := 'Trái phiếu';
        t_ticker := tickers_bond[1 + floor(random() * array_length(tickers_bond, 1))::INT];
      ELSE
        t_product := 'Phái sinh';
        t_ticker := tickers_deriv[1 + floor(random() * array_length(tickers_deriv, 1))::INT];
      END IF;

      -- Order type: 55% Mua, 45% Bán
      IF random() < 0.55 THEN t_order := 'Mua'; ELSE t_order := 'Bán'; END IF;

      -- Volume & Price tùy product type
      IF t_product = 'Phái sinh' THEN
        t_volume := (1 + floor(random() * 10)::INT);
        t_price := 1000 + floor(random() * 300);  -- điểm số phái sinh
      ELSIF t_product = 'Trái phiếu' THEN
        t_volume := (10 + floor(random() * 90)::INT);
        t_price := 90000 + floor(random() * 20000);
      ELSIF t_product = 'Chứng chỉ quỹ' THEN
        t_volume := (100 + floor(random() * 900)::INT) * 10;
        t_price := 10000 + floor(random() * 30000);
      ELSIF t_product = 'Margin' THEN
        -- Margin KH thường giao dịch lớn hơn
        t_volume := (500 + floor(random() * 4500)::INT) * 10;
        t_price := 10000 + floor(random() * 90000);
      ELSE
        -- Cổ phiếu thường
        t_volume := (100 + floor(random() * 2000)::INT) * 10;
        t_price := 5000 + floor(random() * 150000);
      END IF;

      -- VIP tier ảnh hưởng giá trị giao dịch (nhóm A/B = VIP cao = giao dịch lớn)
      IF cust.vip_tier IN ('VIP Diamond','VIP Platinum') THEN
        t_volume := t_volume * (2 + random());  -- x2-3
      END IF;

      -- Status distribution: Khớp toàn phần(75%) Khớp một phần(15%) Hủy(7%) Chờ khớp(3%)
      status_roll := random();
      IF status_roll < 0.75 THEN
        t_status := 'Khớp toàn phần';
        t_matched := t_volume;
      ELSIF status_roll < 0.90 THEN
        t_status := 'Khớp một phần';
        t_matched := floor(t_volume * (0.3 + random() * 0.6));
      ELSIF status_roll < 0.97 THEN
        t_status := 'Hủy';
        t_matched := 0;
      ELSE
        t_status := 'Chờ khớp';
        t_matched := 0;
      END IF;

      t_value := t_matched * t_price;

      -- Phí giao dịch: 0.15% - 0.35% tùy VIP
      IF cust.vip_tier = 'VIP Diamond' THEN
        t_fee := t_value * 0.0015;
      ELSIF cust.vip_tier = 'VIP Platinum' THEN
        t_fee := t_value * 0.002;
      ELSIF cust.vip_tier = 'VIP Gold' THEN
        t_fee := t_value * 0.0025;
      ELSE
        t_fee := t_value * 0.0035;
      END IF;

      -- Channel: App PHS(55%) Web(25%) Môi giới(15%) Điện thoại(5%)
      channel_roll := random();
      IF channel_roll < 0.55 THEN
        t_channel := 'App PHS';
      ELSIF channel_roll < 0.80 THEN
        t_channel := 'Web';
      ELSIF channel_roll < 0.95 THEN
        t_channel := 'Môi giới';
      ELSE
        t_channel := 'Điện thoại';
      END IF;

      INSERT INTO transaction_logs (
        account_id, trade_date, trade_time, product_type, ticker,
        order_type, order_volume, matched_volume, price,
        transaction_value, transaction_fee, status, channel
      ) VALUES (
        cust.account_id, t_date, t_time, t_product, t_ticker,
        t_order, floor(t_volume), floor(t_matched), t_price,
        floor(t_value), floor(t_fee), t_status, t_channel
      );

    END LOOP;
  END LOOP;
END $$;
