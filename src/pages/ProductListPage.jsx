// Trang danh sách sản phẩm OfficeMart Admin
// Hỗ trợ tìm kiếm, lọc, phân trang và đồng bộ 2 chiều với URL (Mục 4.3.1, 4.3.2, 4.3.3)
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ProductModal from '../components/ProductModal.jsx';
import ProductTable from '../components/ProductTable.jsx';
import { categoryNames } from '../data/sample.js';
import useProductSearch from '../hooks/useProductSearch.js';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc tham số từ URL Search Params (Mục 4.3.3)
  const queryFromUrl = searchParams.get('q') || '';
  const categoryFromUrl = searchParams.get('category') || '';
  const statusFromUrl = searchParams.get('status') || '';
  const pageFromUrl = Number(searchParams.get('page'));
  const currentPage = !Number.isInteger(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  const limit = 10;

  // Local state cho ô tìm kiếm để người dùng gõ phím mượt mà
  const [searchInput, setSearchInput] = useState(queryFromUrl);

  // Khi URL thay đổi (Back / Forward), cập nhật lại searchInput
  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  // Hàm cập nhật URL Search Params đồng bộ (Mục 4.3.3)
  function updateUrlParams(updates) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      // Bỏ các param rỗng hoặc page=1 để URL ngắn gọn, sạch sẽ
      if (
        value === '' ||
        value === null ||
        value === undefined ||
        (key === 'page' && (value === 1 || value === '1'))
      ) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  }

  // Gọi custom hook tải danh sách sản phẩm với tham số đã đồng bộ từ URL
  const { data: products, total, loading, error, refetch } = useProductSearch({
    q: queryFromUrl,
    category: categoryFromUrl,
    status: statusFromUrl,
    page: currentPage,
    limit,
  });

  // Tính tổng số trang (Mục 4.3.2)
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Tự động điều chỉnh trang nếu URL có page vượt quá tổng số trang (xử lý case biên: page=999)
  useEffect(() => {
    if (total > 0 && currentPage > totalPages) {
      updateUrlParams({ page: totalPages });
    }
  }, [total, currentPage, totalPages]);

  // State quản lý Modal thêm / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Debounce đẩy từ khóa lên URL sau 350ms khi người dùng ngừng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== queryFromUrl) {
        updateUrlParams({ q: searchInput.trim(), page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Xử lý khi gõ vào ô tìm kiếm
  function handleSearchInputChange(e) {
    setSearchInput(e.target.value);
  }

  // Xử lý thay đổi danh mục
  function handleCategoryChange(e) {
    updateUrlParams({ category: e.target.value, page: 1 });
  }

  // Xử lý thay đổi trạng thái
  function handleStatusChange(e) {
    updateUrlParams({ status: e.target.value, page: 1 });
  }

  // Xoá tất cả bộ lọc, trở về trang 1
  function handleResetFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  // Chuyển trang (Mục 4.3.2)
  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      updateUrlParams({ page: newPage });
    }
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

  const hasActiveFilters = Boolean(queryFromUrl || categoryFromUrl || statusFromUrl || searchInput);

  // Xác định khoảng hiển thị số sản phẩm hiện tại
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  // Sinh danh sách các nút số trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pageNumbers.push(i);
  }

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

      {/* Thanh tìm kiếm và bộ lọc (Mục 4.3.1 & 4.3.3) */}
      <div className="filter-card">
        <div className="filter-group filter-search">
          <input
            type="text"
            className="filter-input"
            placeholder="Tìm theo tên hoặc mã SKU..."
            value={searchInput}
            onChange={handleSearchInputChange}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={categoryFromUrl}
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
            value={statusFromUrl}
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

      {/* Thanh phân trang (Mục 4.3.2 & 4.3.3) */}
      <div className="pagination-bar">
        <div className="pagination-info">
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số <strong>{total}</strong> sản phẩm
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            &laquo; Trước
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              className={`pagination-btn pagination-num ${p === currentPage ? 'pagination-active' : ''}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Sau &raquo;
          </button>
        </div>
      </div>

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
