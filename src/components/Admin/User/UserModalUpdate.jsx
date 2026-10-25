import { useEffect, useState } from "react";
import { Divider, Form, Input, Modal, message, notification } from "antd";
import { callUpdateUser } from "../../../services/api";
import { getErrorMessage } from "../../../utils/helper";

const UserModalUpdate = (props) => {
  const {
    openModalUpdate,
    setOpenModalUpdate,
    dataUpdate,
    setDataUpdate,
    fetchUser,
  } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm();

  // Mỗi khi chọn một user để sửa, đổ dữ liệu của user đó vào form
  useEffect(() => {
    if (dataUpdate) {
      form.setFieldsValue(dataUpdate);
    }
  }, [dataUpdate]);

  const handleClose = () => {
    setOpenModalUpdate(false);
    setDataUpdate(null);
  };

  const onFinish = async (values) => {
    const { _id, fullName, phone } = values;
    setIsSubmit(true);

    const res = await callUpdateUser(_id, fullName, phone);
    if (res && res.data) {
      message.success("Cập nhật user thành công");
      handleClose();
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
      title="Cập nhật người dùng"
      open={openModalUpdate}
      onOk={() => form.submit()}
      onCancel={handleClose}
      okText="Cập nhật"
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
        <Form.Item hidden name="_id">
          <Input />
        </Form.Item>

        <Form.Item
          labelCol={{ span: 24 }}
          label="Tên hiển thị"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập tên hiển thị!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item labelCol={{ span: 24 }} label="Email" name="email">
          <Input disabled />
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

export default UserModalUpdate;
