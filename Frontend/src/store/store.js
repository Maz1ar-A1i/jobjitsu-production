import { applyMiddleware, compose, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import rootReducer from "./rootReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const middleware = [];
const middlewareEnhancer = [applyMiddleware(...middleware)];
const composedEnhancers = compose(middlewareEnhancer);

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false }); //to ignore redux presist warning
  },
  reducer: persistedReducer,
  undefined,
  composedEnhancers,
});

const persistor = persistStore(store);

export { store, persistor };
