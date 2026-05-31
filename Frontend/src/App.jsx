import React, { Fragment, Suspense } from "react";
import Navbar from "./components/menu/nav";
import AppRoutes from "./routes";
import { useSelector } from "react-redux";
import Loader from "./components/common/loader/loader.spinner";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import "./assets/global.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const currentUser = useSelector((state) =>
    state.auth ? state.auth.currentUser : null
  );
  const loggingStatus = useSelector((state) =>
    state.auth ? state.auth.loggedIn : false
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <Loader size={32} role="status" className="spinner-border" />
          }
        >
          <Fragment>
            {/* <Navbar currentUser={currentUser} loggingStatus={loggingStatus} /> */}
            <AppRoutes
              currentUser={currentUser}
              loggingStatus={loggingStatus}
              role={currentUser?.role}
            />
          </Fragment>
        </Suspense>
        <ToastContainer hideProgressBar theme="colored" autoClose={false} />
      </BrowserRouter>
      {/* <ReactQueryDevtools/> */}
    </QueryClientProvider>

  );
}

export default App;
