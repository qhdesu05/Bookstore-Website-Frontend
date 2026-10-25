import { useState } from "react";
import { Modal, Table, Upload, message, notification } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { callBulkCreateUser } from "../../../../services/api";
import { getErrorMessage } from "../../../../utils/helper";
import templateFile from "./template.xlsx?url";

const { Dragger } = Upload;

const UserImport = (props) => {
  const { openModalImport, setOpenModalImport, fetchUser } = props;
  const [dataExcel, setDataExcel] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);

  // Ta không upload file lên server, chỉ đọc nó ở trình duyệt.
  // Hàm này giả vờ "upload xong" để antd hiển thị trạng thái thành công.
  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => onSuccess("ok"), 500);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet, {
        header: ["fullName", "email", "phone"],
        range: 1, // bỏ qua dòng tiêu đề
      });
      setDataExcel(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const propsUpload = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept:
      ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    customRequest: dummyRequest,
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        readExcel(info.file.originFileObj);
        message.success(`Đọc file ${info.file.name} thành công`);
      } else if (status === "error") {
        message.error(`Đọc file ${info.file.name} thất bại`);
      }
    },
  };

  const handleClose = () => {
    setOpenModalImport(false);
    setDataExcel([]);
  };

  const handleSubmit = async () => {
    // Mật khẩu mặc định cho mọi user nhập từ file
    const data = dataExcel.map((item) => ({ ...item, password: "123456" }));

    setIsSubmit(true);
    const res = await callBulkCreateUser(data);
    if (res && res.data) {
      notification.success({
        message: "Import thành công",
        description: `Thành công: ${res.data.countSuccess}, Lỗi: ${res.data.countError}`,
      });
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
      title="Import data user"
      width="50vw"
      open={openModalImport}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText="Import data"
      okButtonProps={{ disabled: dataExcel.length < 1 }}
      confirmLoading={isSubmit}
      maskClosable={false}
      destroyOnClose
    >
      <Dragger {...propsUpload} showUploadList={dataExcel.length > 0}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Chỉ nhận .csv, .xls, .xlsx. Mật khẩu mặc định: 123456. Hoặc&nbsp;
          <a onClick={(e) => e.stopPropagation()} href={templateFile} download>
            tải file mẫu
          </a>
        </p>
      </Dragger>

      <div style={{ paddingTop: 20 }}>
        <Table
          rowKey="email"
          dataSource={dataExcel}
          title={() => <span>Dữ liệu upload:</span>}
          columns={[
            { dataIndex: "fullName", title: "Tên hiển thị" },
            { dataIndex: "email", title: "Email" },
            { dataIndex: "phone", title: "Số điện thoại" },
          ]}
        />
      </div>
    </Modal>
  );
};

export default UserImport;
