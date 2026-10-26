import { useEffect, useState } from "react";
import { Button, Col, Row, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { callFetchListOrder } from "../../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { formatVND } from "../../../utils/helper";

const DEFAULT_SORT = "sort=-createdAt";

const ManageOrder = () => {
  const [listOrder, setListOrder] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortQuery, setSortQuery] = useState(DEFAULT_SORT);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);

      let query = `current=${current}&pageSize=${pageSize}`;
      if (sortQuery) {
        query += `&${sortQuery}`;
      }

      const res = await callFetchListOrder(query);
      if (res && res.data) {
        setListOrder(res.data.result);
        setTotal(res.data.meta.total);
      }
      setIsLoading(false);
    };
    fetchOrder();
  }, [current, pageSize, sortQuery]);

  const sortField = sortQuery.replace("sort=-", "").replace("sort=", "");
  const sortDirection = sortQuery.startsWith("sort=-") ? "descend" : "ascend";
  const getSortOrder = (field) => (sortField === field ? sortDirection : null);

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      sorter: true,
      sortOrder: getSortOrder("totalPrice"),
      render: (value) => formatVND(value),
    },
    {
      title: "Tên người nhận",
      dataIndex: "name",
      sorter: true,
      sortOrder: getSortOrder("name"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      sorter: true,
      sortOrder: getSortOrder("address"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      sorter: true,
      sortOrder: getSortOrder("phone"),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      sorter: true,
      sortOrder: getSortOrder("createdAt"),
      render: (value) => moment(value).format(FORMAT_DATE_DISPLAY),
    },
  ];

  const onChange = (pagination, filters, sorter) => {
    if (pagination.current !== current) {
      setCurrent(pagination.current);
    }
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrent(1);
    }
    if (sorter && sorter.field) {
      if (sorter.order === "ascend") {
        setSortQuery(`sort=${sorter.field}`);
      } else if (sorter.order === "descend") {
        setSortQuery(`sort=-${sorter.field}`);
      } else {
        setSortQuery("");
      }
    }
  };

  const handleReset = () => {
    setSortQuery(DEFAULT_SORT);
    setCurrent(1);
  };

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>Table List Orders</span>
      <Button onClick={handleReset}>
        <ReloadOutlined />
      </Button>
    </div>
  );

  return (
    <Row gutter={[20, 20]}>
      <Col span={24}>
        <Table
          scroll={{ x: "max-content" }}
          title={renderHeader}
          loading={isLoading}
          columns={columns}
          dataSource={listOrder}
          onChange={onChange}
          rowKey="_id"
          pagination={{
            current: current,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total, range) => (
              <div>
                {range[0]}-{range[1]} trên {total} rows
              </div>
            ),
          }}
        />
      </Col>
    </Row>
  );
};

export default ManageOrder;
