# PHS Mini CRM Platform

Nền tảng CRM nội bộ cho Chứng khoán Phú Hưng (PHS). Quản lý khách hàng, theo dõi SA records, xử lý CRM tickets, báo cáo lỗi, và phân tích KPI nhân viên.

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Build Tool | Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Excel Parser | SheetJS (xlsx) |

---

## Cấu trúc Repo

```
Mini_CRM/
├── crm-app/                  # React app — deploy target
│   ├── src/
│   │   ├── App.tsx           # Router + role-based routing
│   │   ├── components/
│   │   │   ├── Layout.tsx    # Sidebar navigation
│   │   │   └── ...
│   │   ├── data/
│   │   │   └── errorCodes.ts # Danh mục mã lỗi (36 mã, 8 nhóm)
│   │   ├── pages/
│   │   │   ├── SA/           # SAList, SAFormModal, KPIDashboard
│   │   │   ├── CRM/          # CRMList, TicketFormModal
│   │   │   ├── Admin/        # Dashboard, Customer360, KPIAdmin,
│   │   │   │                 # ErrorReport, UserManagement
│   │   │   └── Profile/      # ProfilePage
│   │   ├── types/index.ts    # TypeScript interfaces
│   │   └── lib/supabase.ts   # Supabase client
│   ├── .env.example          # Template biến môi trường
│   └── .env                  # Biến thực — KHÔNG commit
└── database/
    ├── schema/
    │   └── supabase-schema.sql
    └── seeds/
        ├── supabase-seed.sql
        ├── supabase-seed-transactions.sql
        ├── seed_errors.sql       # ~80 tickets lỗi mẫu
        └── seed_employees.sql    # 13 SA + SA records mẫu
```

---

## Phân quyền

| Role | Routes |
|------|--------|
| **SA** | `/sa`, `/kpi`, `/profile` |
| **CCC** | `/crm`, `/profile` |
| **Admin** | Tất cả + `/dashboard`, `/customer360`, `/kpi-admin`, `/error-report`, `/users` |

---

## Tính năng

### Sale System (`/sa`) — SA
- Danh sách SA records, badge nhóm A–H, highlight A/B
- Tạo/sửa record: nhập TK, gọi, kết quả, nhóm KH, bàn giao RM
- Filter: nhóm, PIC, chi nhánh, ngày, kết quả cuộc gọi

### KPI Cá nhân (`/kpi`) — SA
- Xem KPI bản thân theo tháng vs chỉ tiêu

### CRM Tickets (`/crm`) — CCC
- Danh sách tickets, tab Linked/Unlinked, filter đa chiều
- Tạo ticket: toggle link/không link KH + search box tìm nhanh TK
- **Mã lỗi (optional):** dropdown 36 mã lỗi theo 8 nhóm, chọn ĐB000 → nhập thủ công
- Efficiency ratio = handling_time / total_time

### Customer 360 (`/customer360`) — Admin
- Search theo account_id → summary card + timeline SA + CRM

### Dashboard (`/dashboard`) — Admin
- Stat cards clickable → danh sách chi tiết
- Portfolio Health: ICP, LTV, AAR, Churn, Referral — click → modal công thức + cấu hình

### KPI Admin (`/kpi-admin`) — Admin
- Bảng xếp hạng SA toàn công ty, filter theo chi nhánh + tháng
- Set chỉ tiêu 8 metrics cho từng nhân viên

### Báo cáo Lỗi (`/error-report`) — Admin
- Top K mã lỗi phổ biến, filter từ tháng → đến tháng
- Column chart màu theo nhóm lỗi + bảng chi tiết sortable

### Quản lý NV (`/users`) — Admin
- CRUD user_profiles, filter role + chi nhánh

---

## Database

### Tables chính
| Table | Mô tả |
|-------|-------|
| `customers` | KH: account_id, full_name, branch, vip_tier |
| `sa_records` | Bản ghi gọi SA, linked qua pic_user_id |
| `crm_tickets` | Ticket CCC, có error_code + error_custom |
| `transaction_logs` | Lịch sử giao dịch |
| `user_profiles` | Role + thông tin NV (SA/CCC/Admin) |
| `kpi_targets` | Chỉ tiêu KPI theo user + tháng |

### Migration cần chạy thêm
```sql
ALTER TABLE crm_tickets
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS error_custom text;
```

---

## Setup

### 1. Clone & install
```bash
git clone <repo-url>
cd Mini_CRM/crm-app
npm install
```

### 2. Cấu hình `.env`
```bash
cp .env.example .env
# Điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
```

### 3. Supabase — chạy SQL theo thứ tự
1. `database/schema/supabase-schema.sql` — tạo tables + RLS
2. `database/seeds/supabase-seed.sql` — KH + tickets cơ bản
3. `database/seeds/supabase-seed-transactions.sql` — lịch sử GD
4. `database/seeds/seed_employees.sql` — SA employees + SA records
5. `database/seeds/seed_errors.sql` — CRM tickets có mã lỗi

### 4. Tạo Users trong Supabase Auth
Vào **Authentication → Users → Add user**, tạo với User Metadata:
```json
{"role": "admin"}   // hoặc "sa" / "ccc"
```

### 5. Chạy dev
```bash
npm run dev
# → http://localhost:5173
```

---

## Deploy (Netlify)

- **Base directory:** `crm-app`
- **Build command:** `npm run build`
- **Publish directory:** `crm-app/dist`
- **Environment variables:** thêm `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` trong Netlify dashboard

---

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Trang trắng | Kiểm tra `.env` đúng URL + Key, restart dev server |
| Đăng nhập lỗi | User metadata phải có `{"role": "..."}` đúng format |
| Không thấy data | Kiểm tra đã chạy schema SQL chưa |
| FK error khi seed | `user_profiles.id` cần tồn tại trong `auth.users` trước |
| error_code không lưu | Chạy migration ALTER TABLE thêm 2 cột |
