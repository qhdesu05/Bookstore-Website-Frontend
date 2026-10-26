import { useEffect, useState } from "react";
import {
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Upload,
  message,
  notification,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import {
  callCreateBook,
  callFetchCategory,
  callUpdateBook,
  callUploadBookImg,
} from "../../../services/api";
import { getBase64, getErrorMessage } from "../../../utils/helper";

const BOOK_IMAGE_URL = `${import.meta.env.VITE_BACKEND_URL}/images/book/`;

// Tên file trên server → một mục trong danh sách ảnh của Upload
const toFileItem = (name) => ({
  uid: uuidv4(),
  name,
  status: "done",
  url: BOOK_IMAGE_URL + name,
});

// Lấy lại tên file trên server từ một mục của Upload:
// ảnh vừa upload thì tên nằm ở "response", ảnh có sẵn thì nằm ở "name"
const getServerName = (file) => file.response || file.name;

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

const BookModal = (props) => {
  const { openModal, setOpenModal, dataUpdate, setDataUpdate, fetchBook } =
    props;
  const isUpdate = !!dataUpdate;

  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const [listCategory, setListCategory] = useState([]);

  const [thumbnailList, setThumbnailList] = useState([]);
  const [sliderList, setSliderList] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Lấy danh sách thể loại (1 lần)
  useEffect(() => {
    const fetchCategory = async () => {
      const res = await callFetchCategory();
      if (res && res.data) {
        setListCategory(res.data.map((item) => ({ label: item, value: item })));
      }
    };
    fetchCategory();
  }, []);

  // Mỗi lần mở modal: đổ dữ liệu sách đang sửa, hoặc làm sạch form nếu là thêm mới
  useEffect(() => {
    if (!openModal) return;

    if (dataUpdate) {
      form.setFieldsValue({
        mainText: dataUpdate.mainText,
        author: dataUpdate.author,
        price: dataUpdate.price,
        category: dataUpdate.category,
        quantity: dataUpdate.quantity,
        sold: dataUpdate.sold,
      });
      setThumbnailList(
        dataUpdate.thumbnail ? [toFileItem(dataUpdate.thumbnail)] : [],
      );
      setSliderList((dataUpdate.slider ?? []).map(toFileItem));
    } else {
      form.resetFields();
      setThumbnailList([]);
      setSliderList([]);
    }
  }, [openModal, dataUpdate]);

  const handleClose = () => {
    setOpenModal(false);
    setDataUpdate(null);
  };

  // Upload một file lên server, báo kết quả cho antd
  const handleUpload = async ({ file, onSuccess, onError }) => {
    const res = await callUploadBookImg(file);
    if (res && res.data) {
      onSuccess(res.data.fileUploaded); // tên file trên server, sẽ nằm ở file.response
    } else {
      onError(new Error("Đã có lỗi khi upload file"));
    }
  };

  // Kiểm tra file trước khi upload
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

  const handlePreview = async (file) => {
    const src = file.url || (await getBase64(file.originFileObj));
    setPreviewImage(src);
    setPreviewTitle(file.name);
    setPreviewOpen(true);
  };

  const onFinish = async (values) => {
    const allFiles = [...thumbnailList, ...sliderList];

    if (allFiles.some((file) => file.status === "uploading")) {
      notification.warning({
        message: "Vui lòng chờ",
        description: "Ảnh đang được tải lên",
      });
      return;
    }

    const thumbnail = thumbnailList
      .filter((f) => f.status === "done")
      .map(getServerName);
    const slider = sliderList
      .filter((f) => f.status === "done")
      .map(getServerName);

    if (thumbnail.length === 0) {
      notification.error({
        message: "Lỗi validate",
        description: "Vui lòng upload ảnh thumbnail",
      });
      return;
    }
    if (slider.length === 0) {
      notification.error({
        message: "Lỗi validate",
        description: "Vui lòng upload ảnh slider",
      });
      return;
    }

    const { mainText, author, price, sold, quantity, category } = values;

    setIsSubmit(true);
    const res = isUpdate
      ? await callUpdateBook(
          dataUpdate._id,
          thumbnail[0],
          slider,
          mainText,
          author,
          price,
          sold,
          quantity,
          category,
        )
      : await callCreateBook(
          thumbnail[0],
          slider,
          mainText,
          author,
          price,
          sold,
          quantity,
          category,
        );

    if (res && res.data) {
      message.success(
        isUpdate ? "Cập nhật book thành công" : "Tạo mới book thành công",
      );
      handleClose();
      await fetchBook();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: getErrorMessage(res),
      });
    }
    setIsSubmit(false);
  };

  return (
    <>
      <Modal
        title={isUpdate ? "Cập nhật book" : "Thêm mới book"}
        open={openModal}
        onOk={() => form.submit()}
        onCancel={handleClose}
        okText={isUpdate ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        confirmLoading={isSubmit}
        width={800}
        maskClosable={false}
        forceRender
      >
        <Divider />

        <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
          <Row gutter={15}>
            <Col xs={24} md={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Tên sách"
                name="mainText"
                rules={[{ required: true, message: "Vui lòng nhập tên sách!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Tác giả"
                name="author"
                rules={[{ required: true, message: "Vui lòng nhập tác giả!" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={12} md={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Giá tiền"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá tiền!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/,/g, "")}
                  addonAfter="VND"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Thể loại"
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn thể loại!" }]}
              >
                <Select showSearch allowClear options={listCategory} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Đã bán"
                name="sold"
                initialValue={0}
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng đã bán!" },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item labelCol={{ span: 24 }} label="Ảnh Thumbnail">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  fileList={thumbnailList}
                  customRequest={handleUpload}
                  beforeUpload={beforeUpload}
                  onChange={({ fileList }) => setThumbnailList(fileList)}
                  onPreview={handlePreview}
                >
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item labelCol={{ span: 24 }} label="Ảnh Slider">
                <Upload
                  multiple
                  listType="picture-card"
                  fileList={sliderList}
                  customRequest={handleUpload}
                  beforeUpload={beforeUpload}
                  onChange={({ fileList }) => setSliderList(fileList)}
                  onPreview={handlePreview}
                >
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default BookModal;
