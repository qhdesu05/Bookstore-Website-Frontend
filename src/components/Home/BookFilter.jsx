import { Button, Checkbox, Col, Divider, Form, InputNumber, Row } from "antd";

const formatNumber = (value) =>
  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const parseNumber = (value) => value.replace(/,/g, "");

const BookFilter = (props) => {
  const { listCategory, onFilter, onSubmitted } = props;
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onFilter(values);
    onSubmitted?.(); // nếu có truyền hàm này thì gọi (dùng để đóng ngăn kéo)
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      onValuesChange={(changedValues, values) => {
        if (changedValues.category) {
          onFilter(values);
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
          <Col xl={11} md={24} xs={11}>
            <Form.Item name={["range", "from"]}>
              <InputNumber
                min={0}
                placeholder="đ TỪ"
                formatter={formatNumber}
                parser={parseNumber}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xl={2} md={0} xs={2}>
            <div> - </div>
          </Col>
          <Col xl={11} md={24} xs={11}>
            <Form.Item name={["range", "to"]}>
              <InputNumber
                min={0}
                placeholder="đ ĐẾN"
                formatter={formatNumber}
                parser={parseNumber}
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
  );
};

export default BookFilter;
