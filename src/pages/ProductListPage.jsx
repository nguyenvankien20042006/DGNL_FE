// ==============================================================================
// TRANG DANH SÁCH SẢN PHẨM (src/pages/ProductListPage.jsx)
// ==============================================================================
// Mục đích: Trang chính quản lý sản phẩm, kết hợp toàn bộ tính năng của bài thi:
//   - Pha 1: Bố cục trang (4.1.1), gọi API tải dữ liệu (4.2.1), Modal thêm (4.2.2 & 4.2.3),
//            chức năng sửa (4.2.4) và chức năng xoá (4.2.5).
//   - Pha 2: Thanh tìm kiếm & lọc (4.3.1), thanh phân trang (4.3.2), đồng bộ 2 chiều
//            với URL query params qua useSearchParams (4.3.3).
// ==============================================================================

import { useEffect, useState } from 'react';
// Import hook useSearchParams từ react-router-dom để đọc và ghi query parameters trên thanh địa chỉ URL
import { useSearchParams } from 'react-router-dom';

// Import đối tượng gọi API axios
import api from '../api/axiosClient.js';

// Import các component con: Modal nhập liệu và Bảng sản phẩm
import ProductModal from '../components/ProductModal.jsx';
import ProductTable from '../components/ProductTable.jsx';

// Import danh sách tên tiếng Việt của các danh mục
import { categoryNames } from '../data/sample.js';

// Import custom hook tìm kiếm, lọc và phân trang đã khắc phục lỗi Race Condition
import useProductSearch from '../hooks/useProductSearch.js';

