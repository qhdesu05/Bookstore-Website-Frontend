import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import moment from "moment";
import ReactJson from "react-json-view";
import { callOrderHistory } from "../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../utils/constant";
import { formatVND } from "../../utils/helper";

const History = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const res = await callOrderHistory();
      if (res && res.data) {
        setOrderHistory(res.data);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const columns = [
    {
      title: "STT",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (value) => moment(value).format(FORMAT_DATE_DISPLAY),
    },
    {
      title: "Tổng số tiền",
      dataIndex: "totalPrice",
      render: (value) => formatVND(value),
    },
    {
      title: "Trạng thái",
      render: () => <Tag color="green">Thành công</Tag>,
    },
    {
      title: "Chi tiết",
      render: (_, record) => (
        <ReactJson
          src={record.detail}
          name="Chi tiết đơn mua"
          collapsed={true}
          enableClipboard={false}
          displayDataTypes={false}
          displayObjectSize={false}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ margin: "15px 0" }}>Lịch sử đặt hàng:</div>
      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={orderHistory}
        pagination={false}
      />
    </div>
  );
};

export default History;
