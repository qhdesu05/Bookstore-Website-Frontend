import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Empty,
  Form,
  InputNumber,
  Pagination,
  Rate,
  Row,
  Spin,
  Tabs,
} from "antd";
import { FilterTwoTone, ReloadOutlined } from "@ant-design/icons";
import { callFetchCategory, callFetchListBook } from "../../services/api";
import { convertSlug, formatVND } from "../../utils/helper";
import "./home.scss";

const sortItems = [
  { key: "sort=-sold", label: "Phổ biến" },
  { key: "sort=-updatedAt", label: "Hàng mới" },
  { key: "sort=price", label: "Giá thấp đến cao" },
  { key: "sort=-price", label: "Giá cao đến thấp" },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useOutletContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [listCategory, setListCategory] = useState([]);
  const [listBook, setListBook] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortQuery, setSortQuery] = useState("sort=-sold");
  const [filter, setFilter] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // Lấy danh mục (1 lần)
  useEffect(() => {
    const fetchCategory = async () => {
      const res = await callFetchCategory();
      if (res && res.data) {
        setListCategory(res.data);
      }
    };
    fetchCategory();
  }, []);

  // Debounce ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setCurrent(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Lấy sách mỗi khi một trong các state bên dưới đổi
  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);

      let query = `current=${current}&pageSize=${pageSize}&${sortQuery}`;
      if (filter) {
        query += `&${filter}`;
      }
      if (debouncedTerm) {
        query += `&mainText=/${encodeURIComponent(debouncedTerm)}/i`;
      }

      const res = await callFetchListBook(query);
      if (res && res.data) {
        setListBook(res.data.result);
        setTotal(res.data.meta.total);
      }
      setIsLoading(false);
    };
    fetchBook();
  }, [current, pageSize, sortQuery, filter, debouncedTerm]);

  const applyFilter = (values) => {
    const parts = [];

    if (values.category?.length) {
      parts.push(`category=${values.category.join(",")}`);
    }
    if (values.range?.from != null) {
      parts.push(`price>=${values.range.from}`);
    }
    if (values.range?.to != null) {
      parts.push(`price<=${values.range.to}`);
    }

    setFilter(parts.join("&"));
    setCurrent(1);
  };

  const handleReset = () => {
    form.resetFields();
    setFilter("");
    setSearchTerm("");
    setSortQuery("sort=-sold");
    setCurrent(1);
  };

  const handleRedirectBook = (book) => {
    const slug = convertSlug(book.mainText);
    navigate(`/book/${slug}?id=${book._id}`);
  };

  return (
    <div style={{ background: "#efefef", padding: "20px 0" }}>
      <div
        className="homepage-container"
        style={{ maxWidth: 1440, margin: "0 auto" }}
      >
        <Row gutter={[20, 20]}>
          {/* ===== CỘT TRÁI: BỘ LỌC ===== */}
          <Col md={4} sm={0} xs={0}>
            <div style={{ padding: 20, background: "#fff", borderRadius: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <FilterTwoTone />
                  <span style={{ fontWeight: 500 }}> Bộ lọc tìm kiếm</span>
                </span>
                <ReloadOutlined
                  title="Reset"
                  style={{ cursor: "pointer" }}
                  onClick={handleReset}
                />
              </div>
              <Divider />

              <Form
                form={form}
                onFinish={applyFilter}
                onValuesChange={(changedValues, values) => {
                  if (changedValues.category) {
                    applyFilter(values);
                  }
                }}
              >
                <Form.Item
                  name="category"
                  label="Danh mục sản phẩm"
                  labelCol={{ span: 24 }}
                >
                  <Checkbox.Group>
                    <Row>
                      {listCategory.map((item) => (
                        <Col span={24} key={item} style={{ padding: "7px 0" }}>
                          <Checkbox value={item}>{item}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Divider />

                <Form.Item label="Khoảng giá" labelCol={{ span: 24 }}>
                  <Row gutter={[10, 10]} style={{ width: "100%" }}>
                    <Col xl={11} md={24}>
                      <Form.Item name={["range", "from"]}>
                        <InputNumber
                          min={0}
                          placeholder="đ TỪ"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/,/g, "")}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={2} md={0}>
                      <div> - </div>
                    </Col>
                    <Col xl={11} md={24}>
                      <Form.Item name={["range", "to"]}>
                        <InputNumber
                          min={0}
                          placeholder="đ ĐẾN"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/,/g, "")}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    onClick={() => form.submit()}
                    style={{ width: "100%" }}
                    type="primary"
                  >
                    Áp dụng
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>

          {/* ===== CỘT PHẢI: DANH SÁCH SÁCH ===== */}
          <Col md={20} xs={24}>
            <Spin spinning={isLoading} tip="Loading...">
              <div style={{ padding: 20, background: "#fff", borderRadius: 5 }}>
                <Tabs
                  activeKey={sortQuery}
                  items={sortItems}
                  onChange={(key) => {
                    setSortQuery(key);
                    setCurrent(1);
                  }}
                  style={{ overflowX: "auto" }}
                />

                <Row className="customize-row">
                  {listBook.map((item) => (
                    <div
                      className="column"
                      key={item._id}
                      onClick={() => handleRedirectBook(item)}
                    >
                      <div className="wrapper">
                        <div className="thumbnail">
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${item.thumbnail}`}
                            alt="thumbnail book"
                          />
                        </div>
                        <div className="text" title={item.mainText}>
                          {item.mainText}
                        </div>
                        <div className="price">{formatVND(item.price)}</div>
                        <div className="rating">
                          <Rate
                            value={5}
                            disabled
                            style={{ color: "#ffce3d", fontSize: 10 }}
                          />
                          <span>Đã bán {item.sold}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {listBook.length === 0 && !isLoading && (
                    <div style={{ width: "100%", margin: "0 auto" }}>
                      <Empty description="Không có dữ liệu" />
                    </div>
                  )}
                </Row>

                <Row
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 30,
                  }}
                >
                  <Pagination
                    current={current}
                    total={total}
                    pageSize={pageSize}
                    responsive
                    onChange={(page, size) => {
                      setCurrent(page);
                      setPageSize(size);
                    }}
                  />
                </Row>
              </div>
            </Spin>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
