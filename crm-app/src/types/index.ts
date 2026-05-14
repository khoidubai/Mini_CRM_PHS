export type VipTier = 'Bình thường' | 'VIP Gold' | 'VIP Platinum' | 'VIP Diamond'

export type CustomerGroup = 'A – Rất tiềm năng' | 'B – Tiềm năng' | 'C – Nuôi dưỡng'
  | 'D – Không tiềm năng' | 'E – Không nghe máy'
  | 'F – SĐT không hợp lệ' | 'G – Không có SĐT' | 'H – Tài khoản ảo'

export type CallResult = 'Nghe máy – trao đổi' | 'Không nghe máy / không bắt máy'
  | 'Thuê bao / số không tồn tại' | 'Không có thông tin liên hệ' | 'Trực tiếp'

export type InterestLevel = 'Rất quan tâm – muốn giao dịch ngay' | 'Quan tâm – cần follow thêm'
  | 'Nghe nhưng chưa có nhu cầu' | 'Không quan tâm' | null

export type TicketCategory = 'Quản lý Tài khoản PHS' | 'Khác' | 'Thay đổi bậc VIP'
  | 'Hỗ trợ Giao dịch' | 'Failed E-Kyc' | 'CMSN' | 'Khảo sát E-kyc'
  | 'Nạp và Rút tiền' | 'Công văn' | 'Dịch vụ CSKH' | 'Ứng dụng PHS' | 'Môi giới'

export type TicketStatus = 'Đã đóng' | 'Đang xử lý' | 'Chờ phản hồi'
export type TicketSource = 'Email' | 'Hotline' | 'Zalo' | 'Chatbot_1' | 'Mobile_app'
export type CustomerType = 'KH có tài khoản' | 'KH không có tài khoản'

export type RootCauseTag = 'SYSTEM_BUG' | 'SOP_GAP' | 'INFO_GAP' | 'PROCESS_GAP' | 'USER_ERROR' | 'OTHER'

export interface Customer {
  id: string
  account_id: string
  full_name: string
  branch: string
  status: string
  vip_tier: VipTier
  created_at: string
}

export interface SARecord {
  id: string
  account_id: string
  pic: string
  pic_user_id: string | null
  call_date: string
  follow_count: number
  call_result: CallResult
  interest_level: InterestLevel
  customer_group: CustomerGroup
  product_introduced: boolean
  reactivation: boolean
  info_support: boolean
  referral_introduced: boolean
  total_transaction_value: number | null
  transaction_fee: number | null
  notes: string
  handover_rm: string
  next_action_date: string | null
  status_at_call: string | null
  indirect_type: string | null
  indirect_fee: number | null
  record_history: RecordSnapshot[]
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface RecordSnapshot {
  snapshot_at: string
  changed_by: string
  data: Partial<SARecord>
}

export type ProductType = 'Cổ phiếu' | 'Trái phiếu' | 'Chứng chỉ quỹ' | 'Phái sinh' | 'Margin'
export type OrderType = 'Mua' | 'Bán'
export type TradeStatus = 'Khớp toàn phần' | 'Khớp một phần' | 'Hủy' | 'Chờ khớp'
export type TradeChannel = 'App PHS' | 'Web' | 'Môi giới' | 'Điện thoại'

export interface TransactionLog {
  id: string
  account_id: string
  trade_date: string
  trade_time: string | null
  product_type: ProductType
  ticker: string | null
  order_type: OrderType
  order_volume: number
  matched_volume: number | null
  price: number
  transaction_value: number | null
  transaction_fee: number | null
  status: TradeStatus
  channel: TradeChannel
  created_at: string
}

export interface ICPFeatures {
  days_inactive: number
  trade_frequency_30d: number
  avg_transaction_value: number
  total_value_ytd: number
  product_diversity: number
  preferred_channel: string | null
}

export type KPIMetric =
  // === PART A SUP (60%) — Supervisor trở lên ===
  | 'a1_sop'              // A1 SUP — 5%
  | 'a1_nvqltk'           // A1 SUP — 5%
  | 'a1_nvkd'             // A1 SUP — 5%
  | 'a1_admin'            // A1 SUP — 4%
  | 'a1_other'            // A1 shared — 5%
  | 'a2_project'          // A2 shared — 9%(SUP)/6%(SA)
  | 'a2_improve'          // A2 SUP — 6%
  | 'a3_compliance'       // A3 shared — 4%(SUP)/3%(SA)
  | 'a3_teamwork'         // A3 SUP — 7%
  | 'a4_knowledge'        // A4 shared — 5%(SUP)/3%(SA)
  | 'a4_share'            // A4 shared — 5%(SUP)/3%(SA)
  // === PART A SA (60%) — Sales Admin only ===
  | 'a1_mo_tk'            // A1 SA — 7%
  | 'a1_lenh_gd'          // A1 SA — 5%
  | 'a1_luu_ky'           // A1 SA — 7%
  | 'a1_gd_tien'          // A1 SA — 5%
  | 'a1_ky_quy'           // A1 SA — 7%
  | 'a2_test'             // A2 SA — 4%
  | 'a3_event'            // A3 SA — 2%
  | 'a4_cert'             // A4 SA — 3%
  // === PART B (40%) — CRM-computed ===
  | 'call_count'           // B1 #17 — 8%
  | 'contact_success_rate' // B1 #18 — 4%
  | 'icp_grouping_rate'    // B2 #20 — 4%
  | 'icp_data_quality'     // B2 #21 — 4% (admin override)
  | 'reactivation_count'   // B3 #23 — 6%
  | 'ltv_fee'              // B3 #24 — 4%
  | 'referral_rate'        // B3 #25 — 2%
  | 'support_count'        // B4 #26 — 3%
  | 'new_product_count'    // B4 #27 — 2%
  | 'group_conversion_rate'// B4 #28 — 3%

export interface KPITarget {
  id: string
  user_id: string
  metric: KPIMetric
  target_value: number
  actual_override: number | null
  month: string
  created_at: string
  updated_at: string
}

export interface CRMTicket {
  id: string
  ticket_code: string
  account_id: string | null
  created_at: string
  category: TicketCategory
  classification: string
  customer_type: CustomerType
  source: TicketSource
  status: TicketStatus
  priority: string
  description: string
  resolution: string
  total_time: number | null
  handling_time: number | null
  is_unlinked: boolean
  csat_score: number | null
  root_cause_tag: RootCauseTag | null
  is_recurring: boolean
  linked_manually: boolean
  error_code: string | null
  error_custom: string | null
  customer?: Customer
}
