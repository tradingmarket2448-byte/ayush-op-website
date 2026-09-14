import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function Admin({ onBack }) {
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [filePath, setFilePath] = useState("");
  const [digitalFile, setDigitalFile] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const loadProducts = async () => {
    setProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImageUrl("");
    setImageFile(null);
    setFilePath("");
    setDigitalFile(null);
  };

  const uploadImage = async () => {
    if (!imageFile) {
      return imageUrl;
    }

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      alert(uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadDigitalFile = async () => {
    if (!digitalFile) return filePath || "";

    const fileExt = digitalFile.name.includes(".")
      ? digitalFile.name.split(".").pop()
      : "bin";

    const safeName = digitalFile.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const path = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}-${safeName || `file.${fileExt}`}`;

    const { error } = await supabase.storage
      .from("product-files")
      .upload(path, digitalFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: digitalFile.type || "application/octet-stream",
      });

    if (error) {
      alert(error.message);
      return null;
    }

    return path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price) {
      alert("Product name and price are required.");
      return;
    }

    setUploading(true);

    let finalImageUrl = imageUrl;
    let finalFilePath = filePath;

    if (imageFile) {
      finalImageUrl = await uploadImage();

      if (!finalImageUrl) {
        setUploading(false);
        return;
      }
    }

    if (digitalFile) {
      finalFilePath = await uploadDigitalFile();

      if (!finalFilePath) {
        setUploading(false);
        return;
      }
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image_url: finalImageUrl || "",
      file_path: finalFilePath || "",
    };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        setUploading(false);
        alert(error.message);
        return;
      }

      alert("Product updated successfully! ✅");
    } else {
      const { error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        setUploading(false);
        alert(error.message);
        return;
      }

      alert("Product added successfully! 🎉");
    }

    setUploading(false);
    resetForm();
    await loadProducts();
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setCategory(product.category || "");
    setImageUrl(product.image_url || "");
    setImageFile(null);
    setFilePath(product.file_path || "");
    setDigitalFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product deleted! 🗑️");
    await loadProducts();
  };

  const openOrder = async (order) => {
    setSelectedOrder(order);
    setScreenshotUrl("");

    if (order.payment_screenshot_url) {
      const { data, error } = await supabase.storage
        .from("payment-screenshots")
        .createSignedUrl(order.payment_screenshot_url, 60 * 10);

      if (error) {
        console.error("Screenshot URL error:", error);
        alert("Could not load payment screenshot: " + error.message);
      } else {
        setScreenshotUrl(data?.signedUrl || "");
      }
    }
  };

  const updateOrderStatus = async (orderId, status, paymentStatus) => {
    const confirmText =
      status === "success"
        ? "Mark this payment as SUCCESS?"
        : "Cancel this order?";

    if (!window.confirm(confirmText)) return;

    setUpdatingOrder(orderId);

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        payment_status: paymentStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      alert(error.message);
      setUpdatingOrder(null);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              payment_status: paymentStatus,
            }
          : order
      )
    );

    setSelectedOrder((current) =>
      current?.id === orderId
        ? {
            ...current,
            status,
            payment_status: paymentStatus,
          }
        : current
    );

    setUpdatingOrder(null);
    alert(
      status === "success"
        ? "Order marked as SUCCESS ✅"
        : "Order marked as CANCELLED ❌"
    );
  };

  const getStatusClass = (status) => {
    if (status === "success") return "status-success";
    if (status === "cancelled") return "status-cancelled";
    return "status-pending";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-nav">
        <div className="dashboard-logo">
          AYUSH<span>OP</span>
        </div>

        <button className="admin-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
      </div>

      <div className="admin-container">
        <div className="admin-heading">
          <p className="dashboard-label">ADMIN PANEL</p>

          <h1>
            Store <span>Management</span>
          </h1>

          <p>Manage products, orders and payment verification.</p>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            📦 Products
          </button>

          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            🧾 Orders
            {orders.length > 0 && (
              <span className="order-count-badge">{orders.length}</span>
            )}
          </button>
        </div>

        {activeTab === "products" && (
          <>
            <div className="admin-form-card">
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <textarea
                  placeholder="Product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="admin-form-row">
                  <input
                    type="number"
                    placeholder="Price"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="image-upload-box">
                  <label>Product Image</label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] || null);
                    }}
                  />

                  {imageFile && (
                    <p className="selected-file">📷 {imageFile.name}</p>
                  )}

                  {imageUrl && !imageFile && (
                    <img
                      src={imageUrl}
                      alt="Current product"
                      className="admin-image-preview"
                    />
                  )}

                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="New product"
                      className="admin-image-preview"
                    />
                  )}
                </div>

    
            <div className="digital-file-box">
              <label>Digital Product File</label>

              <input
                type="file"
                onChange={(e) => {
                  setDigitalFile(e.target.files?.[0] || null);
                }}
              />

              {digitalFile && (
                <p className="selected-file">
                  📦 {digitalFile.name}
                </p>
              )}

              {!digitalFile && filePath && (
                <p className="existing-file">
                  ✓ Digital file already attached
                </p>
              )}

              <small>
                Upload the ZIP, PDF, PSD, project or other file customers will receive after successful payment.
              </small>
            </div>

            <div className="admin-form-buttons">
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Uploading..."
                      : editingId
                      ? "Update Product"
                      : "Add Product"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={resetForm}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-products">
              <div className="admin-products-header">
                <h2>Products</h2>
                <span>{products.length} Products</span>
              </div>

              {productsLoading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <div className="admin-product-list">
                  {products.map((product) => (
                    <div className="admin-product" key={product.id}>
                      <div className="admin-product-info">
                        <div className="admin-product-icon">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                          ) : (
                            "⚡"
                          )}
                        </div>

                        <div>
                          <h3>{product.name}</h3>
                          <p>{product.category}</p>
                          <strong>
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>

                      <div className="admin-product-actions">
                        <button onClick={() => editProduct(product)}>
                          ✏️ Edit
                        </button>

                        <button onClick={() => deleteProduct(product.id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="admin-orders">
            <div className="admin-orders-header">
              <div>
                <h2>Orders</h2>
                <p>Review payment screenshots and verify orders.</p>
              </div>

              <button
                className="secondary-btn"
                onClick={loadOrders}
                disabled={ordersLoading}
              >
                {ordersLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {ordersLoading ? (
              <div className="admin-empty">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="admin-empty">No orders found.</div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const itemCount = Array.isArray(order.items)
                    ? order.items.reduce(
                        (sum, item) => sum + Number(item.quantity || 0),
                        0
                      )
                    : 0;

                  return (
                    <div className="order-card" key={order.id}>
                      <div className="order-main">
                        <div>
                          <div className="order-title-row">
                            <h3>Order #{order.id}</h3>
                            <span className={getStatusClass(order.status)}>
                              {order.status || "pending"}
                            </span>
                          </div>

                          <p>
                            {order.customer_name ||
                              order.user_id ||
                              "Customer"}
                          </p>

                          <div className="order-meta">
                            <span>
                              💰 ₹
                              {Number(order.total).toLocaleString("en-IN")}
                            </span>
                            <span>📦 {itemCount} item(s)</span>
                            <span>🕒 {formatDate(order.created_at)}</span>
                          </div>
                        </div>

                        <button
                          className="view-order-btn"
                          onClick={() => openOrder(order)}
                        >
                          View Order →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <div className="order-modal-heading">
              <p className="dashboard-label">ORDER DETAILS</p>
              <h2>Order #{selectedOrder.id}</h2>
              <span className={getStatusClass(selectedOrder.status)}>
                {selectedOrder.status || "pending"}
              </span>
            </div>

            <div className="order-details-grid">
              <div className="order-detail-box">
                <h3>Customer</h3>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedOrder.customer_name || "-"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.customer_email || "-"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.customer_phone || "-"}
                </p>
              </div>

              <div className="order-detail-box">
                <h3>Payment</h3>
                <p>
                  <strong>Total:</strong> ₹
                  {Number(selectedOrder.total).toLocaleString("en-IN")}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedOrder.payment_status || "pending"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
            </div>

            <div className="order-detail-box">
              <h3>Products</h3>

              <div className="admin-order-items">
                {Array.isArray(selectedOrder.items) &&
                  selectedOrder.items.map((item) => (
                    <div className="admin-order-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>Qty: {item.quantity}</p>
                      </div>

                      <strong>
                        ₹
                        {(
                          Number(item.price) * Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
              </div>
            </div>

            <div className="order-detail-box">
              <h3>Payment Screenshot</h3>

              {screenshotUrl ? (
                <img
                  src={screenshotUrl}
                  alt="Customer payment proof"
                  className="payment-proof-image"
                />
              ) : selectedOrder.payment_screenshot_url ? (
                <p>Loading payment screenshot...</p>
              ) : (
                <div className="no-proof">No payment screenshot uploaded.</div>
              )}
            </div>

            <div className="order-actions">
              <button
                className="order-success-btn"
                disabled={
                  updatingOrder === selectedOrder.id ||
                  selectedOrder.status === "success"
                }
                onClick={() =>
                  updateOrderStatus(
                    selectedOrder.id,
                    "success",
                    "paid"
                  )
                }
              >
                ✓ Mark Success
              </button>

              <button
                className="order-cancel-btn"
                disabled={
                  updatingOrder === selectedOrder.id ||
                  selectedOrder.status === "cancelled"
                }
                onClick={() =>
                  updateOrderStatus(
                    selectedOrder.id,
                    "cancelled",
                    "failed"
                  )
                }
              >
                ✕ Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
