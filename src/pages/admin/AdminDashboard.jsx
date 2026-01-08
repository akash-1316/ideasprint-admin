import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* MOBILE TOP BAR */}
      <div className="admin-topbar">
        <button className="menu-btn" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <h3>RAIC Admin</h3>
      </div>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <h2>RAIC Admin</h2>

        <button
          className={location.pathname.includes("payments") ? "active" : ""}
          onClick={() => go("payments")}
        >
          💳 Payments
        </button>

        <button
          className={location.pathname.includes("registrations") ? "active" : ""}
          onClick={() => go("registrations")}
        >
          🧑‍🤝‍🧑 Registrations
        </button>

        <button
          onClick={() =>
            window.open(
              `https://ideasprint-backend-server.onrender.com/api/admin/export/payments?token=${localStorage.getItem(
                "adminToken"
              )}`,
              "_blank"
            )
          }
        >
          📥 Export Excel
        </button>

        <button className="logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
