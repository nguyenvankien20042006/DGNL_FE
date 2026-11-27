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
