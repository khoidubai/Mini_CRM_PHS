export interface ErrorCode {
  code: string
  group: string
  name: string
}

export const ERROR_CODES: ErrorCode[] = [
  // LĐ — Lệnh Đặt / Giao Dịch
  { code: 'LĐ001', group: 'Lệnh Đặt', name: 'Không đặt lệnh mua / bán được' },
  { code: 'LĐ002', group: 'Lệnh Đặt', name: 'Bước giá không hợp lệ' },
  { code: 'LĐ003', group: 'Lệnh Đặt', name: 'Lệnh bị tự hủy bất thường' },
  { code: 'LĐ004', group: 'Lệnh Đặt', name: 'Không hủy được lệnh điều kiện' },
  { code: 'LĐ005', group: 'Lệnh Đặt', name: 'Vượt sức mua (SM)' },
  { code: 'LĐ006', group: 'Lệnh Đặt', name: 'Lệnh khớp hiển thị sai / lag' },

  // ĐN — Đăng Nhập / Xác Thực
  { code: 'ĐN001', group: 'Đăng Nhập', name: 'Không đăng nhập được' },
  { code: 'ĐN002', group: 'Đăng Nhập', name: 'Không nhận được SMS OTP' },
  { code: 'ĐN003', group: 'Đăng Nhập', name: 'Session tự đăng xuất / timeout' },
  { code: 'ĐN004', group: 'Đăng Nhập', name: 'Reset mật khẩu lỗi' },

  // HT — Hiển Thị / Dữ Liệu
  { code: 'HT001', group: 'Hiển Thị', name: 'Giá thị trường không cập nhật / sai' },
  { code: 'HT002', group: 'Hiển Thị', name: 'Số dư / tài sản không cập nhật' },
  { code: 'HT003', group: 'Hiển Thị', name: 'Thông báo lệnh khớp không hiển thị' },
  { code: 'HT004', group: 'Hiển Thị', name: 'Bảng giá lệch giữa các kênh' },

  // KY — eKYC / Tài Khoản
  { code: 'KY001', group: 'eKYC / Tài Khoản', name: 'eKYC không hoàn thành được' },
  { code: 'KY002', group: 'eKYC / Tài Khoản', name: 'Load hình ảnh CCCD / chứng từ lỗi' },
  { code: 'KY003', group: 'eKYC / Tài Khoản', name: 'Cập nhật thông tin cá nhân lỗi' },
  { code: 'KY004', group: 'eKYC / Tài Khoản', name: 'Thay đổi chữ ký lỗi' },

  // PT — Portal / Hệ Thống Nội Bộ
  { code: 'PT001', group: 'Portal / Hệ Thống', name: 'BrokerPortal không truy cập được' },
  { code: 'PT002', group: 'Portal / Hệ Thống', name: 'Portal không hiển thị thông tin KH' },
  { code: 'PT003', group: 'Portal / Hệ Thống', name: 'Home không đặt lệnh / xuất báo cáo được' },
  { code: 'PT004', group: 'Portal / Hệ Thống', name: 'Zalo / ZNS / Email không đồng bộ' },

  // CK — Chuyển Khoản / Thanh Toán / Quyền Mua
  { code: 'CK001', group: 'Chuyển Khoản / Thanh Toán', name: 'Chuyển CK nội bộ lỗi' },
  { code: 'CK002', group: 'Chuyển Khoản / Thanh Toán', name: 'Thanh toán chứng khoán lỗi' },
  { code: 'CK003', group: 'Chuyển Khoản / Thanh Toán', name: 'Nộp tiền không cập nhật sức mua' },
  { code: 'CK004', group: 'Chuyển Khoản / Thanh Toán', name: 'Quyền mua không hiển thị trên app' },

  // KN — Khiếu Nại / Phàn Nàn Dịch Vụ
  { code: 'KN001', group: 'Khiếu Nại', name: 'Phí GD / phí dịch vụ tính sai' },
  { code: 'KN002', group: 'Khiếu Nại', name: 'Môi giới tự ý đặt lệnh cho KH' },
  { code: 'KN003', group: 'Khiếu Nại', name: 'Phàn nàn thái độ nhân viên / MG' },
  { code: 'KN004', group: 'Khiếu Nại', name: 'Thời gian xử lý / phản hồi quá lâu' },
  { code: 'KN005', group: 'Khiếu Nại', name: 'Yêu cầu đóng TK (bị ép / lừa mở TK)' },
  { code: 'KN006', group: 'Khiếu Nại', name: 'Mạo danh / gian lận tài khoản' },
  { code: 'KN007', group: 'Khiếu Nại', name: 'Spam Hotline / email liên tục' },

  // ĐB — Đặc Biệt (nhập thủ công)
  { code: 'ĐB000', group: 'Đặc Biệt', name: 'Lỗi khác (nhập thủ công)' },
]

export const ERROR_GROUPS = Array.from(new Set(ERROR_CODES.map(e => e.group)))

export function getErrorByCode(code: string): ErrorCode | undefined {
  return ERROR_CODES.find(e => e.code === code)
}
