import { useEffect, useRef, useState } from "react";
import { Col, Image, Modal, Row } from "antd";
import ImageGallery from "react-image-gallery";
import "./book.scss";

const ModalGallery = (props) => {
  const { isOpen, setIsOpen, currentIndex, items, title } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const refGallery = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex);
      refGallery.current?.slideToIndex(currentIndex);
    }
  }, [isOpen, currentIndex]);

  return (
    <Modal
      width={"60vw"}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      closable={false}
      className="modal-gallery"
    >
      <Row gutter={[20, 20]}>
        <Col span={16}>
          <ImageGallery
            ref={refGallery}
            items={items}
            showPlayButton={false}
            showFullscreenButton={false}
            startIndex={currentIndex}
            showThumbnails={false}
            onSlide={(index) => setActiveIndex(index)}
            slideDuration={0}
          />
        </Col>

        <Col span={8}>
          <div style={{ padding: "5px 0 20px 0" }}>{title}</div>
          <Row gutter={[20, 20]}>
            {items?.map((item, index) => (
              <Col key={`image-${index}`}>
                <Image
                  wrapperClassName="img-normal"
                  width={100}
                  height={100}
                  src={item.original}
                  preview={false}
                  onClick={() => refGallery.current?.slideToIndex(index)}
                />
                <div className={activeIndex === index ? "active" : ""}></div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalGallery;
