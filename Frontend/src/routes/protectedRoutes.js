import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/dashboard/dashboard.jsx"));
const AccountPage = lazy(() => import("../pages/account/account.jsx"));
const CreateUser = lazy(() => import("../features/user/create.users.jsx"));
const UserList = lazy(() => import("../features/user/user.list.jsx"));
const AiDashboard = lazy(() => import("../pages/ai-dashboard/AiDashboard.jsx"));
const ResumeBuilder = lazy(() => import("../pages/resume/ResumeBuilder.jsx"));
const ResumeAnalyzer = lazy(() => import("../pages/resume/ResumeAnalyzer.jsx"));
const Jobs = lazy(() => import("../pages/jobs/Jobs.jsx"));
const Practice = lazy(() => import("../pages/practice/Practice.jsx"));
const SessionFeedback = lazy(() => import("../pages/session/SessionFeedback.jsx"));

const protectedRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/account", component: AccountPage },
  { path: "/user/create", component: CreateUser },
  { path: "/user/list", component: UserList },
  { path: "/ai-dashboard", component: AiDashboard },
  { path: "/resume-builder", component: ResumeBuilder },
  { path: "/resume-analyzer", component: ResumeAnalyzer },
  { path: "/jobs", component: Jobs },
  { path: "/practice", component: Practice },
  { path: "/session/:id/feedback", component: SessionFeedback },
];

export default protectedRoutes;


