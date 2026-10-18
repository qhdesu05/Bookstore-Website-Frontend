import { useNavigate } from "react-router-dom";

const Header = (props) => {
  const navigate = useNavigate();

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
    </header>
  );
};

export default Header;
