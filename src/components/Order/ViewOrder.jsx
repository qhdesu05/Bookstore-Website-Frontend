import { Col, Divider, Empty, InputNumber, Row } from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  doDeleteItemCartAction,
  doUpdateCartAction,
} from "../../redux/order/orderSlice";
import { formatVND } from "../../utils/helper";

const ViewOrder = (props) => {
  const carts = useSelector((state) => state.order.carts);
  const dispatch = useDispatch();

  const totalPrice = carts.reduce(
    (sum, item) => sum + item.quantity * item.detail.price,
    0,
  );

  const handleChangeQuantity = (value, book) => {
    if (!value || value < 1) return;
    dispatch(doUpdateCartAction({ _id: book._id, quantity: value }));
  };

  return (
    <Row gutter={[20, 20]}>
      <Col md={18} xs={24}>
        {carts.map((book) => {
          const price = book.detail.price;
          return (
            <div className="order-book" key={book._id}>
              <div className="book-content">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book.detail.thumbnail}`}
                  alt="thumbnail"
                />
                <div className="title">{book.detail.mainText}</div>
                <div className="price">{formatVND(price)}</div>
              </div>
              <div className="action">
                <div className="quantity">
                  <InputNumber
                    min={1}
                    max={book.detail.quantity}
                    value={book.quantity}
                    onChange={(value) => handleChangeQuantity(value, book)}
                  />
                </div>
                <div className="sum">
                  Tổng: {formatVND(price * book.quantity)}
                </div>
                <DeleteTwoTone
                  style={{ cursor: "pointer" }}
                  twoToneColor="#eb2f96"
                  onClick={() =>
                    dispatch(doDeleteItemCartAction({ _id: book._id }))
                  }
                />
              </div>
            </div>
          );
        })}

        {carts.length === 0 && (
          <div className="order-book-empty">
            <Empty description="Không có sản phẩm trong giỏ hàng" />
          </div>
        )}
      </Col>

      <Col md={6} xs={24}>
        <div className="order-sum">
          <div className="calculate">
            <span>Tạm tính</span>
            <span>{formatVND(totalPrice)}</span>
          </div>
          <Divider style={{ margin: "10px 0" }} />
          <div className="calculate">
            <span>Tổng tiền</span>
            <span className="sum-final">{formatVND(totalPrice)}</span>
          </div>
          <Divider style={{ margin: "10px 0" }} />
          <button
            disabled={carts.length === 0}
            onClick={() => props.setCurrentStep(1)}
          >
            Mua Hàng ({carts.length})
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default ViewOrder;
