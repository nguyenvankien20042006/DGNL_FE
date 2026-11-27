import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';
import ProductModal from '../components/ProductModal.jsx';
import ProductTable from '../components/ProductTable.jsx';
import sampleProducts from '../data/sample.js';

export default function ProductListPage() {
  const [products, setProducts] = useState(sampleProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products');
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        setProducts(list);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Không thể tải danh sách sản phẩm từ máy chủ.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleCreateSubmit(payload) {
    await api.post('/products', payload);
    await fetchProducts();
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Thêm sản phẩm
        </button>
      </div>

      {loading && (
        <div className="state-banner state-loading">
          Đang tải dữ liệu sản phẩm...
        </div>
      )}

      {error && (
        <div className="state-banner state-error">
          <span>{error}</span>
          <button type="button" className="btn-retry" onClick={fetchProducts}>
            Thử lại
          </button>
        </div>
      )}

      <ProductTable products={products} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </section>
  );
}
