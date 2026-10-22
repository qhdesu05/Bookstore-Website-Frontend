import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import NotPermitted from "./NotPermitted";

const ProtectedRoute = (props) => {
  const { children, role } = props;
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const user = useSelector((state) => state.account.user);

  // 1. Chưa đăng nhập → sang trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Trang yêu cầu một role cụ thể mà user không có → 403
  if (role && user.role !== role) {
    return <NotPermitted />;
  }

  // 3. Hợp lệ → cho xem trang
  return <>{children}</>;
};

export default ProtectedRoute;
