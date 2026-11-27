// ==============================================================================
// CUSTOM HOOK TÌM KIẾM, LỌC VÀ PHÂN TRANG (src/hooks/useProductSearch.js)
// ==============================================================================
// Mục đích: Hook tùy chỉnh tải danh sách sản phẩm theo từ khoá, danh mục, trạng thái và trang.
// Thuộc các mục đánh giá:
//   - Mục 4.2.1: Gọi API lấy dữ liệu sản phẩm, quản lý loading & error
//   - Mục 4.3.1: Hỗ trợ tìm kiếm từ khóa (q), lọc danh mục (category), lọc trạng thái (status)
//   - Mục 4.3.2: Hỗ trợ phân trang (page, limit)
//   - Mục 4.3.4 (Ý c): Hook đã sửa, khắc phục lỗi Race Condition và Debounce từ hook AI cũ
// ==============================================================================

import { useEffect, useState } from 'react';
// Import axios client cấu hình sẵn baseURL '/api'
import api from '../api/axiosClient.js';

/**
 * Custom hook useProductSearch
 * @param {object} params - Object chứa các tham số: { q, category, status, page, limit }
 * @returns {object} - { data, total, loading, error, refetch, setData, setTotal }
 */
export default function useProductSearch(params = {}) {
  // State lưu danh sách sản phẩm trả về từ server
  const [data, setData] = useState([]);

  // State lưu tổng số lượng sản phẩm thỏa mãn điều kiện lọc (dùng để tính số trang)
  const [total, setTotal] = useState(0);

  // State lưu trạng thái đang tải dữ liệu (true khi đang chờ API phản hồi)
  const [loading, setLoading] = useState(false);

  // State lưu thông báo lỗi nếu gọi API thất bại
  const [error, setError] = useState(null);

  // State đếm số lần kích hoạt reload lại dữ liệu (dùng cho hàm refetch sau khi thêm/sửa/xoá)
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // ============================================================================
  // CƠ CHẾ 1: DEBOUNCE TỪ KHOÁ TÌM KIẾM (Chống gửi request dồn dập khi người dùng gõ)
  // ============================================================================
  // State lưu giá trị từ khoá đã được hoãn lại (debouncedQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(params.q || '');

  useEffect(() => {
    // Mỗi khi người dùng gõ ký tự mới (params.q thay đổi), đặt timer chờ 300ms
    const timer = setTimeout(() => {
      setDebouncedQuery(params.q || '');
    }, 300);

    // Nếu người dùng tiếp tục gõ trước khi hết 300ms, hàm cleanup này sẽ hủy timer trước đó
    return () => clearTimeout(timer);
  }, [params.q]);

  // ============================================================================
  // CƠ CHẾ 2: ABORTCONTROLLER (Khắc phục triệt để lỗi bất đồng bộ Race Condition)
  // ============================================================================
  useEffect(() => {
    // 1. Tạo một đối tượng AbortController cho request hiện tại
    const controller = new AbortController();

    // 2. Cờ đánh dấu xem effect này đã bị hủy (cleanup) hay chưa
    let isCancelled = false;

    // Hàm bất đồng bộ gọi API tải dữ liệu
    async function load() {
      // Bật trạng thái đang tải và xoá lỗi cũ
      setLoading(true);
      setError(null);

      // Chuẩn hóa tham số gửi đi, sử dụng debouncedQuery đã được trim khoảng trắng
      const requestParams = {
        ...params,
        q: debouncedQuery.trim(),
      };

      // Xoá các tham số rỗng để URL query gửi lên server được gọn gàng
      if (!requestParams.q) delete requestParams.q;
      if (!requestParams.category) delete requestParams.category;
      if (!requestParams.status) delete requestParams.status;

      // Xử lý case biên: nếu page không hợp lệ hoặc nhỏ hơn 1 thì mặc định về trang 1
      const pageNum = Number(requestParams.page);
      requestParams.page = !Number.isInteger(pageNum) || pageNum < 1 ? 1 : pageNum;

      // Xử lý case biên: limit mặc định là 10
      const limitNum = Number(requestParams.limit);
      requestParams.limit = !Number.isInteger(limitNum) || limitNum < 1 ? 10 : limitNum;

      try {
        // Gửi GET request đến /api/products, truyền kèm signal của controller
        const res = await api.get('/products', {
          params: requestParams,
          signal: controller.signal, // Cho phép huỷ request nếu params thay đổi
        });

        // QUAN TRỌNG: Chỉ cập nhật state nếu request hiện tại KHÔNG bị huỷ (chống Race Condition)
        if (!isCancelled) {
          const list = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
          const totalCount = res.data?.total ?? list.length;
          setData(list);
          setTotal(totalCount);
        }
      } catch (err) {
        // Nếu lỗi xảy ra do chính chúng ta huỷ request (CanceledError) thì bỏ qua, không báo lỗi
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || isCancelled) {
          return;
        }
        // Gán thông báo lỗi từ server hoặc lỗi mạng vào state error
        setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu sản phẩm.');
      } finally {
        // Tắt trạng thái loading nếu component vẫn còn mounted và request hợp lệ
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    // Thực thi hàm load
    load();

    // CLEANUP FUNCTION: Chạy khi component unmount HOẶC trước khi effect chạy lần tiếp theo
    return () => {
      // Đánh dấu cờ đã huỷ để nếu request cũ trả về sau thì cũng không được gọi setData
      isCancelled = true;
      // Huỷ bỏ kết nối mạng của request đang chạy dở
      controller.abort();
    };
  }, [
    debouncedQuery,      // Chạy lại khi từ khoá debounced thay đổi
    params.category,     // Chạy lại khi thay đổi lọc danh mục
    params.status,       // Chạy lại khi thay đổi lọc trạng thái
    params.page,         // Chạy lại khi chuyển trang
    params.limit,        // Chạy lại khi số lượng trên trang thay đổi
    reloadTrigger,       // Chạy lại khi gọi hàm refetch()
  ]);

  // Hàm tiện ích để component bên ngoài có thể chủ động kích hoạt tải lại dữ liệu (sau khi thêm/sửa/xoá)
  const refetch = () => setReloadTrigger((prev) => prev + 1);

  // Trả về các state và hàm cần thiết cho component tiêu thụ
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
