import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ViewDetail from "../../components/Book/ViewDetail";
import NotFound from "../../components/NotFound";
import { callFetchBookById } from "../../services/api";

// Đổi một đường dẫn ảnh thành object mà thư viện gallery hiểu
const toImageItem = (url) => ({
  original: url,
  thumbnail: url,
  originalClass: "original-image",
  thumbnailClass: "thumbnail-image",
});

// Gom thumbnail + các ảnh slider thành một mảng ảnh
const getImages = (book) => {
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/images/book/`;
  const images = [];

  if (book.thumbnail) {
    images.push(toImageItem(baseUrl + book.thumbnail));
  }
  book.slider?.forEach((name) => {
    images.push(toImageItem(baseUrl + name));
  });

  return images;
};

const BookPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [dataBook, setDataBook] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // Không có id trên URL thì khỏi gọi API
    if (!id) {
      setIsNotFound(true);
      return;
    }

    const fetchBook = async () => {
      setDataBook(null); // về trạng thái "đang tải"
      setIsNotFound(false);

      const res = await callFetchBookById(id);
      if (res && res.data) {
        setDataBook({ ...res.data, items: getImages(res.data) });
      } else {
        setIsNotFound(true);
      }
    };
    fetchBook();
  }, [id]);

  if (isNotFound) {
    return <NotFound />;
  }

  return <ViewDetail dataBook={dataBook} />;
};
export default BookPage;
