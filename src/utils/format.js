// ==============================================================================
// HÀM TIỆN ÍCH ĐỊNH DẠNG GIÁ TIỀN (src/utils/format.js)
// ==============================================================================
// Mục đích: Định dạng một số nguyên bất kỳ thành chuỗi tiền tệ Việt Nam (VND).
// Thuộc mục đánh giá: Mục 4.1.3 (Định dạng dữ liệu)
// ==============================================================================

/**
 * Hàm formatPrice
 * @param {number} price - Giá sản phẩm dạng số nguyên (ví dụ: 3820000)
 * @returns {string} - Chuỗi giá tiền đã định dạng (ví dụ: "3.820.000 ₫")
 */
export function formatPrice(price) {
  // 1. new Intl.NumberFormat('vi-VN'): Đối tượng chuẩn của JavaScript định dạng số theo ngôn ngữ Việt Nam.
  //    Nó sẽ tự động thêm dấu chấm (.) ngăn cách mỗi 3 chữ số hàng nghìn.
  // 2. .format(price): Chuyển số price thành chuỗi có dấu chấm, ví dụ: 3820000 -> "3.820.000".
  // 3. \`... ₫\`: Thêm ký hiệu đồng tiền Việt Nam (₫) kèm khoảng cách ở cuối chuỗi.
  return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
}
