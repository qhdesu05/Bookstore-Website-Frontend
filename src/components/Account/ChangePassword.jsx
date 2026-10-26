import { useState } from "react";
import { Button, Col, Form, Input, Row, message, notification } from "antd";
import { useSelector } from "react-redux";
import { callUpdatePassword } from "../../services/api";
import { getErrorMessage } from "../../utils/helper";

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const user = useSelector((state) => state.account.user);

  const onFinish = async (values) => {
    const { email, oldpass, newpass } = values;
    setIsSubmit(true);

    const res = await callUpdatePassword(email, oldpass, newpass);
    if (res && res.data) {
      message.success("Cập nhật mật khẩu thành công");
      form.resetFields(["oldpass", "newpass", "confirm"]);
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: getErrorMessage(res),
      });
    }
    setIsSubmit(false);
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Row>
        <Col span={1}></Col>
        <Col span={12}>
          <Form
            form={form}
            name="change-password"
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{ email: user?.email }}
          >
            <Form.Item labelCol={{ span: 24 }} label="Email" name="email">
              <Input disabled />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Mật khẩu hiện tại"
              name="oldpass"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Mật khẩu mới"
              name="newpass"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Nhập lại mật khẩu mới"
              name="confirm"
              dependencies={["newpass"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newpass") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu nhập lại không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isSubmit}>
              Xác nhận
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ChangePassword;
