# Hướng dẫn Tính Năng Báo Cáo Nâng cao

## Tổng quan

Trang **Thống kê và báo cáo** hiện đã được nâng cấp với các tính năng báo cáo trực quan, đa chiều, và động. Dưới đây là hướng dẫn chi tiết để sử dụng các tính năng này.

## 1. Báo cáo Trực quan (Visual Reports)

### Các loại biểu đồ
- **Biểu đồ diện tích (Area Chart)**: Hiển thị xu hướng nhiệt độ và độ ẩm theo thời gian
- **Biểu đồ cột (Bar Chart)**: So sánh các chỉ số giữa các tòa nhà/máy
- **Biểu đồ tròn (Pie Chart)**: Phân bố tỉ lệ thời gian hoạt động và nhiệt độ
- **Biểu đồ scatter**: Hiển thị mối quan hệ giữa các chỉ số (ví dụ: Nhiệt độ vs Độ ẩm)

### Cách sử dụng
1. Chọn tòa nhà hoặc máy sấy
2. Chọn khoảng thời gian
3. Hệ thống sẽ tự động hiển thị các biểu đồ phù hợp

## 2. Báo cáo Đa Chiều (Multi-dimensional Reports)

### Tính năng
- Hiển thị bảng so sánh chi tiết các chỉ số quan trọng
- Thay đổi màu sắc hợp lý để chỉ ra trạng thái (xanh = tốt, vàng = cảnh báo, đỏ = cảnh báo)
- Hỗ trợ múi loại chỉ số:
  - Nhiệt độ trung bình (°C)
  - Độ ẩm trung bình (%)
  - Mức quạt trung bình
  - Thời gian chạy (%)
  - Số máy đang hoạt động
  - Công suất

### Cách sử dụng
1. Nhấp vào **"Tuỳ chỉnh"** ở phần Report Customization
2. Chọn các chỉ số bạn muốn hiển thị
3. Bảng so sánh đa chiều sẽ cập nhật tự động

## 3. Báo cáo Động (Dynamic Reports)

### Tính năng
- **Làm mới thủ công**: Nhấp vào nút **"Làm mới"** để cập nhật dữ liệu
- **Tự động cập nhật**: Bật tính năng **"Tự động cập nhật"** để:
  - Cập nhật dữ liệu mỗi 5, 10, 30 giây hoặc 1 phút
  - Theo dõi trực tiếp thay đổi của dữ liệu

### Cách sử dụng
1. Tìm phần "Tự động cập nhật" trong Report Customization
2. Bật/tắt checkbox để kích hoạt
3. Chọn khoảng thời gian cập nhật (5s, 10s, 30s, 1m)

## 4. Tuỳ Chỉnh Hiển Thị Báo Cáo (Report Customization)

### Tính năng
Chọn những chỉ số nào sẽ hiển thị trong báo cáo:
- Nhiệt độ trung bình
- Độ ẩm trung bình
- Mức quạt trung bình
- Thời gian chạy
- Số máy đang hoạt động
- Công suất

### Cách sử dụng
1. Nhấp vào **"Tuỳ chỉnh"**
2. Chọn/bỏ chọn các chỉ số cần thiết
3. Sử dụng **"Chọn tất cả"** hoặc **"Bỏ chọn tất cả"** để thao tác nhanh
4. Nhấp **"Đóng"** để lưu lựa chọn

## 5. Xuất Dữ Liệu Báo Cáo (Export Reports)

### Các định dạng hỗ trợ

#### **Xuất CSV**
- Định dạng: CSV (Comma-Separated Values)
- Sử dụng: Nhập vào Excel, Google Sheets hoặc các công cụ phân tích khác
- File tự động đặt tên: `báo-cáo-thống-kê-[timestamp].csv`

#### **Xuất JSON**
- Định dạng: JSON với đầy đủ metadata
- Bao gồm:
  - Dữ liệu báo cáo
  - Các bộ lọc được sử dụng
  - Tóm tắt thống kê chung
- File tự động đặt tên: `báo-cáo-thống-kê-[timestamp].json`

#### **Xuất PDF**
- Định dạng: PDF (in ra giấy hoặc lưu digital)
- Bao gồm:
  - Tiêu đề báo cáo
  - Tóm tắt thống kê chính
  - Bảng dữ liệu chi tiết
  - Ngày giờ tạo báo cáo
