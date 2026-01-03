import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./admin.css";
import { toast } from "react-toastify";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    API.get("/admin/payments")
      .then((res) => setPayments(res.data))
      .catch(() => toast.error("Unauthorized access"));
  }, []);

  const updateStatus = async (id, verified) => {
    try {
      await API.put(`/admin/payment/${id}`, { verified });

      setPayments((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, verified } : p
        )
      );

      if (verified) {
        toast.success("Payment verified successfully");
      } else {
        toast.warning("Payment marked as pending");
      }
    } catch (err) {
      toast.error("Failed to update payment");
    }
  };

  return (
    <div>
      <h2>Payments</h2>

      {payments.map((p) => (
        <div className="admin-card" key={p._id}>
          <img
            src={`http://localhost:5000/uploads/${p.screenshot}`}
            alt="payment"
          />
          <p><b>UTR:</b> {p.utr}</p>
          <p><b>Amount:</b> ₹{p.amount}</p>
          <p>
            <b>Status:</b> {p.verified ? "Verified" : "Pending"}
          </p>

          <button onClick={() => updateStatus(p._id, true)}>
            Verify
          </button>

          <button onClick={() => updateStatus(p._id, false)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminPayments;
