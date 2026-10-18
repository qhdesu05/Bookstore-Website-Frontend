import axios from "axios";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Chạy TRƯỚC khi mỗi request được gửi đi
// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = window.localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Chạy SAU khi nhận được phản hồi
// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // Thành công (status 2xx): chỉ lấy phần body
    return response && response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // Server có trả lời nhưng lỗi (400, 401, 404, 500...)
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // Không kết nối được server (tắt backend, mất mạng, lỗi CORS...)
    return {
      statusCode: 0,
      message: "Không kết nối được tới server",
      data: null,
    };
  },
);

export default instance;
