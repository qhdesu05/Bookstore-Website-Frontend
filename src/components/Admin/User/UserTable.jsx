import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Popconfirm,
  Row,
  Table,
  message,
  notification,
} from "antd";
import {
  CloudUploadOutlined,
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from "xlsx";
import { callDeleteUser, callFetchListUser } from "../../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { getErrorMessage } from "../../../utils/helper";
import InputSearch from "./InputSearch";
import UserModalCreate from "./UserModalCreate";
import UserModalUpdate from "./UserModalUpdate";
import UserViewDetail from "./UserViewDetail";
import UserImport from "./data/UserImport";

const DEFAULT_SORT = "sort=-updatedAt";

const UserTable = () => {
  // Dữ liệu bảng
  const [listUser, setListUser] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Điều kiện truy vấn
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortQuery, setSortQuery] = useState(DEFAULT_SORT);
  const [filter, setFilter] = useState("");
  const [searchKey, setSearchKey] = useState(0);

  // Các cửa sổ
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalImport, setOpenModalImport] = useState(false);
  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [dataViewDetail, setDataViewDetail] = useState(null);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);

  const fetchUser = async () => {
    setIsLoading(true);

    let query = `current=${current}&pageSize=${pageSize}`;
    if (filter) {
      query += `&${filter}`;
    }
    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    const res = await callFetchListUser(query);
    if (res && res.data) {
      setListUser(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [current, pageSize, filter, sortQuery]);

  const sortField = sortQuery.replace("sort=-", "").replace("sort=", "");
  const sortDirection = sortQuery.startsWith("sort=-") ? "descend" : "ascend";
  const getSortOrder = (field) => (sortField === field ? sortDirection : null);

  const handleDeleteUser = async (userId) => {
    const res = await callDeleteUser(userId);
    if (res && res.data) {
      message.success("Xóa user thành công");
      if (listUser.length === 1 && current > 1) {
        setCurrent(current - 1);
      } else {
        fetchUser();
      }
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: getErrorMessage(res),
      });
    }
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
      render: (value, record) => (
        <a
          style={{ cursor: "pointer" }}
          onClick={() => {
            setDataViewDetail(record);
            setOpenViewDetail(true);
          }}
        >
          {value}
        </a>
      ),
    },
    {
      title: "Tên hiển thị",
      dataIndex: "fullName",
      sorter: true,
      sortOrder: getSortOrder("fullName"),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
      sortOrder: getSortOrder("email"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      sorter: true,
      sortOrder: getSortOrder("phone"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      sorter: true,
      sortOrder: getSortOrder("updatedAt"),
      render: (value) => moment(value).format(FORMAT_DATE_DISPLAY),
    },
    {
      title: "Action",
      render: (_, record) => (
        <>
          <Popconfirm
            placement="leftTop"
            title="Xác nhận xóa user"
            description="Bạn có chắc chắn muốn xóa user này ?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <span style={{ cursor: "pointer", margin: "0 20px" }}>
              <DeleteTwoTone twoToneColor="#ff4d4f" />
            </span>
          </Popconfirm>

          <EditTwoTone
            twoToneColor="#f57800"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setDataUpdate(record);
              setOpenModalUpdate(true);
            }}
          />
        </>
      ),
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

  const handleSearch = (query) => {
    setCurrent(1);
    setFilter(query);
  };

  const handleReset = () => {
    setSortQuery(DEFAULT_SORT);
    setFilter("");
    setCurrent(1);
    setSearchKey(searchKey + 1);
  };

  const handleExportData = () => {
    if (listUser.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }

    const rows = listUser.map((user) => ({
      "Tên hiển thị": user.fullName,
      Email: user.email,
      "Số điện thoại": user.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "ExportUser.xlsx");
  };

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>Table List Users</span>
      <span style={{ display: "flex", gap: 15 }}>
        <Button
          icon={<ExportOutlined />}
          type="primary"
          onClick={handleExportData}
        >
          Export
        </Button>
        <Button
          icon={<CloudUploadOutlined />}
          type="primary"
          onClick={() => setOpenModalImport(true)}
        >
          Import
        </Button>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setOpenModalCreate(true)}
        >
          Thêm mới
        </Button>
        <Button onClick={handleReset}>
          <ReloadOutlined />
        </Button>
      </span>
    </div>
  );

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <InputSearch key={searchKey} handleSearch={handleSearch} />
        </Col>
        <Col span={24}>
          <Table
            scroll={{ x: "max-content" }}
            title={renderHeader}
            loading={isLoading}
            columns={columns}
            dataSource={listUser}
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

      <UserModalCreate
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        fetchUser={fetchUser}
      />

      <UserModalUpdate
        openModalUpdate={openModalUpdate}
        setOpenModalUpdate={setOpenModalUpdate}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        fetchUser={fetchUser}
      />

      <UserViewDetail
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <UserImport
        openModalImport={openModalImport}
        setOpenModalImport={setOpenModalImport}
        fetchUser={fetchUser}
      />
    </>
  );
};

export default UserTable;
