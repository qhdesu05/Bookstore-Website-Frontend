import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Layout, Menu, Space, message } from "antd";
import {
  AppstoreOutlined,
  DollarCircleOutlined,
  ExceptionOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { callLogout } from "../../services/api";
import { doLogoutAction } from "../../redux/account/accountSlice";
import { doClearCartAction } from "../../redux/order/orderSlice";
import "./layout.scss";
import ManageAccount from "../Account/ManageAccount";

const { Content, Sider } = Layout;

// key của mỗi mục = đường dẫn của nó
const menuItems = [
  {
    key: "/admin",
    icon: <AppstoreOutlined />,
    label: <Link to="/admin">Dashboard</Link>,
  },
  {
    key: "/admin/user",
    icon: <UserOutlined />,
    label: <Link to="/admin/user">Manage Users</Link>,
  },
  {
    key: "/admin/book",
    icon: <ExceptionOutlined />,
    label: <Link to="/admin/book">Manage Books</Link>,
  },
  {
    key: "/admin/order",
    icon: <DollarCircleOutlined />,
    label: <Link to="/admin/order">Manage Orders</Link>,
  },
];

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.account.user);
  const [showManageAccount, setShowManageAccount] = useState(false);
  // Bỏ dấu "/" cuối nếu có: "/admin/" → "/admin"
  const selectedKey = location.pathname.replace(/\/$/, "") || "/admin";

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

  const itemsDropdown = [
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
    {
      label: <Link to="/">Trang chủ</Link>,
      key: "home",
    },
    {
      label: (
        <span style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </span>
      ),
      key: "logout",
    },
  ];

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`;

  return (
    <>
      {" "}
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          trigger={null}
          breakpoint="md"
          collapsedWidth={0}
          onBreakpoint={(broken) => setCollapsed(broken)}
        >
          <div style={{ height: 32, margin: 16, textAlign: "center" }}>
            Admin
          </div>
          <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
        </Sider>

        <Layout>
          <div className="admin-header">
            <span
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>

            <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={urlAvatar} />
                {user?.fullName}
              </Space>
            </Dropdown>
          </div>

          <Content style={{ padding: 15 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <ManageAccount
        isModalOpen={showManageAccount}
        setIsModalOpen={setShowManageAccount}
      />
    </>
  );
};

export default LayoutAdmin;
