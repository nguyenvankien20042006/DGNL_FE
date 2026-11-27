import ProductTable from '../components/ProductTable.jsx';
import sampleProducts from '../data/sample.js';

export default function ProductListPage() {
  return (
    <section className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <button type="button" className="btn-primary">
          Thêm sản phẩm
        </button>
      </div>
      <ProductTable products={sampleProducts} />
    </section>
  );
}
