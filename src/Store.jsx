import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Checkout from "./Checkout";

function Store() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [buyNowCart, setBuyNowCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayushop_cart") || "[]");
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayushop_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    localStorage.setItem("ayushop_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ayushop_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Products error:", error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  const toggleWishlist = (product) => {
    setWishlist((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];
    });
  };

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setSelectedProduct(null);
  };

  const buyNow = (product) => {
    setBuyNowCart([{ ...product, quantity: 1 }]);
    setSelectedProduct(null);
    setShowCheckout(true);
  };

  const updateQuantity = (id, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const categories = [
    "All",
    ...Array.from(
      new Set(
        products
          .map((product) => product.category?.trim())
          .filter(Boolean)
      )
    ),
  ];

  const filteredProducts = [...products]
    .filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    })
    .filter((product) => {
      if (selectedCategory === "All") return true;
      return product.category === selectedCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "name-a") {
        return String(a.name).localeCompare(String(b.name));
      }

      if (sortBy === "name-z") {
        return String(b.name).localeCompare(String(a.name));
      }

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  if (showCheckout) {
    const checkoutCart = buyNowCart.length > 0 ? buyNowCart : cart;
    const checkoutTotal = checkoutCart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );

    return (
      <Checkout
        cart={checkoutCart}
        total={checkoutTotal}
        onBack={() => {
          setShowCheckout(false);
          setBuyNowCart([]);
        }}
        onSuccess={() => {
          if (buyNowCart.length > 0) {
            setBuyNowCart([]);
          } else {
            setCart([]);
            localStorage.removeItem("ayushop_cart");
          }
          setShowCheckout(false);
        }}
      />
    );
  }

  return (
    <section className="real-store" id="store">
      <div className="store-header">
        <div>
          <div className="section-label">DIGITAL STORE</div>
          <h2 className="store-title">
            Explore <span>Products</span>
          </h2>
          <p>Premium digital products created by AYUSH OP.</p>
        </div>

        <div className="store-header-actions">
          <button
            className="wishlist-button"
            onClick={() => {
              document.getElementById("store-wishlist")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          >
            ❤️ {wishlist.length}
          </button>

          <button
            className="cart-button"
            onClick={() => setShowCart(true)}
          >
            🛒 Cart ({cartItemCount})
          </button>
        </div>
      </div>

      {loading && (
        <div className="products-grid product-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="product-card product-skeleton-card" key={index}>
              <div className="skeleton skeleton-image"></div>
              <div className="product-info">
                <div className="skeleton skeleton-line skeleton-small"></div>
                <div className="skeleton skeleton-line skeleton-title"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line skeleton-short"></div>
                <div className="skeleton skeleton-bottom"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="store-controls">
            <div className="store-search-wrap">
              <span className="store-search-icon">⌕</span>
              <input
                type="search"
                className="store-search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="store-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="store-filter-row">
              <div className="category-chips">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-chip ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <select
                className="store-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-a">Name: A to Z</option>
                <option value="name-z">Name: Z to A</option>
              </select>
            </div>

            <div className="store-results-count">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const wished = wishlist.some((item) => item.id === product.id);

                return (
                  <div className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <span>⚡</span>
                      )}

                      <button
                        className={`product-wishlist ${
                          wished ? "active" : ""
                        }`}
                        onClick={() => toggleWishlist(product)}
                        aria-label="Toggle wishlist"
                      >
                        {wished ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="product-info">
                      <div className="product-category">
                        {product.category || "Digital"}
                      </div>

                      <h3>{product.name}</h3>
                      <p>{product.description}</p>

                      <div className="product-bottom">
                        <strong>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div className="product-card-actions">
                        <button
                          className="quick-add-btn"
                          onClick={() => addToCart(product)}
                        >
                          + Quick Add
                        </button>

                        <button
                          className="buy-now-btn"
                          onClick={() => buyNow(product)}
                        >
                          Buy Now →
                        </button>
                      </div>

                      <button
                        className="product-view-btn"
                        onClick={() => setSelectedProduct(product)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="store-loading">
              <div className="no-results-icon">⌕</div>
              <h3>No products found</h3>
              <p>Try a different search or category.</p>
              <button
                className="secondary-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      {!loading && products.length === 0 && (
        <div className="store-loading">No products available.</div>
      )}

      {selectedProduct && (
        <div
          className="store-modal"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-details"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>

            <div className="product-details-image">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                />
              ) : (
                <span>⚡</span>
              )}
            </div>

            <div className="product-details-content">
              <div className="product-category">
                {selectedProduct.category || "Digital"}
              </div>

              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>

              <div className="details-price">
                ₹{Number(selectedProduct.price).toLocaleString("en-IN")}
              </div>

              <div className="product-detail-actions">
                <button
                  className="secondary-btn"
                  onClick={() => toggleWishlist(selectedProduct)}
                >
                  {wishlist.some((item) => item.id === selectedProduct.id)
                    ? "♥ Saved"
                    : "♡ Wishlist"}
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => addToCart(selectedProduct)}
                >
                  Add to Cart 🛒
                </button>

                <button
                  className="primary-btn"
                  onClick={() => buyNow(selectedProduct)}
                >
                  Buy Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <h3>{item.name}</h3>

                        <div className="quantity-control">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>

                        <p>
                          ₹
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                </div>

                <button
                  className="primary-btn checkout-btn"
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                >
                  Proceed to Checkout →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Store;
