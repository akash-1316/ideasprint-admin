import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminRegistrations = () => {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");

  // ================= FETCH REGISTRATIONS =================
  useEffect(() => {
    API.get("/admin/registrations")
      .then((res) => setTeams(res.data))
      .catch(() => toast.error("Failed to load registrations"));
  }, []);

  // ================= SEARCH FILTER =================
  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      [
        t.teamName,
        t.leaderName,
        t.leaderEmail,
        t.college,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [teams, search]);

  // ================= STATS CALCULATION (FILTERED) =================
  const stats = useMemo(() => {
    const total = filteredTeams.length;
    const confirmed = filteredTeams.filter(
      (t) => t.paymentStatus === "confirmed"
    ).length;
    const pending = total - confirmed;

    return { total, confirmed, pending };
  }, [filteredTeams]);

  return (
    <div>
      <h2>Registrations</h2>

      {/* 🔍 SEARCH BAR */}
      <input
        className="admin-search"
        placeholder="Search by team, leader, email, college"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🔥 SUMMARY DASHBOARD */}
      <div className="admin-summary">
        <div className="summary-card">
          <p>Total Registrations</p>
          <h3>{stats.total}</h3>
        </div>

        <div className="summary-card success">
          <p>Confirmed</p>
          <h3>{stats.confirmed}</h3>
        </div>

        <div className="summary-card pending">
          <p>Pending</p>
          <h3>{stats.pending}</h3>
        </div>
      </div>

      {/* 🔽 REGISTRATION LIST */}
      {filteredTeams.map((t) => (
        <div className="admin-card" key={t._id}>
          <p><b>Team Name:</b> {t.teamName}</p>
          <p><b>Leader:</b> {t.leaderName}</p>
          <p><b>Email:</b> {t.leaderEmail}</p>
          <p><b>Mobile:</b> {t.leaderMobile}</p>
          <p><b>College:</b> {t.college}</p>
          <p><b>Domain:</b> {t.domain}</p>
          <p><b>Team Size:</b> {t.teamSize}</p>
          <p><b>Members:</b> {t.members?.join(", ") || "—"}</p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={
                t.paymentStatus === "confirmed"
                  ? "status-confirmed"
                  : "status-pending"
              }
            >
              {t.paymentStatus}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminRegistrations;