export default function ProductListPage() {
  // ============================================================================
  // 1. [MỤC 4.3.3] ĐỒNG BỘ URL QUERY PARAMETERS (ĐỌC DỮ LIỆU TỪ URL)
  // ============================================================================
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc từ khoá tìm kiếm từ URL: ví dụ link `/?q=ban` -> lấy được "ban", nếu không có thì mặc định là chuỗi rỗng ''
  const queryFromUrl = searchParams.get('q') || '';

  // Đọc danh mục từ URL: ví dụ `/?category=mouse` -> lấy được "mouse"
  const categoryFromUrl = searchParams.get('category') || '';

  // Đọc trạng thái từ URL: ví dụ `/?status=active` -> lấy được "active"
  const statusFromUrl = searchParams.get('status') || '';

  // Đọc số trang từ URL: ví dụ `/?page=2` -> ép kiểu về số nguyên
  const pageFromUrl = Number(searchParams.get('page'));
  // Xử lý case biên: nếu page trên URL không phải số hoặc < 1 (ví dụ page=-3, page=abc) -> mặc định là 1
  const currentPage = !Number.isInteger(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  // Số lượng sản phẩm hiển thị trên mỗi trang theo đề bài là 10
  const limit = 10;

  // Local state lưu trữ nội dung người dùng đang gõ vào ô tìm kiếm (để trải nghiệm gõ phím không bị giật lag)
  const [searchInput, setSearchInput] = useState(queryFromUrl);

  // Khi URL thay đổi từ bên ngoài (ví dụ người dùng bấm nút Back hoặc Forward trên trình duyệt), đồng bộ lại searchInput
  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  // Hàm tiện ích cập nhật các query parameters lên thanh địa chỉ URL (Mục 4.3.3)
  function updateUrlParams(updates) {
    const next = new URLSearchParams(searchParams);

    // Duyệt qua từng cặp [key, value] cần cập nhật
    Object.entries(updates).forEach(([key, value]) => {
      // Chuẩn hóa: Nếu giá trị rỗng hoặc page=1 thì xoá khỏi URL để đường dẫn link luôn ngắn gọn, sạch đẹp
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

    // Cập nhật lại URL mà không làm reload lại toàn bộ trang web (dùng replace: true để không làm rối lịch sử duyệt web)
    setSearchParams(next, { replace: true });
  }

  // ============================================================================
  // 2. [MỤC 4.2.1 & 4.3.1 & 4.3.2] GỌI CUSTOM HOOK TẢI DỮ LIỆU
  // ============================================================================
  // Truyền các tham số lấy từ URL vào hook để hook tự động gọi API lấy dữ liệu tương ứng
  const { data: products, total, loading, error, refetch } = useProductSearch({
    q: queryFromUrl,
    category: categoryFromUrl,
    status: statusFromUrl,
    page: currentPage,
    limit,
  });

  // Tính tổng số trang = trần của (tổng số sản phẩm / số sản phẩm mỗi trang), tối thiểu luôn là 1 trang
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Xử lý case biên (Mục 4.3.5): Nếu người dùng gõ URL page=999 hoặc bộ lọc mới làm số trang giảm xuống (ví dụ còn 1 trang)
  // mà currentPage đang là 5 -> tự động điều chỉnh trang về trang cuối cùng hợp lệ (totalPages)
  useEffect(() => {
    if (total > 0 && currentPage > totalPages) {
      updateUrlParams({ page: totalPages });
    }
  }, [total, currentPage, totalPages]);

  // ============================================================================
  // 3. [MỤC 4.2.2 & 4.2.4] QUẢN LÝ POPUP MODAL THÊM VÀ SỬA SẢN PHẨM
  // ============================================================================
  // State quản lý việc modal đang đóng (false) hay mở (true)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State lưu trữ thông tin sản phẩm đang được sửa (nếu là null nghĩa là đang THÊM MỚI)
  const [editingProduct, setEditingProduct] = useState(null);

  // Debounce: Sau khi người dùng ngừng gõ vào ô tìm kiếm 350ms, mới cập nhật từ khóa lên URL và reset về trang 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== queryFromUrl) {
        updateUrlParams({ q: searchInput.trim(), page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Xử lý khi người dùng thay đổi chữ trong ô tìm kiếm
  function handleSearchInputChange(e) {
    setSearchInput(e.target.value);
  }

  // Xử lý khi người dùng chọn danh mục khác ở dropdown
  function handleCategoryChange(e) {
    updateUrlParams({ category: e.target.value, page: 1 });
  }

  // Xử lý khi người dùng chọn trạng thái khác ở dropdown
  function handleStatusChange(e) {
    updateUrlParams({ status: e.target.value, page: 1 });
  }

  // Xử lý khi người dùng bấm nút "Xoá bộ lọc"
  function handleResetFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  // Xử lý khi người dùng bấm nút chuyển trang (Trang trước, trang sau hoặc số trang)
  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      updateUrlParams({ page: newPage });
    }
  }

  // [Pha 1 - 4.2.2] Mở modal ở chế độ THÊM MỚI (editingProduct = null)
  function handleOpenCreate() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  // [Pha 1 - 4.2.4] Mở modal ở chế độ SỬA (gán object sản phẩm được chọn vào editingProduct)
  function handleOpenEdit(product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  // [Pha 1 - 4.2.5] Xoá sản phẩm qua API
  async function handleDelete(product) {
    // Hiển thị hộp thoại xác nhận theo yêu cầu đề bài
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá sản phẩm "${product.name}"?`,
    );
    if (!confirmed) return; // Nếu người dùng bấm Huỷ -> dừng lại

    try {
      // Gửi DELETE request lên API với id sản phẩm
      await api.delete(`/products/${product.id}`);
      // Xoá thành công -> tải lại danh sách mới nhất
      refetch();
    } catch (err) {
      // Báo lỗi nếu API xoá thất bại
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xoá sản phẩm.');
    }
  }

  // [Pha 1 - 4.2.3 & 4.2.4] Gửi form thêm mới hoặc sửa
  async function handleModalSubmit(payload) {
    if (editingProduct) {
      // Nếu đang sửa -> gọi PUT /api/products/:id
      await api.put(`/products/${editingProduct.id}`, payload);
    } else {
      // Nếu đang thêm mới -> gọi POST /api/products
      await api.post('/products', payload);
    }
    // Thành công -> tải lại danh sách sản phẩm
    refetch();
  }

  // Kiểm tra xem có bất kỳ tiêu chí lọc nào đang hoạt động hay không (để quyết định hiển thị nút Xoá bộ lọc)
  const hasActiveFilters = Boolean(queryFromUrl || categoryFromUrl || statusFromUrl || searchInput);

  // Tính số thứ tự sản phẩm bắt đầu và kết thúc của trang hiện tại (ví dụ: hiển thị 1 - 10 trên 120)
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  // Sinh mảng các số trang từ 1 đến totalPages để render các nút bấm số trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <section className="page-container">
      {/* =======================================================================
          PHẦN 1: HEADER TRANG (Tiêu đề Sản phẩm và nút Thêm sản phẩm) - Mục 4.1.1
         ======================================================================= */}
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

      {/* =======================================================================
          PHẦN 2: THANH TÌM KIẾM VÀ BỘ LỌC - Mục 4.3.1 & 4.3.3
         ======================================================================= */}
      <div className="filter-card">
        {/* Ô nhập từ khóa tìm kiếm (q) */}
        <div className="filter-group filter-search">
          <input
            type="text"
            className="filter-input"
            placeholder="Tìm theo tên hoặc mã SKU..."
            value={searchInput}
            onChange={handleSearchInputChange}
          />
        </div>

        {/* Dropdown lọc theo Danh mục (category) */}
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

        {/* Dropdown lọc theo Trạng thái (status) */}
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

        {/* Nút Xoá bộ lọc (chỉ hiện khi có tiêu chí lọc đang được chọn) */}
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

      {/* =======================================================================
          PHẦN 3: BANNER TRẠNG THÁI LOADING / ERROR - Mục 4.2.1
         ======================================================================= */}
      {/* Banner hiển thị khi đang tải dữ liệu */}
      {loading && (
        <div className="state-banner state-loading">
          Đang tải dữ liệu sản phẩm...
        </div>
      )}

      {/* Banner thông báo lỗi nếu tải thất bại kèm nút "Thử lại" */}
      {error && (
        <div className="state-banner state-error">
          <span>{error}</span>
          <button type="button" className="btn-retry" onClick={refetch}>
            Thử lại
          </button>
        </div>
      )}

      {/* =======================================================================
          PHẦN 4: BẢNG DỮ LIỆU SẢN PHẨM - Mục 4.1.2 & 4.1.3 & 4.1.4
         ======================================================================= */}
      <ProductTable
        products={products}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* =======================================================================
          PHẦN 5: THANH PHÂN TRANG (PAGINATION) - Mục 4.3.2
         ======================================================================= */}
      <div className="pagination-bar">
        {/* Dòng chữ thống kê khoảng sản phẩm đang hiển thị */}
        <div className="pagination-info">
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số <strong>{total}</strong> sản phẩm
        </div>

        {/* Cụm các nút điều hướng phân trang */}
        <div className="pagination-controls">
          {/* Nút lùi về trang trước (bị disable khi đang ở trang 1) */}
          <button
            type="button"
            className="pagination-btn pagination-nav"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            &laquo; Trước
          </button>

          {/* Danh sách các nút số trang 1, 2, 3... Nút trang hiện tại sẽ có class pagination-active */}
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

          {/* Nút chuyển tới trang sau (bị disable khi đang ở trang cuối cùng) */}
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

      {/* =======================================================================
          PHẦN 6: MODAL THÊM / SỬA SẢN PHẨM - Mục 4.2.2 & 4.2.4
         ======================================================================= */}
      <ProductModal
        isOpen={isModalOpen}
        initialData={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </section>
  );
}
