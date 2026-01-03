import { Outlet, useNavigate } from "react-router-dom";
import "./admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>RAIC Admin</h2>

        <button onClick={() => navigate("payments")}>Payments</button>
        <button onClick={() => navigate("registrations")}>
          Registrations
        </button>

        <button
          onClick={() =>
            window.open(`http://localhost:5000/api/admin/export/payments?token=${localStorage.getItem("adminToken")}`,"_blank")
          }
        >
          Export Excel
        </button>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
