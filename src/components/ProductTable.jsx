// ==============================================================================
// COMPONENT BẢNG HIỂN THỊ SẢN PHẨM (src/components/ProductTable.jsx)
// ==============================================================================
// Mục đích: Hiển thị danh sách sản phẩm dạng bảng (Desktop) và dạng thẻ card (Mobile).
// Thuộc các mục đánh giá:
//   - Mục 4.1.2: Dựng bảng sản phẩm gồm đầy đủ 7 cột và các nút Sửa, Xoá
//   - Mục 4.1.3: Định dạng giá tiền VND (₫), nhãn "Hết hàng" màu đỏ khi stock = 0,
//                badge trạng thái "Đang bán" / "Ngừng bán", ánh xạ danh mục tiếng Việt
//   - Mục 4.1.4: Thêm data-label trên từng ô <td> phục vụ responsive mobile
//   - Mục 4.2.4 & 4.2.5: Bắt sự kiện bấm nút Sửa (onEdit) và Xoá (onDelete)
// ==============================================================================

// Import categoryNames từ sample.js để ánh xạ từ id danh mục (ví dụ 'keyboard') thành tên tiếng Việt ('Bàn phím')
import { categoryNames } from '../data/sample.js';

// Import hàm formatPrice để định dạng số tiền sang chuẩn VND có ký hiệu ₫ (ví dụ: 3820000 -> "3.820.000 ₫")
import { formatPrice } from '../utils/format.js';

/**
 * Component ProductTable nhận vào các props:
 * @param {Array} products - Mảng danh sách các object sản phẩm cần hiển thị
 * @param {function} onEdit - Callback được gọi khi người dùng bấm nút "Sửa" ở một dòng
 * @param {function} onDelete - Callback được gọi khi người dùng bấm nút "Xoá" ở một dòng
 */
export default function ProductTable({ products = [], onEdit, onDelete }) {
  return (
    // Thẻ div bao ngoài bảng có viền, nền trắng và bo góc
    <div className="table-wrapper">
      <table className="product-table">
        {/* Tiêu đề 7 cột của bảng hiển thị trên Desktop (trên Mobile sẽ tự ẩn đi qua CSS) */}
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

        {/* Thân bảng duyệt qua mảng products để render từng dòng <tr> */}
        <tbody>
          {products.map((product) => {
            // Kiểm tra xem sản phẩm có hết hàng hay không (khi số lượng tồn kho = 0)
            const isOutOfStock = product.stock === 0;

            // Kiểm tra trạng thái đang bán (active) hay ngừng bán (inactive)
            const isActive = product.status === 'active';

            return (
              // BẮT BUỘC: data-testid="product-row" trên mỗi thẻ <tr> để vượt qua test tự động (Mục 4.1.2)
              <tr key={product.id} data-testid="product-row">
                {/* Cột 1: Tên sản phẩm - data-label="Tên" để CSS mobile hiện tiêu đề */}
                <td data-label="Tên" className="cell-name">
                  {product.name}
                </td>

                {/* Cột 2: Mã SKU - cell-nowrap để chữ không bị xuống dòng */}
                <td data-label="SKU" className="cell-nowrap">
                  {product.sku}
                </td>

                {/* Cột 3: Tên danh mục - tra cứu trong categoryNames, nếu không có thì fallback về id gốc */}
                <td data-label="Danh mục">
                  {categoryNames[product.category] || product.category}
                </td>

                {/* Cột 4: Giá bán - gọi hàm formatPrice để hiển thị định dạng tiền tệ Việt Nam */}
                <td data-label="Giá" className="cell-nowrap">
                  {formatPrice(product.price)}
                </td>

                {/* Cột 5: Tồn kho - nếu hết hàng (stock = 0) thì gắn class cell-stock-empty để có chữ đỏ "Hết hàng" */}
                <td
                  data-label="Tồn kho"
                  className={isOutOfStock ? 'cell-stock-empty' : 'cell-nowrap'}
                >
                  {isOutOfStock ? 'Hết hàng' : product.stock}
                </td>

                {/* Cột 6: Trạng thái - BẮT BUỘC có data-testid="product-status" cho test tự động (Mục 4.1.3) */}
                <td data-label="Trạng thái">
                  <span
                    className={
                      isActive
                        ? 'status-badge status-active'    // Nền xanh nhạt, chữ xanh đậm khi "Đang bán"
                        : 'status-badge status-inactive'  // Nền xám nhạt, chữ xám đậm khi "Ngừng bán"
                    }
                    data-testid="product-status"
                  >
                    {isActive ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>

                {/* Cột 7: Cụm nút Thao tác gồm nút "Sửa" và nút "Xoá" */}
                <td data-label="Thao tác">
                  <div className="action-group">
                    {/* Nút Sửa: bấm vào sẽ gọi callback onEdit truyền kèm toàn bộ object sản phẩm này */}
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit && onEdit(product)}
                    >
                      Sửa
                    </button>

                    {/* Nút Xoá: bấm vào sẽ gọi callback onDelete truyền kèm object sản phẩm để xác nhận xoá */}
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
