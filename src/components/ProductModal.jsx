// ==============================================================================
// COMPONENT FORM MODAL THÊM / SỬA SẢN PHẨM (src/components/ProductModal.jsx)
// ==============================================================================
// Mục đích: Hiển thị popup modal cho phép người dùng nhập thông tin sản phẩm mới
//          hoặc chỉnh sửa thông tin của một sản phẩm đã có.
// Thuộc các mục đánh giá:
//   - Mục 4.2.2: Dựng form thêm sản phẩm (các trường nhập liệu)
//   - Mục 4.2.3: Xử lý submit form, validate dữ liệu client và server
//   - Mục 4.2.4: Chức năng sửa sản phẩm (prefill dữ liệu cũ vào form)
// ==============================================================================

// Import các hook cơ bản của React:
// - useEffect: dùng để lắng nghe khi modal mở ra hoặc dữ liệu sản phẩm thay đổi để điền sẵn vào form.
// - useState: dùng để quản lý state dữ liệu nhập của form, lỗi validate, và trạng thái loading khi submit.
import { useEffect, useState } from 'react';

// Import đối tượng danh mục (categoryNames) từ file sample.js để đổ vào dropdown select danh mục
import { categoryNames } from '../data/sample.js';

// Giá trị khởi tạo mặc định cho form khi ở chế độ "Thêm mới" (rỗng tất cả trường, trạng thái mặc định là 'active')
const INITIAL_FORM = {
  name: '',        // Tên sản phẩm
  sku: '',         // Mã SKU sản phẩm
  category: 'keyboard', // Danh mục mặc định là bàn phím
  price: '',       // Giá sản phẩm (để chuỗi rỗng để placeholder hiển thị)
  stock: '',       // Tồn kho (để chuỗi rỗng)
  status: 'active',// Trạng thái: 'active' (Đang bán) hoặc 'inactive' (Ngừng bán)
};

// Biểu thức chính quy (Regex) kiểm tra định dạng SKU:
// ^[A-Z]{3} : Bắt đầu bằng 3 chữ cái tiếng Anh in hoa (ví dụ: KEY, MOU, MON, DSK, CHR)
// -         : Có dấu gạch nối ở giữa
// \d{4}$    : Kết thúc bằng đúng 4 chữ số (ví dụ: 0001, 0008, 1234)
const SKU_REGEX = /^[A-Z]{3}-\d{4}$/;

/**
 * Component ProductModal nhận vào các props:
 * @param {boolean} isOpen - Trạng thái modal có đang mở hay không (true/false)
 * @param {object|null} initialData - Dữ liệu sản phẩm cần sửa (nếu là null nghĩa là đang thêm mới)
 * @param {function} onClose - Hàm gọi khi người dùng bấm Huỷ hoặc nút [x] để đóng modal
 * @param {function} onSubmit - Hàm gửi dữ liệu lên server (gọi api.post hoặc api.put ở component cha)
 */