- File tự động đặt tên: `báo-cáo-thống-kê.pdf`

### Cách sử dụng
1. Nhấp vào **"Xuất dữ liệu"**
2. Chọn định dạng:
   - 📊 Xuất CSV
   - 📋 Xuất JSON
   - 📄 Xuất PDF
3. Tệp sẽ tự động tải xuống

## 6. Lọc Dữ Liệu

### Tòa nhà
- Chọn **"Tất cả tòa nhà"** để xem báo cáo tổng quát
- Chọn từng tòa nhà để xem chi tiết

### Máy sấy
- Chỉ xuất hiện khi đã chọn tòa nhà
- Chọn **"Tất cả máy"** để xem so sánh giữa các máy
- Chọn máy cụ thể để xem chi tiết hoạt động hàng ngày

### Khoảng thời gian
- Sử dụng **Date Range Picker** để chọn:
  - Ngày bắt đầu
  - Ngày kết thúc
- Mặc định: 7 ngày gần nhất

## 7. Ví dụ Sử Dụng Thực Tế

### Ví dụ 1: Báo cáo hàng tuần tòa nhà A
1. Chọn tòa nhà = "Tòa nhà A"
2. Chọn máy = "Tất cả máy"
3. Chọn khoảng thời gian: 7 ngày
4. Nhấp **"Xuất dữ liệu"** → Xuất CSV
5. Mở file Excel và phân tích

### Ví dụ 2: Theo dõi thời gian thực máy MCH-001
1. Chọn tòa nhà = "Tòa nhà chứa MCH-001"
2. Chọn máy = "MCH-001"
3. Bật **"Tự động cập nhật"** mỗi 5 giây
4. Theo dõi biểu đồ realtime

### Ví dụ 3: So sánh hiệu suất máy trong tháng
1. Chọn tòa nhà = "Tất cả"
2. Chọn máy = "Tất cả máy"
3. Chọn khoảng thời gian: tháng trước
4. Xem biểu đồ Pie để phân bố uptime
5. Xem biểu đồ Scatter để phân tích mối quan hệ nhiệt độ-độ ẩm
6. Xuất PDF để trình bày

## 8. Thông Tin Kỹ Thuật

### Tệp liên quan
- `src/app/pages/StatisticsPage.tsx` - Trang chính
- `src/app/components/ReportCustomization.tsx` - Bộ tuỳ chỉnh báo cáo
- `src/app/components/AdvancedCharts.tsx` - Biểu đồ nâng cao
- `src/app/utils/reportExport.ts` - Hàm xuất dữ liệu

### Dữ liệu được tính toán
- Các chỉ số được tính trung bình trong khoảng thời gian
- Uptime = (số giờ chạy / tổng giờ) × 100%
- Công suất = số máy chạy × 1.4 (hệ số công suất)

### Giới hạn hiện tại
- Dữ liệu được tải từ bộ nhớ ứng dụng (mock data nếu không có dữ liệu thực)
- Tính năng "Tự động cập nhật" là placeholder (cần kết nối API backend)

## 9. Mẹo & Thủ Thuật

✅ **Mẹo 1**: Sử dụng biểu đồ Pie để nhanh chóng xác định máy có hiệu suất thấp
✅ **Mẹo 2**: Sử dụng biểu đồ Scatter để tìm mối quan hệ bất thường giữa các chỉ số
✅ **Mẹo 3**: Bật "Tự động cập nhật" để theo dõi sự cố đang diễn ra
✅ **Mẹo 4**: Xuất JSON để lưu trữ đầy đủ thông tin cho phân tích sau này

## 10. Khắc Phục Sự Cố

### Vấn đề: Không hiển thị dữ liệu
**Giải pháp**: 
- Kiểm tra khoảng thời gian đã chọn
- Chắc chắn rằng tòa nhà/máy được chọn có dữ liệu

### Vấn đề: Xuất PDF không hoạt động
**Giải pháp**: 
- Đảm bảo trình duyệt không chặn pop-up
- Thử xuất CSV hoặc JSON thay thế

### Vấn đề: "Tự động cập nhật" không cập nhật
**Giải pháp**: 
- Đây là placeholder, cần kết nối API backend
- Hiện tại chỉ có thể dùng **"Làm mới"** thủ công
