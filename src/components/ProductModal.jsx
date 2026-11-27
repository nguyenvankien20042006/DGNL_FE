import { useEffect, useState } from 'react';
import { categoryNames } from '../data/sample.js';

const INITIAL_FORM = {
  name: '',
  sku: '',
  category: 'keyboard',
  price: '',
  stock: '',
  status: 'active',
};

const SKU_REGEX = /^[A-Z]{3}-\d{4}$/;

export default function ProductModal({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name ?? '',
          sku: initialData.sku ?? '',
          category: initialData.category ?? 'keyboard',
          price: initialData.price ?? '',
          stock: initialData.stock ?? '',
          status: initialData.status ?? 'active',
        });
      } else {
        setFormData(INITIAL_FORM);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const nextErrors = {};
    const trimmedName = formData.name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      nextErrors.name = 'Tên sản phẩm từ 3 đến 100 ký tự';
    }

    if (!SKU_REGEX.test(formData.sku.trim())) {
      nextErrors.sku = 'SKU có dạng ABC-1234';
    }

    if (!categoryNames[formData.category]) {
      nextErrors.category = 'Danh mục không hợp lệ';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
      nextErrors.price = 'Giá phải lớn hơn 0';
    }

    const stockNum = Number(formData.stock);
    if (
      formData.stock === '' ||
      isNaN(stockNum) ||
      !Number.isInteger(stockNum) ||
      stockNum < 0
    ) {
      nextErrors.stock = 'Tồn kho là số nguyên không âm';
    }

    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        status: formData.status,
      });
      onClose();
    } catch (err) {
      const serverErr = err.response?.data;
      if (serverErr?.field && serverErr?.message) {
        setErrors((prev) => ({
          ...prev,
          [serverErr.field]: serverErr.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: serverErr?.message || 'Có lỗi xảy ra, vui lòng thử lại',
        }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="form-error-alert">{errors.general}</div>
          )}

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
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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

          <div className="form-row">
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

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Huỷ
            </button>
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
