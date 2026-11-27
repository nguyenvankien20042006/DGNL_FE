// Custom hook useProductSearch đã được sửa lỗi (Mục 4.3.4 c)
// Đã khắc phục lỗi Race Condition bằng AbortController và tích hợp cơ chế Debounce khi tìm kiếm
import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function useProductSearch(params = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Debounce giá trị từ khóa q (300ms) để không bắn request dồn dập khi người dùng gõ
  const [debouncedQuery, setDebouncedQuery] = useState(params.q || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(params.q || '');
    }, 300);

    return () => clearTimeout(timer);
  }, [params.q]);

  useEffect(() => {
    // Khởi tạo AbortController để huỷ bỏ request cũ nếu params thay đổi trước khi request cũ hoàn tất
    const controller = new AbortController();
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Chuẩn hóa và làm sạch tham số trước khi gửi API
      const requestParams = {
        ...params,
        q: debouncedQuery.trim(),
      };

      if (!requestParams.q) delete requestParams.q;
      if (!requestParams.category) delete requestParams.category;
      if (!requestParams.status) delete requestParams.status;
      
      const pageNum = Number(requestParams.page);
      requestParams.page = !Number.isInteger(pageNum) || pageNum < 1 ? 1 : pageNum;

      const limitNum = Number(requestParams.limit);
      requestParams.limit = !Number.isInteger(limitNum) || limitNum < 1 ? 10 : limitNum;

      try {
        const res = await api.get('/products', {
          params: requestParams,
          signal: controller.signal,
        });

        // Chỉ cập nhật state nếu request hiện tại chưa bị huỷ bỏ (khắc phục hoàn toàn Race Condition)
        if (!isCancelled) {
          const list = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
          const totalCount = res.data?.total ?? list.length;
          setData(list);
          setTotal(totalCount);
        }
      } catch (err) {
        // Bỏ qua lỗi nếu request bị abort có chủ đích
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || isCancelled) {
          return;
        }
        setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu sản phẩm.');
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [debouncedQuery, params.category, params.status, params.page, params.limit, reloadTrigger]);

  const refetch = () => setReloadTrigger((prev) => prev + 1);

  return {
    data,
    total,
    loading,
    error,
    refetch,
    setData,
    setTotal,
  };
}
