// ==============================================================================
// BỐ CỤC KHUNG ỨNG DỤNG CHÍNH (src/App.jsx)
// ==============================================================================
// Mục đích: Điểm vào giao diện chính của ứng dụng web OfficeMart Admin.
// Thuộc mục đánh giá: Mục 4.1.1 (Bố cục trang)
// ==============================================================================

// Import trang quản lý danh sách sản phẩm
import ProductListPage from './pages/ProductListPage.jsx';

export default function App() {
  return (
    // Lớp vỏ ứng dụng chiếm chiều cao tối thiểu toàn màn hình (min-height: 100vh)
    <div className="app-shell">
      {/* Thanh Header màu đỏ thương hiệu (#b91c1c) chạy ngang trên cùng màn hình */}
      <header className="top-navbar">
        <div className="top-navbar-inner">
          {/* Tên thương hiệu ứng dụng quản trị */}
          <span className="brand-title">OfficeMart Admin</span>
        </div>
      </header>

      {/* Khu vực nội dung chính ở giữa màn hình */}
      <main className="main-content">
        {/* Render trang quản lý danh sách sản phẩm */}
        <ProductListPage />
      </main>
    </div>
  );
}
