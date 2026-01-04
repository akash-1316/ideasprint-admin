import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    API.get("/admin/payments")
      .then((res) => setPayments(res.data))
      .catch(() => toast.error("Unauthorized access"));
  }, []);

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
          ? "Payment verified successfully"
          : "Payment marked as pending"
      );
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔥 RESEND MAIL
  const resendMail = async (id) => {
    try {
      setLoadingId(id);

      await API.put(`/admin/payment/${id}?resend=true`, { verified: true });

      toast.success("Verification mail resent");
    } catch {
      toast.error("Failed to resend mail");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2>Payments</h2>

      {payments.map((p) => (
        <div className="admin-card" key={p._id}>
          {/* 🔥 Cloudinary Image */}
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
          <p>
            <b>Status:</b>{" "}
            {p.verified ? "Verified" : "Pending"}
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
           <button
  type="button"
  onClick={() => {
    console.log("VERIFY CLICKED", p._id);
    updateStatus(p._id, true);
  }}
>
  Verify
</button>


          <button
  type="button"
  onClick={() => {
    console.log("REJECT CLICKED", p._id);
    updateStatus(p._id, false);
  }}
>
  Reject
</button>


            {p.verified && (
              <button
                disabled={loadingId === p._id}
                onClick={() => resendMail(p._id)}
                style={{ background: "#ff9800", color: "white" }}
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
