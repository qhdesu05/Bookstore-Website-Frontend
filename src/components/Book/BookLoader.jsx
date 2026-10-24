import { Col, Row, Skeleton } from "antd";

const BookLoader = () => {
  return (
    <Row gutter={[20, 20]}>
      <Col md={10} sm={24} xs={24}>
        <Skeleton.Input
          active={true}
          block={true}
          style={{ width: "100%", height: 350 }}
        />
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 20,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <Skeleton.Image active={true} />
          <Skeleton.Image active={true} />
          <Skeleton.Image active={true} />
        </div>
      </Col>

      <Col md={14} sm={24} xs={24}>
        <Skeleton paragraph={{ rows: 3 }} active={true} />
        <br /> <br />
        <Skeleton paragraph={{ rows: 2 }} active={true} />
        <br /> <br />
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <Skeleton.Button active={true} style={{ width: 100 }} />
          <Skeleton.Button active={true} style={{ width: 100 }} />
        </div>
      </Col>
    </Row>
  );
};

export default BookLoader;