export default function ProductModal({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) {
  // State lưu trữ dữ liệu người dùng đang nhập trên form
  const [formData, setFormData] = useState(INITIAL_FORM);

  // State lưu trữ thông báo lỗi cho từng trường (ví dụ: errors.name, errors.sku, errors.general)
  const [errors, setErrors] = useState({});

  // State quản lý trạng thái đang gửi form (để vô hiệu hoá nút bấm, tránh click gửi 2 lần)
  const [submitting, setSubmitting] = useState(false);

  // useEffect này chạy mỗi khi `isOpen` hoặc `initialData` thay đổi:
  useEffect(() => {
    // Chỉ xử lý khi modal đang được mở
    if (isOpen) {
      if (initialData) {
        // Nếu có initialData -> Đang ở chế độ SỬA: điền toàn bộ thông tin sản phẩm đó vào form
        setFormData({
          name: initialData.name ?? '',
          sku: initialData.sku ?? '',
          category: initialData.category ?? 'keyboard',
          price: initialData.price ?? '',
          stock: initialData.stock ?? '',
          status: initialData.status ?? 'active',
        });
      } else {
        // Nếu không có initialData -> Đang ở chế độ THÊM MỚI: reset form về giá trị mặc định
        setFormData(INITIAL_FORM);
      }
      // Xoá sạch mọi thông báo lỗi cũ khi mở modal
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Nếu isOpen = false, component không render bất kỳ mã HTML nào (trả về null)
  if (!isOpen) return null;

  // Biến kiểm tra xem modal đang là chế độ SỬA hay THÊM MỚI (nếu có initialData nghĩa là đang sửa)
  const isEditing = Boolean(initialData);

  // Hàm xử lý sự kiện khi người dùng gõ vào các ô input hoặc thay đổi select
  function handleChange(e) {
    const { name, value } = e.target;
    // Cập nhật giá trị tương ứng vào formData theo tên trường [name]
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Nếu trường này trước đó đang báo lỗi, khi người dùng gõ lại thì tự động xoá lỗi đi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  // Hàm kiểm tra tính hợp lệ của dữ liệu (Client Validation) theo đúng yêu cầu đề bài
  function validate() {
    const nextErrors = {};
    const trimmedName = formData.name.trim();

    // 1. Kiểm tra Tên sản phẩm: độ dài từ 3 đến 100 ký tự
    if (trimmedName.length < 3 || trimmedName.length > 100) {
      nextErrors.name = 'Tên sản phẩm từ 3 đến 100 ký tự';
    }

    // 2. Kiểm tra Mã SKU: phải đúng định dạng ABC-1234
    if (!SKU_REGEX.test(formData.sku.trim())) {
      nextErrors.sku = 'SKU có dạng ABC-1234';
    }

    // 3. Kiểm tra Danh mục: mã danh mục phải tồn tại trong danh sách danh mục hợp lệ
    if (!categoryNames[formData.category]) {
      nextErrors.category = 'Danh mục không hợp lệ';
    }

    // 4. Kiểm tra Giá: phải là số và lớn hơn 0
    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
      nextErrors.price = 'Giá phải lớn hơn 0';
    }

    // 5. Kiểm tra Tồn kho: phải là số nguyên không âm (>= 0)
    const stockNum = Number(formData.stock);
    if (
      formData.stock === '' ||
      isNaN(stockNum) ||
      !Number.isInteger(stockNum) ||
      stockNum < 0
    ) {
      nextErrors.stock = 'Tồn kho là số nguyên không âm';
    }

    // Trả về object chứa các lỗi (nếu rỗng {} tức là form hợp lệ)
    return nextErrors;
  }

  // Hàm xử lý khi người dùng nhấn nút submit (Thêm sản phẩm / Lưu thay đổi)
  async function handleSubmit(e) {
    // Ngăn chặn trình duyệt reload lại trang mặc định của form
    e.preventDefault();

    // Chạy hàm validate dữ liệu
    const validationErrors = validate();

    // Nếu có lỗi -> gán lỗi vào state errors để hiển thị lên giao diện và dừng lại, không gọi API
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Bắt đầu gửi: bật cờ submitting = true để khoá nút bấm
    setSubmitting(true);
    setErrors({});

    try {
      // Gọi hàm onSubmit được truyền từ component cha (gửi dữ liệu đã được ép kiểu chuẩn lên API)
      await onSubmit({
        name: formData.name.trim(),     // Cắt khoảng trắng thừa đầu đuôi
        sku: formData.sku.trim(),       // Cắt khoảng trắng thừa ở mã SKU
        category: formData.category,    // Mã danh mục
        price: Number(formData.price),  // Ép kiểu về số
        stock: Number(formData.stock),  // Ép kiểu về số
        status: formData.status,        // Trạng thái ('active' / 'inactive')
      });

      // Nếu thành công -> đóng modal
      onClose();
    } catch (err) {
      // Nếu API trả về lỗi (ví dụ mã 400 hoặc 409 SKU đã tồn tại):
      const serverErr = err.response?.data;

      if (serverErr?.field && serverErr?.message) {
        // Gán lỗi cụ thể vào trường bị lỗi tương ứng (ví dụ: lỗi trường sku)
        setErrors((prev) => ({
          ...prev,
          [serverErr.field]: serverErr.message,
        }));
      } else {
        // Lỗi chung (ví dụ lỗi máy chủ 500 hoặc mất mạng)
        setErrors((prev) => ({
          ...prev,
          general: serverErr?.message || 'Có lỗi xảy ra, vui lòng thử lại',
        }));
      }
    } finally {
      // Kết thúc gửi: tắt trạng thái submitting
      setSubmitting(false);
    }
  }

  return (
    // Lớp phủ nền mờ màu đen phía sau modal. Bấm ra ngoài vùng modal sẽ kích hoạt onClose đóng modal.
    <div className="modal-backdrop" onClick={onClose}>
      {/* Vùng hộp thoại trắng của modal. Dùng e.stopPropagation() để bấm vào trong modal không bị đóng. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header của Modal gồm tiêu đề và nút [x] đóng */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Thông báo lỗi chung từ máy chủ nếu có */}
          {errors.general && (
            <div className="form-error-alert">{errors.general}</div>
          )}

          {/* Trường 1: Tên sản phẩm */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Tên sản phẩm
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Nhập tên sản phẩm (3 - 100 ký tự)"
              value={formData.name}
              onChange={handleChange}
            />
            {/* Hiển thị dòng thông báo lỗi màu đỏ ngay dưới ô input nếu có lỗi */}
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Trường 2: Mã SKU */}
          <div className="form-group">
            <label htmlFor="sku" className="form-label">
              Mã SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              className={`form-input ${errors.sku ? 'input-error' : ''}`}
              placeholder="Ví dụ: MON-0008"
              value={formData.sku}
              onChange={handleChange}
            />
            {errors.sku && <span className="field-error">{errors.sku}</span>}
          </div>

          {/* Trường 3: Danh mục sản phẩm (Dropdown Select) */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Danh mục
            </label>
            <select
              id="category"
              name="category"
              className={`form-input ${errors.category ? 'input-error' : ''}`}
              value={formData.category}
              onChange={handleChange}
            >
              {/* Lặp qua danh sách danh mục để tạo các thẻ <option> */}
              {Object.entries(categoryNames).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error">{errors.category}</span>
            )}
          </div>

          {/* Hàng ngang chứa Giá và Tồn kho */}
          <div className="form-row">
            {/* Trường 4: Giá (₫) */}
            <div className="form-group flex-1">
              <label htmlFor="price" className="form-label">
                Giá (₫)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                className={`form-input ${errors.price ? 'input-error' : ''}`}
                placeholder="Ví dụ: 1290000"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && (
                <span className="field-error">{errors.price}</span>
              )}
            </div>

            {/* Trường 5: Tồn kho */}
            <div className="form-group flex-1">
              <label htmlFor="stock" className="form-label">
                Tồn kho
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                className={`form-input ${errors.stock ? 'input-error' : ''}`}
                placeholder="Ví dụ: 10"
                value={formData.stock}
                onChange={handleChange}
              />
              {errors.stock && (
                <span className="field-error">{errors.stock}</span>
              )}
            </div>
          </div>

          {/* Trường 6: Trạng thái sản phẩm (Đang bán / Ngừng bán) */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>

          {/* Cụm nút bấm thao tác ở chân Modal */}
          <div className="modal-actions">
            {/* Nút Huỷ: bấm để đóng modal mà không lưu */}
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Huỷ
            </button>

            {/* Nút Lưu: submit form gửi dữ liệu lên server */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Đang lưu...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
