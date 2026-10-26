import { useState } from "react";
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Row,
  Upload,
  message,
  notification,
} from "antd";
import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  callRefreshToken,
  callUpdateAvatar,
  callUpdateUserInfo,
} from "../../services/api";
import { doUpdateUserInfoAction } from "../../redux/account/accountSlice";
import { getErrorMessage } from "../../utils/helper";

const UserInfo = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.account.user);

  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [isSubmit, setIsSubmit] = useState(false);

  const urlAvatar = avatar
    ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${avatar}`
    : undefined;

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ nhận file JPG/PNG!");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
    const res = await callUpdateAvatar(file);
    if (res && res.data) {
      setAvatar(res.data.fileUploaded);
      onSuccess("ok");
    } else {
      onError(new Error("Đã có lỗi khi upload file"));
    }
  };

  const onFinish = async (values) => {
    const { fullName, phone } = values;
    setIsSubmit(true);

    const res = await callUpdateUserInfo(user.id, phone, fullName, avatar);
    if (res && res.data) {
      dispatch(doUpdateUserInfoAction({ avatar, phone, fullName }));
      message.success("Cập nhật thông tin thành công");

      // Token cũ còn chứa thông tin cũ của user: xin token mới
      const refreshRes = await callRefreshToken();
      if (refreshRes && refreshRes.data) {
        localStorage.setItem("access_token", refreshRes.data.access_token);
      }
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
        <Col sm={24} md={12}>
          <Row gutter={[30, 30]}>
            <Col span={24}>
              <Avatar
                size={{ xs: 80, sm: 100, md: 120, lg: 160, xl: 160, xxl: 200 }}
                icon={<AntDesignOutlined />}
                src={urlAvatar}
                shape="circle"
              />
            </Col>
            <Col span={24}>
              <Upload
                maxCount={1}
                multiple={false}
                showUploadList={false}
                customRequest={handleUploadAvatar}
                beforeUpload={beforeUpload}
              >
                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
              </Upload>
            </Col>
          </Row>
        </Col>

        <Col sm={24} md={12}>
          <Form
            onFinish={onFinish}
            initialValues={{
              email: user?.email,
              fullName: user?.fullName,
              phone: user?.phone,
            }}
          >
            <Form.Item labelCol={{ span: 24 }} label="Email" name="email">
              <Input disabled />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Tên hiển thị"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Tên hiển thị không được để trống!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Số điện thoại không được để trống!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isSubmit}>
              Cập nhật
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default UserInfo;
