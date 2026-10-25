// Định dạng số thành tiền VND: 50000 → "50.000 ₫"
export const formatVND = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);
};

// Đổi tên sách thành đường dẫn:
export const convertSlug = (str = "") => {
  return str
    .normalize("NFD") // tách dấu ra khỏi chữ: "á" → "a" + dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa các dấu vừa tách
    .replace(/đ/g, "d") // "đ" không tách được nên đổi riêng
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự đặc biệt
    .replace(/\s+/g, "-") // khoảng trắng → dấu gạch ngang
    .replace(/-+/g, "-"); // gộp nhiều gạch liền nhau
};
// Backend đôi khi trả message là mảng, đôi khi là chuỗi. Hàm này luôn trả ra một chuỗi.
export const getErrorMessage = (res) => {
  const msg = res?.message;
  return Array.isArray(msg) ? msg[0] : msg;
};
// Đọc một file ảnh thành chuỗi base64 để hiện xem trước
export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
};
