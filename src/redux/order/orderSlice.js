import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  carts: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Thêm sách vào giỏ. payload: { _id, quantity, detail }
    doAddBookAction: (state, action) => {
      const item = action.payload;
      const existing = state.carts.find((c) => c._id === item._id);

      if (existing) {
        // Đã có trong giỏ: cộng dồn nhưng không vượt tồn kho
        existing.quantity = Math.min(
          existing.quantity + item.quantity,
          existing.detail.quantity,
        );
      } else {
        state.carts.push({
          _id: item._id,
          quantity: item.quantity,
          detail: item.detail,
        });
      }
    },

    // Sửa số lượng của một mục. payload: { _id, quantity }
    doUpdateCartAction: (state, action) => {
      const item = action.payload;
      const existing = state.carts.find((c) => c._id === item._id);

      if (existing) {
        existing.quantity = Math.min(item.quantity, existing.detail.quantity);
      }
    },

    // Xóa một mục. payload: { _id }
    doDeleteItemCartAction: (state, action) => {
      state.carts = state.carts.filter((c) => c._id !== action.payload._id);
    },

    // Xóa sạch giỏ (sau khi đặt hàng, hoặc khi đăng xuất)
    doClearCartAction: (state) => {
      state.carts = [];
    },
  },
});

export const {
  doAddBookAction,
  doUpdateCartAction,
  doDeleteItemCartAction,
  doClearCartAction,
} = orderSlice.actions;

export default orderSlice.reducer;
