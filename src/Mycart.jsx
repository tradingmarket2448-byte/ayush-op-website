import { useState } from "react";
import Checkout from "./Checkout";

function MyCart({ onBack }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayushop_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [showCheckout, setShowCheckout] = useState(false);

  const updateQuantity = (id, change) => {
    const next = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + change }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(next);
    localStorage.setItem("ayushop_cart", JSON.stringify(next));
  };

  const remove = (id) => {
    const next = cart.filter((item) => item.id !== id);
    setCart(next);
    localStorage.setItem("ayushop_cart", JSON.stringify(next));
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (showCheckout) {
    return (
      <Checkout
        cart={cart}
        total={total}
        onBack={() => setShowCheckout(false)}
        onSuccess={() => {
          setCart([]);
          localStorage.removeItem("ayushop_cart");
          setShowCheckout(false);
          onBack();
        }}
      />
    );
  }

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
            My <span>Cart</span>
          </h1>
          <p>Products ready for checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add products from the store before checkout.</p>
          </div>
        ) : (
          <div className="cart-page-list">
            {cart.map((item) => (
              <div className="cart-page-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    ₹{Number(item.price).toLocaleString("en-IN")} ×{" "}
                    {item.quantity}
                  </p>
                </div>

                <div className="cart-page-actions">
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>

                  <strong>
                    ₹
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString("en-IN")}
                  </strong>

                  <button
                    className="secondary-btn"
                    onClick={() => remove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-page-total">
              <span>Total</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button
              className="primary-btn cart-page-checkout"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCart;
