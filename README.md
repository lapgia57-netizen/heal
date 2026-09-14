# 🩺 UnityVina Care - Heal

**Y tá số chăm sóc sức khỏe cộng đồng Việt Nam**

Nơi mọi người tìm thấy thông tin, đặt lịch khám, và cập nhật kiến thức y học tương lai.

> Repo đã được **cấu trúc lại** để dễ điều hướng và bảo trì.

## 🚀 Truy cập nhanh

| Trang | Mô tả |
|-------|--------|
| **[Dashboard](dashboard.html)** | **Trang trung tâm** – liên kết **tất cả** trang & thư mục trong repo |
| [Trang chủ](index.html) | Giới thiệu UnityVina Care + form đặt lịch |
| [Quản trị](admin.html) | Xem danh sách lịch hẹn (Firebase) |
| [Nano Y học 2026](pages/health/nanomedicine-2026.html) | Kiến thức công nghệ nano trong y tế |

## 📁 Cấu trúc thư mục mới

```
heal/
├── index.html              # Trang chủ chính
├── admin.html              # Quản trị lịch hẹn
├── dashboard.html          # ⭐ Dashboard trung tâm (mới)
├── 404.html
├── CNAME
├── LICENSE
├── README.md
│
├── pages/
│   ├── health/             # Nội dung sức khỏe & y tế
│   │   ├── nanomedicine-2026.html
│   │   ├── kienthucyte.html
│   │   ├── BHYT.html
│   │   ├── ycbv.html
│   │   └── Security.html
│   ├── fun/                # Trang giải trí / thư giãn
│   │   ├── haha.html
│   │   ├── TokyoGhoul.html
│   │   ├── Hallyu.html
│   │   ├── hanquoc.html
│   │   ├── leesin.html
│   │   └── pithaman.html
│   └── misc/               # Các trang khác
│       ├── ba.html
│       ├── build.html
│       ├── huu.html
│       ├── money.html
│       ├── ntxcvn.html
│       ├── tebichantay.html
│       ├── thamdu.html
│       └── tt.html
│
└── sections/               # Các section chuyên đề (giữ nguyên nội dung gốc)
    ├── Anninh/
    ├── Burnout/
    ├── Baove/              # (trước đây là Bảovệ – đã sửa tên Unicode)
    ├── One/
    ├── Up/
    ├── bvTop1/
    ├── namemena/
    └── tamlinh/            # (trước đây là tamlinh3linh8linh)
```

## ✨ Tính năng chính

- 🏠 **Trang chủ** – Giới thiệu + form đặt lịch khám tại nhà (Firebase)
- 📅 **Admin** – Quản lý lịch hẹn realtime
- 🔬 **Nano Y học 2026** – Kiến thức tiên tiến
- 😄 **Trang vui** – Thư giãn
- 🧭 **Dashboard** – Liên kết toàn bộ repo

## 🛠️ Công nghệ

```
HTML5 + CSS thuần
Firebase Realtime Database
Font Awesome
```

## 📌 Ghi chú thay đổi khi cấu trúc lại

1. Tạo `dashboard.html` làm trang trung tâm.
2. Gom các trang rời vào `pages/health`, `pages/fun`, `pages/misc`.
3. Đưa các thư mục chuyên đề vào `sections/`.
4. Sửa tên thư mục bị lỗi encoding (`Bảovệ` → `Baove`, file `lạm.html` → `lam.html`).
5. Cập nhật README rõ ràng.

## 🔮 Hướng phát triển tiếp

- [ ] Responsive hoàn chỉnh hơn
- [ ] Chatbot tư vấn sức khỏe cơ bản
- [ ] Bài viết sức khỏe hàng tuần
- [ ] Gom CSS/JS dùng chung vào `assets/`
- [ ] Đặt lịch khám online thực tế

## Giấy phép

LGPL-2.1 (xem file LICENSE)
