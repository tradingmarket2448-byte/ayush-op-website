import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function MyOrders({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);

  const loadOrders = async () => {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders error:", error);
      alert(error.message);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`orders-${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);


  const downloadProduct = async (item, order) => {
    if (!item?.file_path) {
      alert("Download is not available for this product yet.");
      return;
    }

    if (
      String(order.status).toLowerCase() !== "success" &&
      String(order.status).toLowerCase() !== "completed"
    ) {
      alert("Download will be available after your payment is verified.");
      return;
    }

    setDownloadLoading(`${order.id}-${item.id}`);

    const { data, error } = await supabase.storage
      .from("product-files")
      .createSignedUrl(item.file_path, 60);

    if (error || !data?.signedUrl) {
      console.error("Download URL error:", error);
      alert("Could not create download link. Please try again.");
      setDownloadLoading(null);
      return;
    }

    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = item.name || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setDownloadLoading(null);
  };

  const statusClass = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value === "success" || value === "completed") return "status-success";
    if (value === "cancelled" || value === "canceled") return "status-cancelled";
    return "status-pending";
  };

  const prettyStatus = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value === "success" || value === "completed") return "Success";
    if (value === "cancelled" || value === "canceled") return "Cancelled";
    return "Pending";
  };

  return (
    <div className="orders-page">
      <div className="orders-nav">
        <div className="dashboard-logo">
          AYUSH<span>OP</span>
        </div>

        <button className="admin-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
      </div>

      <div className="orders-container">
        <div className="orders-heading">
          <p className="dashboard-label">MY ACCOUNT</p>
          <h1>
            My <span>Orders</span>
          </h1>
          <p>Track your purchases and payment verification status.</p>
        </div>

        {loading ? (
          <div className="orders-empty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Your purchases will appear here after checkout.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <div className="order-card" key={order.id}>
                  <div className="order-card-top">
                    <div>
                      <p className="order-number">ORDER #{order.id}</p>
                      <h2>₹{Number(order.total).toLocaleString("en-IN")}</h2>
                    </div>

                    <div className={`order-status ${statusClass(order.status)}`}>
                      {prettyStatus(order.status)}
                    </div>
                  </div>

                  <div className="order-meta">
                    <span>
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span>
                      Payment:{" "}
                      <strong className={statusClass(order.payment_status)}>
                        {prettyStatus(order.payment_status)}
                      </strong>
                    </span>

                    <span>{items.length} product{items.length === 1 ? "" : "s"}</span>
                  </div>

                  <div className="order-preview">
                    {items.slice(0, 2).map((item) => (
                      <div className="order-preview-item" key={item.id}>
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="order-more">+{items.length - 2} more</div>
                    )}
                  </div>

                  <button
                    className="order-view-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Order →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="order-modal"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <p className="dashboard-label">ORDER #{selectedOrder.id}</p>
            <h2>Order <span>Details</span></h2>

            <div className="detail-status-row">
              <span>Order status</span>
              <strong className={statusClass(selectedOrder.status)}>
                {prettyStatus(selectedOrder.status)}
              </strong>
            </div>

            <div className="detail-status-row">
              <span>Payment status</span>
              <strong className={statusClass(selectedOrder.payment_status)}>
                {prettyStatus(selectedOrder.payment_status)}
              </strong>
            </div>

            <div className="order-detail-items">
              {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item) => (
                <div className="order-detail-item" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <strong>
                    ₹
                    {(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-detail-total">
              <span>Total</span>
              <strong>
                ₹{Number(selectedOrder.total).toLocaleString("en-IN")}
              </strong>
            </div>

            {String(selectedOrder.status).toLowerCase() === "pending" && (
              <div className="order-info pending">
                Payment screenshot is waiting for admin verification.
              </div>
            )}

            {String(selectedOrder.status).toLowerCase() === "cancelled" && (
              <div className="order-info cancelled">
                This order was cancelled by the admin.
              </div>
            )}

            {(String(selectedOrder.status).toLowerCase() === "success" ||
              String(selectedOrder.status).toLowerCase() === "completed") && (
              <div className="order-info success">
                Payment verified successfully. ✅ Your download buttons are available above for products that have a digital file.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;
