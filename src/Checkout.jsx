import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

function Checkout({ cart, total, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState("");

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Please upload PNG, JPG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Screenshot must be under 5MB.");
      return;
    }

    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all customer details.");
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!screenshot) {
      alert("Please upload your payment screenshot.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login before checkout.");
        setLoading(false);
        return;
      }

      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, screenshot, {
          cacheControl: "3600",
          upsert: false,
          contentType: screenshot.type,
        });

      if (uploadError) {
        console.error("Screenshot upload error:", uploadError);
        alert("Screenshot upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      }));

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            items: orderItems,
            total: Number(total),
            status: "pending",
            payment_status: "pending",
            customer_name: name.trim(),
            customer_email: email.trim(),
            customer_phone: phone.trim(),
            payment_screenshot_url: fileName,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Order error:", error);
        alert(error.message);
        setLoading(false);
        return;
      }

      alert(`Order #${data.id} submitted! Payment is pending admin verification.`);

      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-nav">
        <div className="dashboard-logo">AYUSH<span>OP</span></div>
        <button className="admin-back-btn" onClick={onBack}>← Back to Store</button>
      </div>

      <div className="checkout-container">
        <div className="checkout-heading">
          <p className="dashboard-label">CHECKOUT</p>
          <h1>Complete your <span>Order</span></h1>
          <p>Pay using the QR code and upload your payment screenshot.</p>
        </div>

        <div className="checkout-grid">
          <div className="checkout-card">
            <h2>1. Customer Details</h2>

            <form onSubmit={placeOrder}>
              <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />

              <div className="payment-box">
                <h2>2. Pay via UPI</h2>
                <p className="payment-note">Scan the QR code with any UPI app and pay the exact order amount.</p>
                <div className="payment-amount">Pay ₹{Number(total).toLocaleString("en-IN")}</div>
                <div className="qr-wrapper">
                  <img src="/qr-payment.png" alt="UPI payment QR code" className="payment-qr" />
                </div>
                <p className="qr-help">PhonePe • Google Pay • Paytm • Any UPI app</p>
              </div>

              <div className="payment-box">
                <h2>3. Upload Payment Screenshot</h2>
                <p className="payment-note">After payment, upload a clear screenshot showing the payment confirmation.</p>

                <label className="screenshot-upload">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleScreenshot} />
                  <span>{screenshot ? `✓ ${screenshot.name}` : "Click to choose payment screenshot"}</span>
                </label>

                {preview && <img src={preview} alt="Payment screenshot preview" className="screenshot-preview" />}
              </div>

              <button type="submit" className="primary-btn checkout-submit" disabled={loading}>
                {loading ? "Submitting Order..." : "Submit Payment Proof →"}
              </button>

              <p className="pending-note">Your order will remain <strong>Pending</strong> until the admin verifies the payment.</p>
            </form>
          </div>

          <div className="checkout-card">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {cart.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div><h3>{item.name}</h3><p>Qty: {item.quantity}</p></div>
                  <strong>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-total"><span>Total</span><strong>₹{Number(total).toLocaleString("en-IN")}</strong></div>
            <div className="order-status-box"><span>Payment status</span><strong>Pending verification</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
