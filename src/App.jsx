import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import ContactPage from "./pages/contact";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import OrderPage from "./pages/order";
import AdminPage from "./pages/admin";
import { callFetchAccount } from "./services/api";
import {
  doGetAccountAction,
  doGetAccountFailAction,
} from "./redux/account/accountSlice";
import "./styles/reset.scss";
import BookPage from "./pages/book";
import HistoryPage from "./pages/history";
import LayoutAdmin from "./components/Admin/LayoutAdmin";
import ManageUserPage from "./pages/admin/user";
import ManageBookPage from "./pages/admin/book";

const Layout = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="layout-app">
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Outlet context={[searchTerm, setSearchTerm]} />
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "contact", element: <ContactPage /> },
      {
        //:slug là tham số động, khớp với mọi giá trị. /book/abc, /book/xyz đều vào BookPage
        path: "book/:slug",
        element: <BookPage />,
      },
      {
        path: "order",
        element: (
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="ADMIN">
        <LayoutAdmin />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <AdminPage /> },
      { path: "user", element: <ManageUserPage /> },
      { path: "book", element: <ManageBookPage /> },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

export default function App() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.account.isLoading);

  useEffect(() => {
    const getAccount = async () => {
      // Không có token thì khỏi hỏi backend, chắc chắn chưa đăng nhập
      if (!localStorage.getItem("access_token")) {
        dispatch(doGetAccountFailAction());
        return;
      }
      const res = await callFetchAccount();
      if (res && res.data) {
        dispatch(doGetAccountAction(res.data));
      } else {
        dispatch(doGetAccountFailAction());
      }
    };
    getAccount();
  }, []);
  if (isLoading) {
    return <Loading />;
  }
  return <RouterProvider router={router} />;
}
