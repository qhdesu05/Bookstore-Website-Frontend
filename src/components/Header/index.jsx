import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Empty,
  Popover,
  Space,
  message,
} from "antd";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { callLogout } from "../../services/api";
import { doLogoutAction } from "../../redux/account/accountSlice";
import { doClearCartAction } from "../../redux/order/orderSlice";
import { formatVND } from "../../utils/helper";

const Header = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const user = useSelector((state) => state.account.user);
  const carts = useSelector((state) => state.order.carts);

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.data) {
      localStorage.removeItem("access_token");
      dispatch(doLogoutAction());
      dispatch(doClearCartAction());
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const items = [
    { label: <Link to="/history">Lịch sử mua hàng</Link>, key: "history" },
    {
      label: (
        <span style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </span>
      ),
      key: "logout",
    },
  ];
  if (user?.role === "ADMIN") {
    items.unshift({
      label: <Link to="/admin">Trang quản trị</Link>,
      key: "admin",
    });
  }

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`;

  const contentPopover = (
    <div style={{ width: 320 }}>
      {carts.length > 0 ? (
        <>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {carts.map((book) => (
              <div
                key={book._id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 0",
                }}
              >
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book.detail.thumbnail}`}
                  alt="thumbnail"
                  style={{ width: 40, height: 40, objectFit: "cover" }}
                />
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {book.detail.mainText}
                </div>
                <div style={{ color: "#ee4d2d" }}>
                  {formatVND(book.detail.price)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: 10 }}>
            <Button type="primary" onClick={() => navigate("/order")}>
              Xem giỏ hàng
            </Button>
          </div>
        </>
      ) : (
        <Empty description="Không có sản phẩm trong giỏ hàng" />
      )}
    </div>
  );

  return (
    <header
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <span
        style={{ cursor: "pointer", fontWeight: 700 }}
        onClick={() => navigate("/")}
      >
        My Shop
      </span>

      <input
        placeholder="Bạn tìm gì hôm nay"
        value={props.searchTerm}
        onChange={(e) => props.setSearchTerm(e.target.value)}
        style={{ flex: 1, padding: 8 }}
      />

      <Popover
        placement="bottomRight"
        title="Sản phẩm mới thêm"
        content={contentPopover}
      >
        <Badge count={carts.length} size="small" showZero>
          <FiShoppingCart style={{ fontSize: 22, cursor: "pointer" }} />
        </Badge>
      </Popover>

      {!isAuthenticated ? (
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
          Tài Khoản
        </span>
      ) : (
        <Dropdown menu={{ items }} trigger={["click"]}>
          <Space style={{ cursor: "pointer" }}>
            <Avatar src={urlAvatar} />
            {user?.fullName}
          </Space>
        </Dropdown>
      )}
    </header>
  );
};

export default Header;
