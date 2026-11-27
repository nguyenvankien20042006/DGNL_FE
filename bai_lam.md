# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên:** Nguyễn Văn Kiên
- **Lớp:** CNTT2
- **Link repository:** https://github.com/nguyenvankien20042006/DGNL_FE
- **Hệ điều hành (Windows/macOS):** Windows
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):** 052f46f
- **Phiên bản Node.js (gõ `node -v`):** v24.22.1

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Khởi động API mock ở chế độ mạng chậm mô phỏng độ trễ: gõ lệnh `npm run api:cham` (trong chế độ này, các request tìm kiếm có từ khoá bắt đầu bằng "ban" sẽ bị trễ 2,5 giây, trong khi các request khác chỉ mất 0,1 giây).
2. Mở giao diện ứng dụng trên trình duyệt.
3. Tại ô tìm kiếm sản phẩm, gõ từ khoá "ban" (hoặc "bàn"). Request 1 được gửi đi tới server và đang bị trễ 2,5 giây.
4. Ngay lập tức khi request 1 chưa kịp phản hồi, người dùng xoá nhanh từ khoá và chuyển sang chọn danh mục "Chuột" (hoặc gõ từ khoá "chuot"). Request 2 được gửi đi tới server với độ trễ chỉ 0,1 giây.
```

Kết quả hiển thị:

```text
- Ngay sau 0,1 giây, request 2 phản hồi xong, bảng sản phẩm cập nhật hiển thị danh sách sản phẩm thuộc danh mục "Chuột".
- Tuy nhiên, sau khoảng 2,4 giây tiếp theo, request 1 (tìm kiếm "ban") mới phản hồi xong. Hàm load() của request 1 trong hook AI sinh tiếp tục chạy setData(res.data.data), ghi đè toàn bộ dữ liệu của "ban" lên bảng sản phẩm.
- Lúc này trên thanh lọc đang hiển thị danh mục "Chuột", nhưng bảng sản phẩm lại hiển thị các sản phẩm "Bàn" (kết quả hiển thị sai lệch hoàn toàn so với bộ lọc người dùng đã chọn).
```

Kết quả đúng:

```text
Bảng sản phẩm phải luôn hiển thị kết quả tương ứng với thao tác tìm kiếm/lọc mới nhất hiện tại của người dùng (tức danh mục "Chuột"). Các request cũ gửi đi trước đó khi chưa hoàn tất phải bị huỷ bỏ (abort) và không được phép ghi đè dữ liệu lên state bảng khi phản hồi muộn.
```

#### b) Vì sao hook hiển thị sai

Hook `useProductSearch_ai.js` gặp lỗi Race Condition (cạnh tranh bất đồng bộ giữa các request mạng). Do hook không cài đặt cơ chế huỷ bỏ request cũ (không dùng `AbortController` của axios) và không có cờ kiểm tra huỷ bỏ (`isCancelled` / `ignore`), các request gửi đi trước nhưng phản hồi chậm sẽ hoàn tất sau cùng và ghi đè `setData` lên kết quả của request mới hơn. Ngoài ra, hook không có cơ chế Debounce khi gõ từ khoá `q`, dẫn đến việc gửi request dồn dập với mỗi ký tự người dùng nhập vào.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
|---|---|---|---|---|---|
| 1 | Viết custom hook useProductSearch tải danh sách sản phẩm theo từ khoá, danh mục, trạng thái và trang | Đoạn mã hook trong file `src/ai/useProductSearch_ai.js` sử dụng useEffect trực tiếp gọi API `api.get('/products')` | Sửa | Đoạn mã AI sinh bị lỗi Race Condition khi mạng có độ trễ bất đồng bộ và thiếu Debounce khiến gửi quá nhiều request. Đã sửa lại trong `src/hooks/useProductSearch.js` bằng cách thêm `AbortController` huỷ request cũ, cờ `isCancelled`, và debounce 300ms cho từ khoá `q`. | Chạy `npm run api:cham`, gõ "ban" rồi chuyển nhanh sang danh mục "Chuột". Với hook cũ bị đè dữ liệu sai sau 2.5s; với hook mới sửa thì request "ban" bị huỷ, bảng luôn hiển thị đúng danh mục "Chuột". |
| 2 | Gợi ý cách đồng bộ bộ lọc và phân trang 2 chiều với URL query params trong React Router v6 | Sử dụng `useSearchParams` từ `react-router-dom`, đọc các param `q`, `category`, `status`, `page` từ URL và cập nhật URL khi state thay đổi | Giữ và sửa nhẹ | Giữ kiến trúc dùng `useSearchParams` để đồng bộ 2 chiều (Back/Forward trình duyệt mượt mà, reload giữ nguyên trang thái). Sửa thêm logic chuẩn hoá: tự động xoá param rỗng hoặc `page=1` để URL gọn đẹp, thêm debounce khi gõ search trước khi đẩy lên URL. | Truy cập trực tiếp đường link `/?category=mouse&page=2`, trang tự động điền filter danh mục "Chuột", nhảy đến trang 2 và tải đúng dữ liệu. Thử bấm nút Back trên trình duyệt, URL và bảng đồng bộ chính xác. |

## Ghi chú (không tính điểm)

Các trường hợp biên đã xử lý:
1. Từ khoá tìm kiếm chỉ có khoảng trắng: Tự động dùng `.trim()` và loại bỏ tham số `q` khỏi query string khi rỗng, trả về danh sách tất cả sản phẩm thay vì lỗi tìm kiếm.
2. Tham số `page` âm hoặc không hợp lệ (ví dụ `page=-3`, `page=abc`): Tự động ép kiểu về `page=1` hợp lệ.
3. Tham số `page` vượt quá tổng số trang (ví dụ `page=999` hoặc khi đang ở trang 5 mà lọc danh mục chỉ còn 1 trang): Ứng dụng tự động phát hiện `currentPage > totalPages` và điều chỉnh về trang cuối cùng (`totalPages`), cập nhật lại URL cho chính xác.
4. Xoá sản phẩm cuối cùng của trang: Tự động tải lại và nếu trang bị trống sẽ lùi về trang trước đó.
5. Xử lý lỗi server / timeout: Hiển thị banner thông báo lỗi thân thiện kèm nút "Thử lại" mà không làm crash ứng dụng.


