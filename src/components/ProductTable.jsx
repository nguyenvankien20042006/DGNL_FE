// ==============================================================================
// PHA 1 - MỤC 4.1.2, 4.1.3, 4.1.4: BẢNG SẢN PHẨM & HIỂN THỊ DỮ LIỆU
// ==============================================================================
// Tệp: src/components/ProductTable.jsx
// Chức năng thực hiện trong Pha 1:
//   - [4.1.2] Bảng sản phẩm: Hiển thị 7 cột (Tên, SKU, Danh mục, Giá, Tồn kho,
//             Trạng thái, Thao tác). Mỗi hàng có data-testid="product-row".
//   - [4.1.3] Định dạng dữ liệu:
//             + Giá: hiển thị tiền tệ VND có ký hiệu ₫ (formatPrice).
//             + Tồn kho = 0: hiển thị chữ màu đỏ "Hết hàng" (.cell-stock-empty).
//             + Trạng thái: badge màu xanh "Đang bán" hoặc xám "Ngừng bán" (data-testid="product-status").
//             + Danh mục: ánh xạ từ ID sang tiếng Việt qua categoryNames.
//   - [4.1.4] Hiển thị mobile: Gắn data-label ở từng ô <td> để CSS mobile hiển thị nhãn cột.
//   - [4.2.4 & 4.2.5] Kết nối các nút "Sửa" (onEdit) và "Xoá" (onDelete).
// ==============================================================================

import { categoryNames } from '../data/sample.js';
import { formatPrice } from '../utils/format.js';

export default function ProductTable({ products = [], onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>SKU</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isActive = product.status === 'active';

            return (
              <tr key={product.id} data-testid="product-row">
                <td data-label="Tên" className="cell-name">
                  {product.name}
                </td>
                <td data-label="SKU" className="cell-nowrap">
                  {product.sku}
                </td>
                <td data-label="Danh mục">
                  {categoryNames[product.category] || product.category}
                </td>
                <td data-label="Giá" className="cell-nowrap">
                  {formatPrice(product.price)}
                </td>
                <td
                  data-label="Tồn kho"
                  className={isOutOfStock ? 'cell-stock-empty' : 'cell-nowrap'}
                >
                  {isOutOfStock ? 'Hết hàng' : product.stock}
                </td>
                <td data-label="Trạng thái">
                  <span
                    className={
                      isActive
                        ? 'status-badge status-active'
                        : 'status-badge status-inactive'
                    }
                    data-testid="product-status"
                  >
                    {isActive ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td data-label="Thao tác">
                  <div className="action-group">
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit && onEdit(product)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => onDelete && onDelete(product)}
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
