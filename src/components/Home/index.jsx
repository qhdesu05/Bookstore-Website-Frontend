import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { callFetchCategory } from "../../services/api";

const Home = () => {
  const [searchTerm, setSearchTerm] = useOutletContext();
  const [listCategory, setListCategory] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      const res = await callFetchCategory();
      console.log("res", res);
      if (res && res.data) {
        setListCategory(res.data);
      }
    };
    fetchCategory();
  }, []);

  return (
    <div style={{ padding: 20, minHeight: 400 }}>
      <h2>Trang chủ</h2>
      <p>Từ khóa đang tìm: {searchTerm}</p>
      <h3>Danh mục sách:</h3>
      <ul>
        {listCategory.map((item, index) => (
          <li key={`category-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
