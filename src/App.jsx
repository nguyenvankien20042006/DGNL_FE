// ==============================================================================
// PHA 1 - MỤC 4.1.1: BỐ CỤC KHUNG ỨNG DỤNG (APP SHELL)
// ==============================================================================
// Tệp: src/App.jsx
// Chức năng thực hiện trong Pha 1:
//   - [4.1.1] Bố cục trang: Header trên cùng màu đỏ (#b91c1c) với thương hiệu
//             "OfficeMart Admin", vùng nội dung chính hiển thị trang sản phẩm.
// ==============================================================================

import ProductListPage from './pages/ProductListPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="top-navbar">
        <div className="top-navbar-inner">
          <span className="brand-title">OfficeMart Admin</span>
        </div>
      </header>
      <main className="main-content">
        <ProductListPage />
      </main>
    </div>
  );
}
