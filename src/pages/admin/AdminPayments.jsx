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

  // ================= TOTAL CALCULATIONS =================
  const totals = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const verified = payments
      .filter((p) => p.verified)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pending = total - verified;

    return { total, verified, pending };
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
      <h2>Payments</h2>

      {/* 🔥 TOTALS SUMMARY */}
      <div className="admin-summary">
        <div className="summary-card">
          <p>Total Collected</p>
          <h3>₹{totals.total}</h3>
        </div>
        <div className="summary-card success">
          <p>Verified Amount</p>
          <h3>₹{totals.verified}</h3>
        </div>
        <div className="summary-card pending">
          <p>Pending Amount</p>
          <h3>₹{totals.pending}</h3>
        </div>
      </div>

      {/* 🔽 PAYMENTS LIST */}
      {payments.map((p) => (
        <div className="admin-card" key={p._id}>
          <img
            src={p.screenshot}
            alt="Payment Proof"
            style={{ width: "100%", borderRadius: "8px" }}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x250?text=Image+Not+Available";
            }}
          />

          <p><b>UTR:</b> {p.utr}</p>
          <p><b>Amount:</b> ₹{p.amount}</p>
          <p><b>Status:</b> {p.verified ? "Verified" : "Pending"}</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              disabled={loadingId === p._id || p.verified}
              onClick={() => updateStatus(p._id, true)}
            >
              {loadingId === p._id && !p.verified ? "Verifying..." : "Verify"}
            </button>

            <button
              disabled={loadingId === p._id}
              onClick={() => updateStatus(p._id, false)}
            >
              Reject
            </button>

            {p.verified && (
              <button
                disabled={loadingId === p._id}
                onClick={() => resendMail(p._id)}
                style={{ background: "#ff9800", color: "#fff" }}
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
