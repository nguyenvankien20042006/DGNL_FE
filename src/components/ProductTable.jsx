import { categoryNames } from '../data/sample.js';

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
          {products.map((product) => (
            <tr key={product.id} data-testid="product-row">
              <td data-label="Tên" className="cell-name">{product.name}</td>
              <td data-label="SKU" className="cell-nowrap">{product.sku}</td>
              <td data-label="Danh mục">{categoryNames[product.category] || product.category}</td>
              <td data-label="Giá" className="cell-nowrap">{product.price}</td>
              <td data-label="Tồn kho" className="cell-nowrap">{product.stock}</td>
              <td data-label="Trạng thái">
                <span className="status-badge" data-testid="product-status">
                  {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </td>
              <td data-label="Thao tác">
                <div className="action-group">
                  <button type="button" className="btn-action btn-edit">Sửa</button>
                  <button type="button" className="btn-action btn-delete">Xoá</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
