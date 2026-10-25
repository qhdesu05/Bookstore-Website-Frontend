import { Badge, Descriptions, Divider, Drawer, Image, Space } from "antd";
import moment from "moment";
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { formatVND } from "../../../utils/helper";

const BookViewDetail = (props) => {
  const {
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
    setDataViewDetail,
  } = props;

  const onClose = () => {
    setOpenViewDetail(false);
    setDataViewDetail(null);
  };

  // Gom thumbnail + slider thành một danh sách tên file (bỏ giá trị rỗng)
  const imageNames = [
    dataViewDetail?.thumbnail,
    ...(dataViewDetail?.slider ?? []),
  ].filter(Boolean);

  return (
    <Drawer
      title="Chức năng xem chi tiết"
      width="50vw"
      onClose={onClose}
      open={openViewDetail}
    >
      <Descriptions title="Thông tin Book" bordered column={2}>
        <Descriptions.Item label="Id">{dataViewDetail?._id}</Descriptions.Item>
        <Descriptions.Item label="Tên sách">
          {dataViewDetail?.mainText}
        </Descriptions.Item>
        <Descriptions.Item label="Tác giả">
          {dataViewDetail?.author}
        </Descriptions.Item>
        <Descriptions.Item label="Giá tiền">
          {formatVND(dataViewDetail?.price)}
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng">
          {dataViewDetail?.quantity ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="Đã bán">
          {dataViewDetail?.sold ?? 0}
        </Descriptions.Item>

        <Descriptions.Item label="Thể loại" span={2}>
          <Badge status="processing" text={dataViewDetail?.category} />
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {moment(dataViewDetail?.createdAt).format(FORMAT_DATE_DISPLAY)}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {moment(dataViewDetail?.updatedAt).format(FORMAT_DATE_DISPLAY)}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Ảnh Books</Divider>

      <Image.PreviewGroup>
        <Space wrap>
          {imageNames.map((name) => (
            <Image
              key={name}
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${name}`}
            />
          ))}
        </Space>
      </Image.PreviewGroup>
    </Drawer>
  );
};

export default BookViewDetail;
