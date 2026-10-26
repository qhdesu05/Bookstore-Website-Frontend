import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const REFRESH_URL = "/api/v1/auth/refresh";
// Các API không bao giờ thử làm mới token (tránh vòng lặp, và lỗi đăng nhập sai mật khẩu cũng là 401)
const SKIP_REFRESH_URLS = [REFRESH_URL, "/api/v1/auth/login"];
// Các trang bắt buộc đăng nhập
const PROTECTED_PATHS = ["/admin", "/order", "/history"];

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// ===== Trước khi gửi: gắn token =====
instance.interceptors.request.use(
  function (config) {
    const token = window.localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Xin token mới. Mutex bảo đảm mỗi lúc chỉ MỘT lượt xin token chạy.
const handleRefreshToken = async (failedToken) => {
  return await mutex.runExclusive(async () => {
    // Trong lúc chờ tới lượt, có thể request khác đã xin xong rồi: dùng luôn token đó
    const currentToken = localStorage.getItem("access_token");
    if (currentToken && currentToken !== failedToken) {
      return currentToken;
    }

    const res = await instance.get(REFRESH_URL);
    if (res && res.data) {
      localStorage.setItem("access_token", res.data.access_token);
      return res.data.access_token;
    }
    return null;
  });
};

// Hết phiên: chỉ đẩy về /login nếu đang ở trang bắt buộc đăng nhập
const redirectToLoginIfNeeded = () => {
  const path = window.location.pathname;
  if (PROTECTED_PATHS.some((p) => path.startsWith(p))) {
    window.location.href = "/login";
  }
};

// ===== Sau khi nhận phản hồi =====
instance.interceptors.response.use(
  function (response) {
    return response && response.data ? response.data : response;
  },
  async function (error) {
    const config = error.config;

    const shouldRefresh =
      config &&
      error.response?.status === 401 &&
      !config._retry &&
      !SKIP_REFRESH_URLS.includes(config.url);

    if (shouldRefresh) {
      const failedToken = config.headers?.Authorization?.replace("Bearer ", "");
      const newToken = await handleRefreshToken(failedToken);

      if (newToken) {
        config._retry = true; // đánh dấu: chỉ thử lại một lần
        return instance.request(config); // gửi lại request ban đầu
      }

      // Xin token mới thất bại: hết phiên đăng nhập
      localStorage.removeItem("access_token");
      redirectToLoginIfNeeded();
    }

    // Server có trả lời lỗi → trả body lỗi; không kết nối được → trả object báo lỗi
    return (
      error.response?.data ?? {
        statusCode: 0,
        message: "Không kết nối được tới server",
        data: null,
      }
    );
  },
);

export default instance;
