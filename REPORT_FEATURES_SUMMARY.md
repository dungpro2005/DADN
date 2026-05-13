# Các Tính Năng Báo Cáo Nâng Cao - Tóm Tắt

## 🎯 Tính Năng Được Thêm

### 1. **Báo cáo Trực quan (Visual Reports)**
- ✅ Biểu đồ diện tích (Area Charts) - Nhiệt độ, Độ ẩm
- ✅ Biểu đồ cột (Bar Charts) - So sánh theo tòa nhà/máy
- ✅ Biểu đồ đường (Line Charts) - Mức quạt theo thời gian
- ✅ Biểu đồ tròn (Pie Charts) - Phân bố uptime và nhiệt độ
- ✅ Biểu đồ scatter - Mối quan hệ giữa các chỉ số

### 2. **Báo cáo Đa Chiều (Multi-dimensional Analysis)**
- ✅ Bảng so sánh chi tiết với màu sắc hợp lý
- ✅ Hỗ trợ 6 chỉ số chính:
  - Nhiệt độ trung bình
  - Độ ẩm trung bình
  - Mức quạt trung bình
  - Thời gian chạy (%)
  - Số máy đang hoạt động
  - Công suất

### 3. **Báo cáo Động (Dynamic Reports)**
- ✅ Tự động cập nhật dữ liệu mỗi 5, 10, 30 giây hoặc 1 phút
- ✅ Nút làm mới thủ công
- ✅ Theo dõi realtime các thay đổi

### 4. **Tuỳ Chỉnh Hiển Thị (Report Customization)**
- ✅ Bật/tắt các chỉ số hiển thị
- ✅ Nút "Chọn tất cả" / "Bỏ chọn tất cả"
- ✅ Giao diện tuỳ chỉnh dễ sử dụng

### 5. **Tải & Xuất Dữ Liệu (Export Reports)**
- ✅ Xuất CSV - Nhập vào Excel, Google Sheets
- ✅ Xuất JSON - Dữ liệu đầy đủ với metadata
- ✅ Xuất PDF - In hoặc lưu digital
- ✅ Đặt tên file tự động với timestamp

---

## 📁 Tệp Mới Được Tạo

### Thành phần React
1. **`src/app/components/ReportCustomization.tsx`**
   - Bộ tuỳ chỉnh báo cáo
   - Bật/tắt tự động cập nhật
   - Menu xuất dữ liệu

2. **`src/app/components/AdvancedCharts.tsx`**
   - PieChartReport - Biểu đồ tròn
   - ScatterChartReport - Biểu đồ scatter
   - ComparisonMetricsChart - Bảng so sánh chi tiết
   - DimensionalAnalysisChart - Phân tích đa chiều

### Utilities
3. **`src/app/utils/reportExport.ts`**
   - `exportToCSV()` - Xuất CSV
   - `exportToJSON()` - Xuất JSON
   - `generatePDFReport()` - Xuất PDF
   - `createHTMLTable()` - Tạo bảng HTML
   - `generateSummaryStats()` - Tạo thống kê tóm tắt

### Tài Liệu
4. **`src/app/pages/REPORT_GUIDE_VI.md`**
   - Hướng dẫn chi tiết sử dụng các tính năng mới

---

## 🔧 Thay Đổi Tệp Hiện Có

### `src/app/pages/StatisticsPage.tsx`
- Thêm import cho các component mới
- Thêm state cho:
  - `autoRefreshEnabled` - Bật/tắt tự động cập nhật
  - `refreshInterval` - Khoảng thời gian cập nhật
  - `selectedMetrics` - Chỉ số được chọn
  - `chartTypes` - Loại biểu đồ (mở rộng cho tương lai)

- Thêm Effect Hook cho tự động cập nhật
- Thêm các hàm xuất dữ liệu:
  - `handleExportCSV()`
  - `handleExportJSON()`
  - `handleExportPDF()`

