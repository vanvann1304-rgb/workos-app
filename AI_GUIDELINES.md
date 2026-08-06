# AI_GUIDELINES.md
# Quy tắc bắt buộc cho AI khi làm việc trong dự án này

> ⚠️ **AI PHẢI ĐỌC VÀ TUÂN THỦ FILE NÀY TRƯỚC KHI LÀM BẤT KỲ VIỆC GÌ**

---

## 1. KHÔNG TỰ Ý THAY ĐỔI CODE CŨ

- AI **tuyệt đối không được** tự ý sửa, xóa, refactor, hoặc thay đổi bất kỳ code nào đã tồn tại mà người dùng KHÔNG yêu cầu.
- Nếu AI nhận thấy cần thay đổi code cũ để hoàn thành task mới → **PHẢI HỎI người dùng trước**, trình bày rõ:
  - File nào sẽ bị ảnh hưởng
  - Thay đổi gì
  - Lý do tại sao cần thay đổi
- Chỉ được tiến hành sau khi người dùng **đồng ý rõ ràng**.

---

## 2. CHỈ SỬA ĐÚNG CHỨC NĂNG ĐƯỢC YÊU CẦU

- Người dùng yêu cầu sửa gì → chỉ sửa đúng cái đó.
- AI **không được suy đoán** rằng "cái này liên quan nên tôi sửa luôn".
- AI **không được tự thêm** tính năng, style, logic mới ngoài phạm vi yêu cầu.
- Nếu trong quá trình thực hiện phát hiện vấn đề khác → **báo cáo** cho người dùng, không tự xử lý.

---

## 3. KHI CÓ NHIỀU LỰA CHỌN → HỎI TRƯỚC, QUYẾT ĐỊNH SAU

- Khi có từ 2 cách tiếp cận trở lên → AI phải:
  1. Trình bày rõ các lựa chọn và ưu/nhược điểm
  2. Đặt câu hỏi để người dùng quyết định
  3. Chờ phản hồi rồi mới thực hiện
- AI **không được tự quyết định** giải pháp kỹ thuật khi chưa có sự đồng ý.

---

## 4. ĐỌC FILE HANDOFF TRƯỚC KHI BẮT ĐẦU MỖI TASK MỚI

- Mỗi khi nhận được yêu cầu công việc mới → AI **BẮT BUỘC** phải:
  1. Đọc file `PROJECT_HANDOFF.md` để nắm context
  2. Kiểm tra danh sách task đang làm / đã hoàn thành
  3. Sync lại task mới vào handoff
  4. Kiểm tra các file liên quan đã tồn tại chưa trước khi viết code mới
- Mục đích: **tránh viết lại code đã có, tránh conflict, tránh break tính năng cũ**.

---

## 5. CHỈ THAY ĐỔI ĐÚNG CHI TIẾT ĐƯỢC NÓI

- Người dùng mô tả thay đổi cụ thể như thế nào → AI làm đúng y vậy.
- Không "cải thiện thêm", không "tối ưu luôn cho tiện", không tự thêm comment, import thừa, hay thay đổi format ngoài ý muốn.
- Mọi thay đổi phải **tối thiểu và chính xác**.

---

## Checklist bắt buộc trước khi commit bất kỳ thay đổi nào

```
[ ] Đã đọc PROJECT_HANDOFF.md
[ ] Đã xác định đúng task được yêu cầu
[ ] Chỉ chạm vào file liên quan đến task này
[ ] Không sửa code cũ ngoài yêu cầu
[ ] Nếu cần sửa code cũ → đã hỏi và được đồng ý
[ ] Nếu có nhiều lựa chọn → đã hỏi và được chọn
[ ] Đã cập nhật PROJECT_HANDOFF.md sau khi hoàn thành
```

---

*File này được tạo ngày 2026-08-06. Mọi AI agent làm việc trong project này phải tuân thủ.*
