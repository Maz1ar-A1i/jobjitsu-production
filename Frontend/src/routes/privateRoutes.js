import { lazy } from "react";
const ChangePassword = lazy(() =>
  import("../pages/forgotpassword/change.password")
);
const routeObjects = [
  {
    path: "/user/pass",
    component: ChangePassword,
  },
];

export default routeObjects;