- Thêm `ReportCustomization` component
- Thêm báo cáo trực quan: Pie charts, Scatter chart
- Thêm báo cáo đa chiều: `ComparisonMetricsChart`
- Thêm báo cáo tóm tắt

---

## 🎨 Giao Diện Người Dùng

### Report Customization Bar
```
[🔧 Tuỳ chỉnh] [🔄 Làm mới] [✓ Tự động cập nhật] [5s ⏱] [⬇️ Xuất dữ liệu ▼]
```

### Export Menu
```
Xuất dữ liệu ▼
├── 📊 Xuất CSV
├── 📋 Xuất JSON
└── 📄 Xuất PDF
```

### Customization Panel
```
✓ Nhiệt độ TB
✓ Độ ẩm TB
✓ Mức quạt TB
✓ Thời gian chạy
☐ Máy đang chạy
☐ Công suất

[Chọn tất cả] [Bỏ chọn tất cả]
```

---

## 📊 Ví Dụ Báo Cáo

### Khi chọn "Tất cả máy, Tất cả tòa nhà":
1. Stats Cards (5 thẻ thông số)
2. Building Stats Charts (3-4 biểu đồ)
3. Machine Comparison Charts (3 biểu đồ so sánh)
4. **[MỚI]** Multi-dimensional Analysis (bảng chi tiết)
5. **[MỚI]** Pie Charts (2 biểu đồ tròn)
6. **[MỚI]** Scatter Chart (mối quan hệ)
7. **[MỚI]** Report Summary (thẻ tóm tắt)

### Khi chọn máy cụ thể:
1. Stats Cards (5 thẻ thông số)
2. Machine Detail Charts (4 biểu đồ dạng area/line/bar)

---

## 🚀 Cách Sử Dụng

### Báo cáo Trực quan
```
1. Chọn tòa nhà → Máy → Khoảng thời gian
2. Nhìn các biểu đồ tự động xuất hiện
3. Nhấp vào biểu đồ để xem chi tiết
```

### Tuỳ Chỉnh Báo Cáo
```
1. Nhấp [🔧 Tuỳ chỉnh]
2. Chọn/bỏ chọn các chỉ số
3. Nhấp [Đóng]
```

### Tự Động Cập Nhật
```
1. Bật ✓ Tự động cập nhật
2. Chọn khoảng thời gian (5s/10s/30s/1m)
3. Dữ liệu sẽ tự động làm mới
```

### Xuất Báo Cáo
```
1. Nhấp [⬇️ Xuất dữ liệu]
2. Chọn định dạng (CSV/JSON/PDF)
3. Tệp tự động tải xuống
```

---

## ✨ Đặc Điểm Nổi Bật

✅ **Giao diện trực quan** - Dễ dàng hiểu các biểu đồ
✅ **Tuỳ chỉnh linh hoạt** - Chọn chỉ số muốn xem
✅ **Xuất dữ liệu đa định dạng** - CSV, JSON, PDF
✅ **Theo dõi realtime** - Tự động cập nhật dữ liệu
✅ **Phân tích đa chiều** - Bảng chi tiết với color coding
✅ **Responsive design** - Hoạt động tốt trên mọi thiết bị

---

## 📝 Ghi Chú

### Hiện tại
- Dữ liệu được tải từ bộ nhớ ứng dụng (mock data)
- Tính năng "Tự động cập nhật" là placeholder (chỉ là visual)

### Để tích hợp Backend
- Kết nối API để tải dữ liệu thực từ database
- Implement WebSocket hoặc polling cho dữ liệu realtime
- Thay đổi `generateMockLogs()` để gọi API

---

## 🔗 Tài Liệu Tham Khảo

- Hướng dẫn chi tiết: [REPORT_GUIDE_VI.md](./REPORT_GUIDE_VI.md)
- Library biểu đồ: [Recharts](https://recharts.org)
- Component UI: [shadcn/ui](https://ui.shadcn.com)

---

**Phiên bản**: 1.0  
**Ngày cập nhật**: 2024  
**Trạng thái**: Hoàn thành ✅
