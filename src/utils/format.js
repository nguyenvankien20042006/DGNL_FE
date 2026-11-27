// ==============================================================================
// PHA 1 - MỤC 4.1.3: ĐỊNH DẠNG DỮ LIỆU
// ==============================================================================
// Tệp: src/utils/format.js
// Chức năng:
//   - Cung cấp hàm tiện ích formatPrice định dạng số nguyên thành tiền Việt Nam.
//   - Ví dụ: 3820000 -> "3.820.000 ₫" (dùng Intl.NumberFormat('vi-VN')).
// ==============================================================================

export function formatPrice(price) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
}
