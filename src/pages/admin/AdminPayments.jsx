import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // ================= FETCH PAYMENTS =================
  useEffect(() => {
    API.get("/admin/payments")
      .then((res) => setPayments(res.data))
      .catch(() => toast.error("Unauthorized access"));
  }, []);

  // ================= CALCULATIONS =================
  const stats = useMemo(() => {
    const totalCount = payments.length;
    const verifiedPayments = payments.filter((p) => p.verified);
    const pendingPayments = payments.filter((p) => !p.verified);

    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const verifiedAmount = verifiedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const pendingAmount = totalAmount - verifiedAmount;

    return {
      totalCount,
      verifiedCount: verifiedPayments.length,
      pendingCount: pendingPayments.length,
      totalAmount,
      verifiedAmount,
      pendingAmount,
    };
  }, [payments]);

  // ================= VERIFY / REJECT =================
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

  // ================= RESEND MAIL =================
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

  // ================= UI =================
  return (
    <div>
      <h2>Payments Dashboard</h2>

      {/* 🔥 SUMMARY DASHBOARD */}
      <div className="admin-summary">
        <div className="summary-card">
          <p>Total Payments</p>
          <h3>{stats.totalCount}</h3>
          <span>₹{stats.totalAmount}</span>
        </div>

        <div className="summary-card success">
          <p>Verified Payments</p>
          <h3>{stats.verifiedCount}</h3>
          <span>₹{stats.verifiedAmount}</span>
        </div>

        <div className="summary-card pending">
          <p>Pending Payments</p>
          <h3>{stats.pendingCount}</h3>
          <span>₹{stats.pendingAmount}</span>
        </div>
      </div>

      {/* 🔽 PAYMENTS LIST */}
      {payments.map((p) => (
        <div className="admin-card" key={p._id}>
          <img
            src={p.screenshot}
            alt="Payment Proof"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x250?text=Image+Not+Available";
            }}
          />

          <p><b>UTR:</b> {p.utr}</p>
          <p><b>Amount:</b> ₹{p.amount}</p>
          <p>
            <b>Status:</b>{" "}
            {p.verified ? "Verified" : "Pending"}
          </p>

          <div className="admin-actions">
            <button
              disabled={loadingId === p._id || p.verified}
              onClick={() => updateStatus(p._id, true)}
            >
              {loadingId === p._id && !p.verified
                ? "Verifying..."
                : "Verify"}
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
                {loadingId === p._id ? "Sending..." : "Resend Mail"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPayments;
