import { lazy } from "react";
const Home = lazy(() => import("../pages/homepage/homepage"));
const Login = lazy(() => import("../pages/login/login"));
const Signup = lazy(() => import("../pages/signup/signup"));

const ChangePassword = lazy(() =>
  import("../pages/forgotpassword/change.password")
);

const ForgotPassword = lazy(() =>
  import("../pages/forgotpassword/forgot.password")
);
const SessionPage = lazy(() => import("../pages/session/SessionPage.jsx"));
const About = lazy(() => import("../pages/about/about.jsx"));
const Guides = lazy(() => import("../pages/guides/guides.jsx"));
const PrivacyPolicy = lazy(() => import("../pages/legal/privacy.jsx"));
const TermsOfService = lazy(() => import("../pages/legal/terms.jsx"));
const Security = lazy(() => import("../pages/legal/security.jsx"));
const Showcase = lazy(() => import("../pages/showcase/Showcase"));

const routeObjects = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/signup",
    component: Signup,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
  },
  {
    path: "/resetpassword",
    component: ChangePassword,
  },
  {
    path: "/",
    component: Home,
  },
  {
    path: "/session",
    component: SessionPage,
  },
  {
    path: "/about",
    component: About,
  },
  {
    path: "/guides",
    component: Guides,
  },
  {
    path: "/privacy",
    component: PrivacyPolicy,
  },
  {
    path: "/terms",
    component: TermsOfService,
  },
  {
    path: "/security",
    component: Security,
  },
  {
    path: "/showcase",
    component: Showcase,
  },
];

export default routeObjects;


