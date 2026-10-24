import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import accountReducer from "./account/accountSlice";
import orderReducer from "./order/orderSlice";

const rootReducer = combineReducers({
  account: accountReducer,
  order: orderReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["order"], // chỉ lưu giỏ hàng, KHÔNG lưu account
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
