import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: {
    email: "",
    phone: "",
    fullName: "",
    role: "",
    avatar: "",
    id: "",
  },
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    // Đăng nhập thành công: payload là object user
    doLoginAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload;
    },
    // Mở app, hỏi backend lấy được tài khoản: payload là { user }
    doGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
    },
    // Mở app, hỏi backend mà thất bại (chưa đăng nhập, token hết hạn...)
    doGetAccountFailAction: (state) => {
      state.isLoading = false;
    },
    // Đăng xuất
    doLogoutAction: (state) => {
      state.isAuthenticated = false;
      state.user = initialState.user;
    },
  },
});

export const {
  doLoginAction,
  doGetAccountAction,
  doGetAccountFailAction,
  doLogoutAction,
} = accountSlice.actions;

export default accountSlice.reducer;
