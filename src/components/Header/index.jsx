import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Empty,
  Menu,
  Popover,
  Space,
  message,
} from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ManageAccount from "../Account/ManageAccount";
import { callLogout } from "../../services/api";
import { doLogoutAction } from "../../redux/account/accountSlice";
import { doClearCartAction } from "../../redux/order/orderSlice";
import { formatVND } from "../../utils/helper";
import "./header.scss";

const Header = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const user = useSelector((state) => state.account.user);
  const carts = useSelector((state) => state.order.carts);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [showManageAccount, setShowManageAccount] = useState(false);

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

  // Các mục của người đã đăng nhập: dùng cho cả Dropdown (máy tính) lẫn Drawer (điện thoại)
  const items = [
    {
      label: (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => setShowManageAccount(true)}
        >
          Quản lý tài khoản
        </span>
      ),
      key: "account",
    },
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

  // Người chưa đăng nhập thì trong Drawer chỉ có đăng nhập / đăng ký
  const drawerItems = isAuthenticated
    ? items
    : [
        { label: <Link to="/login">Đăng nhập</Link>, key: "login" },
        { label: <Link to="/register">Đăng ký</Link>, key: "register" },
      ];

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
    <>
      <div className="header-container">
        <header className="page-header">
          <MenuOutlined
            className="toggle"
            onClick={() => setOpenDrawer(true)}
          />

          <span className="logo" onClick={() => navigate("/")}>
            My Shop
          </span>

          <input
            className="input-search"
            placeholder="Bạn tìm gì hôm nay"
            value={props.searchTerm}
            onChange={(e) => props.setSearchTerm(e.target.value)}
          />

          <Popover
            placement="bottomRight"
            title="Sản phẩm mới thêm"
            content={contentPopover}
          >
            <Badge className="cart" count={carts.length} size="small" showZero>
              <FiShoppingCart
                className="icon-cart"
                onClick={() => navigate("/order")}
              />
            </Badge>
          </Popover>

          <div className="account">
            {!isAuthenticated ? (
              <span onClick={() => navigate("/login")}>Tài Khoản</span>
            ) : (
              <Dropdown menu={{ items }} trigger={["click"]}>
                <Space>
                  <Avatar src={urlAvatar} />
                  {user?.fullName}
                </Space>
              </Dropdown>
            )}
          </div>
        </header>
      </div>

      <Drawer
        title="Menu chức năng"
        placement="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        {isAuthenticated && (
          <Space style={{ marginBottom: 16 }}>
            <Avatar src={urlAvatar} />
            {user?.fullName}
          </Space>
        )}
        <Menu
          mode="inline"
          selectable={false}
          items={drawerItems}
          onClick={() => setOpenDrawer(false)}
        />
      </Drawer>

      <ManageAccount
        isModalOpen={showManageAccount}
        setIsModalOpen={setShowManageAccount}
      />
    </>
  );
};

export default Header;
