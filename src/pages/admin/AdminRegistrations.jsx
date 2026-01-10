import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminRegistrations = () => {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");

  // ================= FETCH REGISTRATIONS =================
  useEffect(() => {
    API.get("/admin/registrations")
      .then((res) => setTeams(res.data))
      .catch(() => toast.error("Failed to load registrations"));
  }, []);

  // ================= REMOVE DUPLICATES =================
  const uniqueTeams = useMemo(() => {
    const map = new Map();
    teams.forEach((t) => {
      const key = t.leaderEmail || `${t.teamName}-${t.leaderMobile}`;
      if (!map.has(key)) map.set(key, t);
    });
    return Array.from(map.values());
  }, [teams]);

  // ================= SEARCH FILTER =================
  const filteredTeams = useMemo(() => {
    return uniqueTeams.filter((t) =>
      [
        t.teamName,
        t.leaderName,
        t.leaderEmail,
        t.college,
        t.domain,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [uniqueTeams, search]);

  // ================= STATS =================
  const stats = useMemo(() => {
    const total = filteredTeams.length;
    const confirmed = filteredTeams.filter(
      (t) => t.paymentStatus === "confirmed"
    ).length;
    return { total, confirmed, pending: total - confirmed };
  }, [filteredTeams]);

  // ================= DOMAIN PIE DATA =================
  const domainData = useMemo(() => {
    const map = {};
    filteredTeams.forEach((t) => {
      if (t.domain) map[t.domain] = (map[t.domain] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTeams]);

  return (
    <div>
      <h2>Registrations</h2>

      <input
        className="admin-search"
        placeholder="Search by team, leader, email, college, domain"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="admin-summary">
        <div className="summary-card">
          <p>Total</p>
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

      {/* ===== DOMAIN PIE CHART ===== */}
      <div className="admin-chart">
        <h3>Domain Distribution</h3>

        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={domainData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {domainData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              verticalAlign="bottom"
              align="center"
              layout="horizontal"
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ===== REGISTRATION LIST ===== */}
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
