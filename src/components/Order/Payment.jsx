import { useState } from "react";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  message,
  notification,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { doClearCartAction } from "../../redux/order/orderSlice";
import { callPlaceOrder } from "../../services/api";
import { formatVND } from "../../utils/helper";

const { TextArea } = Input;

const Payment = (props) => {
  const carts = useSelector((state) => state.order.carts);
  const user = useSelector((state) => state.account.user);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);

  const totalPrice = carts.reduce(
    (sum, item) => sum + item.quantity * item.detail.price,
    0,
  );

  const onFinish = async (values) => {
    setIsSubmit(true);

    const data = {
      name: values.name,
      address: values.address,
      phone: values.phone,
      totalPrice: totalPrice,
      detail: carts.map((item) => ({
        bookName: item.detail.mainText,
        quantity: item.quantity,
        _id: item._id,
      })),
    };

    const res = await callPlaceOrder(data);
    if (res && res.data) {
      message.success("Đặt hàng thành công !");
      dispatch(doClearCartAction());
      props.setCurrentStep(2);
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsSubmit(false);
  };

  return (
    <Row gutter={[20, 20]}>
      <Col md={16} xs={24}>
        <Button
          style={{ marginBottom: 15 }}
          onClick={() => props.setCurrentStep(0)}
        >
          ← Quay lại giỏ hàng
        </Button>

        {carts.map((book) => (
          <div className="order-book" key={book._id}>
            <div className="book-content">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book.detail.thumbnail}`}
                alt="thumbnail"
              />
              <div className="title">{book.detail.mainText}</div>
              <div className="price">{formatVND(book.detail.price)}</div>
            </div>
            <div className="action">
              <div className="quantity">Số lượng: {book.quantity}</div>
              <div className="sum">
                Tổng: {formatVND(book.detail.price * book.quantity)}
              </div>
            </div>
          </div>
        ))}
      </Col>

      <Col md={8} xs={24}>
        <div className="order-sum">
          <Form onFinish={onFinish} form={form}>
            <Form.Item
              style={{ margin: 0 }}
              labelCol={{ span: 24 }}
              label="Tên người nhận"
              name="name"
              initialValue={user?.fullName}
              rules={[
                {
                  required: true,
                  message: "Tên người nhận không được để trống!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              style={{ margin: 0 }}
              labelCol={{ span: 24 }}
              label="Số điện thoại"
              name="phone"
              initialValue={user?.phone}
              rules={[
                {
                  required: true,
                  message: "Số điện thoại không được để trống!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              style={{ margin: 0 }}
              labelCol={{ span: 24 }}
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: "Địa chỉ không được để trống!" },
              ]}
            >
              <TextArea autoFocus rows={4} />
            </Form.Item>
          </Form>

          <div className="info">
            <div className="method">
              <div>Hình thức thanh toán</div>
              <Radio checked>Thanh toán khi nhận hàng</Radio>
            </div>
          </div>

          <Divider style={{ margin: "5px 0" }} />
          <div className="calculate">
            <span>Tổng tiền</span>
            <span className="sum-final">{formatVND(totalPrice)}</span>
          </div>
          <Divider style={{ margin: "5px 0" }} />

          <button
            onClick={() => form.submit()}
            disabled={isSubmit || carts.length === 0}
          >
            {isSubmit && (
              <span>
                <LoadingOutlined /> &nbsp;
              </span>
            )}
            Đặt Hàng ({carts.length})
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default Payment;
