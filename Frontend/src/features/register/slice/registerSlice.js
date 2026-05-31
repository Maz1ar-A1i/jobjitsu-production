import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    
  },
});

// export const { setCurrentUser, setLogin, logout } = userSlice.actions;
export default  userSlice.reducer;
