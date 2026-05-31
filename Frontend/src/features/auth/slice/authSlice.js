import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, { payload }) => {
      console.log("set currentUser");
      state.currentUser= payload;
      state.loggedIn = true;
    },
    updateCurrentUser: (state, { payload }) => {
      // Merge provided fields into currentUser
      if (!state.currentUser) {
        state.currentUser = payload;
      } else {
        state.currentUser = { ...state.currentUser, ...payload };
      }
      // persist to localStorage for refresh safety
      try { localStorage.setItem("currentUser", JSON.stringify(state.currentUser)); } catch {}
    },
    setLogin:(state,payload)=>{
      console.log("set login");
      state.loggedIn = payload;
    },
    logout: (state) => {
      console.log("set logout");
      state.currentUser = null;
      state.loggedIn = false;
      // clear persisted auth
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
      } catch {}
    },
  },
});

export const { setCurrentUser, setLogin, updateCurrentUser, logout } = authSlice.actions;
export default  authSlice.reducer;
