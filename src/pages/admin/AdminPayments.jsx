import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  /* ================= FETCH BOTH ================= */
  useEffect(() => {
    Promise.all([
      API.get("/admin/payments"),
      API.get("/admin/registrations"),
    ])
      .then(([payRes, regRes]) => {
        setPayments(payRes.data);
        setRegistrations(regRes.data);
      })
      .catch(() => toast.error("Failed to load admin data"));
  }, []);

  /* ================= REMOVE DUPLICATE PAYMENTS (FRONTEND ONLY) ================= */
  const uniquePayments = useMemo(() => {
    const map = new Map();

    payments.forEach((p) => {
      const key = p.utr || `${p.userId}-${p.amount}`;
      map.set(key, p); // latest wins
    });

    return Array.from(map.values());
  }, [payments]);

  /* ================= MERGE DATA ================= */
  const mergedPayments = useMemo(() => {
    return uniquePayments.map((p) => {
      const reg = registrations.find(
        (r) => String(r.userId) === String(p.userId)
      );

      return {
        ...p,
        teamName: reg?.teamName || "—",
        leaderName: reg?.leaderName || "—",
      };
    });
  }, [uniquePayments, registrations]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const totalCount = mergedPayments.length;
    const verified = mergedPayments.filter((p) => p.verified);
    const pending = mergedPayments.filter((p) => !p.verified);

    const totalAmount = mergedPayments.reduce(
      (s, p) => s + Number(p.amount || 0),
      0
    );

    const verifiedAmount = verified.reduce(
      (s, p) => s + Number(p.amount || 0),
      0
    );

    return {
      totalCount,
      verifiedCount: verified.length,
      pendingCount: pending.length,
      totalAmount,
      verifiedAmount,
      pendingAmount: totalAmount - verifiedAmount,
    };
  }, [mergedPayments]);

  /* ================= VERIFY / REJECT ================= */
  const updateStatus = async (id, verified) => {
    try {
      setLoadingId(id);

      await API.put(`/admin/payment/${id}`, { verified });

      setPayments((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, verified } : p
        )
      );

      toast.success(
        verified
          ? "Payment verified & mail sent"
          : "Payment marked as pending"
      );
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= RESEND MAIL ================= */
  const resendMail = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/admin/payment/${id}/resend-mail`);
      toast.success("Verification mail resent");
    } catch {
      toast.error("Failed to resend mail");
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= UI ================= */
  return (
    <div>
      <h2>Payments Dashboard</h2>

      {/* SUMMARY */}
      <div className="admin-summary">
        <div className="summary-card">
          <p>Total Payments</p>
          <h3>{stats.totalCount}</h3>
          <span>₹{stats.totalAmount}</span>
        </div>

        <div className="summary-card success">
          <p>Verified</p>
          <h3>{stats.verifiedCount}</h3>
          <span>₹{stats.verifiedAmount}</span>
        </div>

        <div className="summary-card pending">
          <p>Pending</p>
          <h3>{stats.pendingCount}</h3>
          <span>₹{stats.pendingAmount}</span>
        </div>
      </div>

      {/* PAYMENTS */}
      {mergedPayments.map((p) => (
        <div className="admin-card" key={p._id}>
          <img
            src={p.screenshot}
            alt="Payment Proof"
            onError={(e) =>
              (e.target.src =
                "https://via.placeholder.com/400x250?text=Image+Not+Available")
            }
          />

          <p><b>Team Name:</b> {p.teamName}</p>
          <p><b>Leader Name:</b> {p.leaderName}</p>
          <p><b>UTR:</b> {p.utr}</p>
          <p><b>Amount:</b> ₹{p.amount}</p>

          <p>
            <b>Status:</b>{" "}
            <span className={p.verified ? "status-confirmed" : "status-pending"}>
              {p.verified ? "Verified" : "Pending"}
            </span>
          </p>

          <div className="admin-actions">
            <button
              disabled={loadingId === p._id || p.verified}
              onClick={() => updateStatus(p._id, true)}
            >
              Verify
            </button>

            <button
              disabled={loadingId === p._id}
              onClick={() => updateStatus(p._id, false)}
            >
              Reject
            </button>

            {p.verified && (
              <button
                className="resend"
                disabled={loadingId === p._id}
                onClick={() => resendMail(p._id)}
              >
                Resend Mail
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPayments;
