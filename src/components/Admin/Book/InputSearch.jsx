import { Button, Col, Form, Input, Row, theme } from "antd";

const SEARCH_FIELDS = ["mainText", "author", "category"];

const InputSearch = (props) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const formStyle = {
    maxWidth: "none",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const onFinish = (values) => {
    const parts = [];

    SEARCH_FIELDS.forEach((field) => {
      const value = values[field]?.trim();
      if (value) {
        parts.push(`${field}=/${encodeURIComponent(value)}/i`);
      }
    });

    props.handleSearch(parts.join("&"));
  };

  const handleClear = () => {
    form.resetFields();
    props.handleSearch("");
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
      onFinish={onFinish}
    >
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item labelCol={{ span: 24 }} name="mainText" label="Tên sách">
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item labelCol={{ span: 24 }} name="author" label="Tác giả">
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item labelCol={{ span: 24 }} name="category" label="Thể loại">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={24} style={{ textAlign: "right" }}>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button style={{ margin: "0 8px" }} onClick={handleClear}>
            Clear
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default InputSearch;
