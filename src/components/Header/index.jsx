import { Avatar, Dropdown, Space, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { callLogout } from "../../services/api";
import { doLogoutAction } from "../../redux/account/accountSlice";

const Header = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const user = useSelector((state) => state.account.user);

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.data) {
      localStorage.removeItem("access_token");
      dispatch(doLogoutAction());
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };
  const items = [
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
