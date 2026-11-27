import { useState } from 'react';
import api from '../api/axiosClient.js';
import ProductModal from '../components/ProductModal.jsx';
import ProductTable from '../components/ProductTable.jsx';
import { categoryNames } from '../data/sample.js';
import useProductSearch from '../hooks/useProductSearch.js';

export default function ProductListPage() {
  // Bộ lọc tìm kiếm
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Gọi custom hook tìm kiếm, lọc và phân trang đã sửa lỗi
  const { data: products, total, loading, error, refetch } = useProductSearch({
    q: filterQuery,
    category: filterCategory,
    status: filterStatus,
    page,
    limit,
  });

  // State quản lý Modal thêm / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Xử lý thay đổi từ khóa
  function handleSearchChange(e) {
    setFilterQuery(e.target.value);
    setPage(1);
  }

  // Xử lý thay đổi danh mục
  function handleCategoryChange(e) {
    setFilterCategory(e.target.value);
    setPage(1);
  }

  // Xử lý thay đổi trạng thái
  function handleStatusChange(e) {
    setFilterStatus(e.target.value);
    setPage(1);
  }

  // Xoá tất cả bộ lọc
  function handleResetFilters() {
    setFilterQuery('');
    setFilterCategory('');
    setFilterStatus('');
    setPage(1);
  }

  function handleOpenCreate() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá sản phẩm "${product.name}"?`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/products/${product.id}`);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xoá sản phẩm.');
    }
  }

  async function handleModalSubmit(payload) {
    if (editingProduct) {
      await api.put(`/products/${editingProduct.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    refetch();
  }

  const hasActiveFilters = Boolean(filterQuery || filterCategory || filterStatus);

  return (
    <section className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenCreate}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Thanh tìm kiếm và bộ lọc (Mục 4.3.1) */}
      <div className="filter-card">
        <div className="filter-group filter-search">
          <input
            type="text"
            className="filter-input"
            placeholder="Tìm theo tên hoặc mã SKU..."
            value={filterQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filterCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Tất cả danh mục</option>
            {Object.entries(categoryNames).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={handleStatusChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={handleResetFilters}
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {loading && (
        <div className="state-banner state-loading">
          Đang tải dữ liệu sản phẩm...
        </div>
      )}

      {error && (
        <div className="state-banner state-error">
          <span>{error}</span>
          <button type="button" className="btn-retry" onClick={refetch}>
            Thử lại
          </button>
        </div>
      )}

      {/* Bảng hiển thị danh sách sản phẩm */}
      <ProductTable
        products={products}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Modal form thêm / sửa */}
      <ProductModal
        isOpen={isModalOpen}
        initialData={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </section>
  );
}
