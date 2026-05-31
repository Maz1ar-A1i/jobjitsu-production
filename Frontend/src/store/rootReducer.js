import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../features/auth/slice/authSlice";

export default combineReducers({
    auth :  authSlice,
});