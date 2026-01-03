import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminRegistrations = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    API.get("/admin/registrations")
      .then((res) => setTeams(res.data))
      .catch(() => toast.error("Failed to load registrations"));
  }, []);

  return (
    <div>
      <h2>Registrations</h2>

      {teams.map((t) => (
        <div className="admin-card" key={t._id}>
          <p><b>Event:</b> {t.event}</p>
          <p><b>Team Name:</b> {t.teamName}</p>
          <p><b>Leader:</b> {t.leaderName}</p>
          <p><b>Email:</b> {t.leaderEmail}</p>
          <p><b>Mobile:</b> {t.leaderMobile}</p>
          <p><b>College:</b> {t.college}</p>
          <p><b>Domain:</b> {t.domain}</p>
          <p><b>Team Size:</b> {t.teamSize}</p>
          <p><b>Members:</b> {t.members?.join(", ") || "—"}</p>
          <p><b>Status:</b> {t.paymentStatus}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminRegistrations;
