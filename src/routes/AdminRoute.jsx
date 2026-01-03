import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminRoute = () => {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const decoded = jwtDecode(adminToken);

    if (decoded.role !== "admin") {
      throw new Error("Not admin");
    }

    return <Outlet />;
  } catch (error) {
    console.error("AdminRoute error:", error);
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminRoute;
