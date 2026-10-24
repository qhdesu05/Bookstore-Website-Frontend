import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb, Col, Divider, Rate, Row } from "antd";
import { HomeOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { BsCartPlus } from "react-icons/bs";
import ImageGallery from "react-image-gallery";
import BookLoader from "./BookLoader";
import { formatVND } from "../../utils/helper";
import "./book.scss";
import ModalGallery from "./ModalGallery";
const ViewDetail = (props) => {
  const { dataBook } = props;
  const refGallery = useRef(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const images = dataBook?.items ?? [];
  const maxQuantity = dataBook?.quantity ?? 1;

  const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChangeButton = (type) => {
    if (type === "MINUS" && currentQuantity > 1) {
      setCurrentQuantity(currentQuantity - 1);
    }
    if (type === "PLUS" && currentQuantity < maxQuantity) {
      setCurrentQuantity(currentQuantity + 1);
    }
  };

  const handleClickImage = () => {
    setCurrentIndex(refGallery.current?.getCurrentIndex() ?? 0);
    setIsOpenModalGallery(true);
  };

  const handleChangeInput = (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;

    // Ép vào khoảng [1, maxQuantity] và làm tròn xuống số nguyên
    setCurrentQuantity(Math.min(Math.max(Math.floor(value), 1), maxQuantity));
  };

  const handleAddToCart = () => {
    console.log(">>> thêm vào giỏ:", {
      quantity: currentQuantity,
      book: dataBook,
    });
  };

  const handleBuyNow = () => {
    console.log(">>> mua ngay:", { quantity: currentQuantity, book: dataBook });
  };

  return (
    <div style={{ background: "#efefef", padding: "20px 0" }}>
      <div
        className="view-detail-book"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          minHeight: "calc(100vh - 150px)",
        }}
      >
        <Breadcrumb
          style={{ margin: "5px 0" }}
          items={[
            { title: <HomeOutlined /> },
            {
              title: (
                <Link to="/">
                  <span>Trang Chủ</span>
                </Link>
              ),
            },
          ]}
        />

        <div style={{ padding: 20, background: "#fff", borderRadius: 5 }}>
          {dataBook && dataBook._id ? (
            <Row gutter={[20, 20]}>
              {/* ===== CỘT TRÁI: ẢNH ===== */}
              <Col md={10} sm={24} xs={24}>
                <ImageGallery
                  ref={refGallery}
                  items={images}
                  showPlayButton={false}
                  showFullscreenButton={false}
                  renderLeftNav={() => <></>}
                  renderRightNav={() => <></>}
                  slideOnThumbnailOver={true}
                  onClick={handleClickImage}
                />
              </Col>

              {/* ===== CỘT PHẢI: THÔNG TIN ===== */}
              <Col md={14} sm={24} xs={24}>
                <div className="author">
                  Tác giả: <span>{dataBook.author}</span>
                </div>
                <div className="title">{dataBook.mainText}</div>

                <div className="rating">
                  <Rate
                    value={5}
                    disabled
                    style={{ color: "#ffce3d", fontSize: 12 }}
                  />
                  <span className="sold">
                    <Divider type="vertical" />
                    Đã bán {dataBook.sold}
                  </span>
                </div>

                <div className="price">
                  <span className="currency">{formatVND(dataBook.price)}</span>
                </div>

                <div className="delivery">
                  <span className="left-side">Vận chuyển</span>
                  <span className="right-side">Miễn phí vận chuyển</span>
                </div>

                <div className="quantity">
                  <span className="left-side">Số lượng</span>
                  <span className="right-side">
                    <button onClick={() => handleChangeButton("MINUS")}>
                      <MinusOutlined />
                    </button>
                    <input
                      value={currentQuantity}
                      onChange={handleChangeInput}
                    />
                    <button onClick={() => handleChangeButton("PLUS")}>
                      <PlusOutlined />
                    </button>
                  </span>
                  <span style={{ marginLeft: 15, color: "#757575" }}>
                    {maxQuantity} sản phẩm có sẵn
                  </span>
                </div>

                <div className="buy">
                  <button className="cart" onClick={handleAddToCart}>
                    <BsCartPlus className="icon-cart" />
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                  <button className="now" onClick={handleBuyNow}>
                    Mua ngay
                  </button>
                </div>
              </Col>
            </Row>
          ) : (
            <BookLoader />
          )}
        </div>
      </div>
      <ModalGallery
        isOpen={isOpenModalGallery}
        setIsOpen={setIsOpenModalGallery}
        currentIndex={currentIndex}
        items={images}
        title={dataBook?.mainText}
      />
    </div>
  );
};

export default ViewDetail;
