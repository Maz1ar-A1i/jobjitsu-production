import { Fragment, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "../components/common/loader/loader.spinner";
import NotFound from "../pages/notfound/notFound";

import PrivateRouteValidator from "./components/PrivateRouteValidator";
import ProtectedRouteValidator from "./components/ProtectedRouteValidator";
import PublicRouteValidator from "./components/PublicRouteValidator";

import publicRoutes from "./publicRoutes";
import privateRoutes from "./privateRoutes";
import protectedRoutes from "./protectedRoutes";

function AppRoutes() {
  return (
    <Fragment>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />

          {/* Public Routes */}
          {publicRoutes.map((route, idx) => (
            <Route
              key={idx}
              path={route.path}
              element={
                <PublicRouteValidator>
                  <route.component />
                </PublicRouteValidator>
              }
            />
          ))}

          {/* Private Routes */}
          {privateRoutes.map((route, idx) => (
            <Route
              key={idx}
              path={route.path}
              element={
                <PrivateRouteValidator>
                  <route.component />
                </PrivateRouteValidator>
              }
            />
          ))}

          {/* Protected Routes */}
          {protectedRoutes.map((route, idx) => (
            <Route
              key={idx}
              path={route.path}
              element={
                <ProtectedRouteValidator>
                  <route.component />
                </ProtectedRouteValidator>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </Fragment>
  );
}

export default AppRoutes;
