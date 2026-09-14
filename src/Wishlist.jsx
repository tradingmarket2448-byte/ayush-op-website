import { useEffect, useState } from "react";

function Wishlist({ onBack }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayushop_wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const remove = (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem("ayushop_wishlist", JSON.stringify(next));
  };

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("ayushop_cart") || "[]");
      const existing = cart.find((item) => item.id === product.id);

      const next = existing
        ? cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...cart, { ...product, quantity: 1 }];

      localStorage.setItem("ayushop_cart", JSON.stringify(next));
      alert("Added to cart 🛒");
    } catch {
      alert("Could not add to cart.");
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-nav">
        <div className="dashboard-logo">
          AYUSH<span>OP</span>
        </div>
        <button className="admin-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
      </div>

      <div className="wishlist-container">
        <div className="orders-heading">
          <p className="dashboard-label">MY ACCOUNT</p>
          <h1>
            My <span>Wishlist</span>
          </h1>
          <p>Your saved products.</p>
        </div>

        {items.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products from the store to see them here.</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((product) => (
              <div className="wishlist-card" key={product.id}>
                <div className="wishlist-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <span>⚡</span>
                  )}
                </div>

                <div className="wishlist-info">
                  <div className="product-category">
                    {product.category || "Digital"}
                  </div>
                  <h3>{product.name}</h3>
                  <strong>
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </strong>

                  <div className="wishlist-actions">
                    <button
                      className="secondary-btn"
                      onClick={() => remove(product.id)}
                    >
                      Remove
                    </button>
                    <button
                      className="primary-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
