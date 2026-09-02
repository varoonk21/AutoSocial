import { Route, Routes } from "react-router-dom";
import { PublicRoute } from "@/routes/PublicRoute";
import { LandingPage } from "./pages/LandingPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="login" element={<LandingPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}
