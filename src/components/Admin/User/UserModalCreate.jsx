import { useState } from "react";
import { Divider, Form, Input, Modal, message, notification } from "antd";
import { callCreateAUser } from "../../../services/api";
import { getErrorMessage } from "../../../utils/helper";

const UserModalCreate = (props) => {
  const { openModalCreate, setOpenModalCreate, fetchUser } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    setOpenModalCreate(false);
  };

  const onFinish = async (values) => {
    const { fullName, password, email, phone } = values;
    setIsSubmit(true);

    const res = await callCreateAUser(fullName, password, email, phone);
    if (res && res.data) {
      message.success("Tạo mới user thành công");
      form.resetFields();
      setOpenModalCreate(false);
      await fetchUser();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: getErrorMessage(res),
      });
    }
    setIsSubmit(false);
  };

  return (
    <Modal
      title="Thêm mới người dùng"
      open={openModalCreate}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Tạo mới"
      cancelText="Hủy"
      confirmLoading={isSubmit}
      maskClosable={false}
    >
      <Divider />

      <Form
        form={form}
        name="basic"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          labelCol={{ span: 24 }}
          label="Tên hiển thị"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập tên hiển thị!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 24 }}
          label="Password"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 24 }}
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không đúng định dạng!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 24 }}
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModalCreate;
