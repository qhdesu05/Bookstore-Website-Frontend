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
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from "xlsx";
import { callDeleteBook, callFetchListBook } from "../../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { formatVND, getErrorMessage } from "../../../utils/helper";
import InputSearch from "./InputSearch";
import BookModal from "./BookModal";
import BookViewDetail from "./BookViewDetail";

const DEFAULT_SORT = "sort=-updatedAt";

const BookTable = () => {
  // Dữ liệu bảng
  const [listBook, setListBook] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Điều kiện truy vấn
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortQuery, setSortQuery] = useState(DEFAULT_SORT);
  const [filter, setFilter] = useState("");
  const [searchKey, setSearchKey] = useState(0);

  // Các cửa sổ
  const [openModal, setOpenModal] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);
  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [dataViewDetail, setDataViewDetail] = useState(null);

  const fetchBook = async () => {
    setIsLoading(true);

    let query = `current=${current}&pageSize=${pageSize}`;
    if (filter) {
      query += `&${filter}`;
    }
    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    const res = await callFetchListBook(query);
    if (res && res.data) {
      setListBook(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [current, pageSize, filter, sortQuery]);

  const sortField = sortQuery.replace("sort=-", "").replace("sort=", "");
  const sortDirection = sortQuery.startsWith("sort=-") ? "descend" : "ascend";
  const getSortOrder = (field) => (sortField === field ? sortDirection : null);

  const handleDeleteBook = async (id) => {
    const res = await callDeleteBook(id);
    if (res && res.data) {
      message.success("Xóa book thành công");
      if (listBook.length === 1 && current > 1) {
        setCurrent(current - 1);
      } else {
        fetchBook();
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
      title: "Tên sách",
      dataIndex: "mainText",
      sorter: true,
      sortOrder: getSortOrder("mainText"),
    },
    {
      title: "Thể loại",
      dataIndex: "category",
      sorter: true,
      sortOrder: getSortOrder("category"),
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      sorter: true,
      sortOrder: getSortOrder("author"),
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      sorter: true,
      sortOrder: getSortOrder("price"),
      render: (value) => formatVND(value),
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
      width: 100,
      render: (_, record) => (
        <>
          <Popconfirm
            placement="leftTop"
            title="Xác nhận xóa book"
            description="Bạn có chắc chắn muốn xóa book này ?"
            onConfirm={() => handleDeleteBook(record._id)}
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
              setOpenModal(true);
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

  const handleAddNew = () => {
    setDataUpdate(null);
    setOpenModal(true);
  };

  const handleExportData = () => {
    if (listBook.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }

    const rows = listBook.map((book) => ({
      "Tên sách": book.mainText,
      "Tác giả": book.author,
      "Thể loại": book.category,
      "Giá tiền": book.price,
      "Số lượng": book.quantity,
      "Đã bán": book.sold,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "ExportBook.xlsx");
  };

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>Table List Books</span>
      <span style={{ display: "flex", gap: 15 }}>
        <Button
          icon={<ExportOutlined />}
          type="primary"
          onClick={handleExportData}
        >
          Export
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={handleAddNew}>
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
            title={renderHeader}
            loading={isLoading}
            columns={columns}
            dataSource={listBook}
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

      <BookModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        fetchBook={fetchBook}
      />

      <BookViewDetail
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />
    </>
  );
};

export default BookTable;
