import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Admin from "./Admin";
import MyOrders from "./MyOrders";
import Wishlist from "./Wishlist";
import MyCart from "./MyCart";
import Settings from "./Settings";

function Dashboard({ user, onLogout, onBack }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      }
    };

    if (user?.id) checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (view === "admin" && isAdmin) {
    return <Admin onBack={() => setView("dashboard")} />;
  }

  if (view === "orders") {
    return (
      <MyOrders
        user={user}
        onBack={() => setView("dashboard")}
      />
    );
  }

  if (view === "wishlist") {
    return <Wishlist onBack={() => setView("dashboard")} />;
  }

  if (view === "cart") {
    return <MyCart onBack={() => setView("dashboard")} />;
  }

  if (view === "settings") {
    return <Settings user={user} onBack={() => setView("dashboard")} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-nav">
        <div className="dashboard-logo">
          AYUSH<span>OP</span>
        </div>

        <div className="dashboard-nav-actions">
          {isAdmin && (
            <button
              onClick={() => setView("admin")}
              className="admin-btn"
            >
              ⚡ Admin Panel
            </button>
          )}

          <button onClick={onBack} className="account-back-btn">
            ← Website
          </button>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-box">
          <p className="dashboard-label">MY ACCOUNT</p>

          <h1>
            Welcome back,
            <br />
            <span>
              {user?.user_metadata?.full_name || "User"} 👋
            </span>
          </h1>

          <p className="dashboard-email">{user?.email}</p>
        </div>

        <div className="dashboard-grid">
          <button
            className="dash-card dash-card-button"
            onClick={() => setView("orders")}
          >
            <div className="dash-icon">📦</div>
            <h3>My Orders</h3>
            <p>View your orders and purchases.</p>
            <span className="dash-card-link">Open Orders →</span>
          </button>

          <button
            className="dash-card dash-card-button"
            onClick={() => setView("wishlist")}
          >
            <div className="dash-icon">❤️</div>
            <h3>Wishlist</h3>
            <p>Your saved products.</p>
            <span className="dash-card-link">Open Wishlist →</span>
          </button>

          <button
            className="dash-card dash-card-button"
            onClick={() => setView("cart")}
          >
            <div className="dash-icon">🛒</div>
            <h3>My Cart</h3>
            <p>Products ready for checkout.</p>
            <span className="dash-card-link">Open Cart →</span>
          </button>

          <button
            className="dash-card dash-card-button"
            onClick={() => setView("settings")}
          >
            <div className="dash-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Manage your profile and password.</p>
            <span className="dash-card-link">Open Settings →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
