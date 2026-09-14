import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Store from "./Store";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

function App() {
  const [showAuth, setShowAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setAuthChecked(true);
      if (user) {
        setShowAuth(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        setShowAuth(false);
      } else {
        setShowDashboard(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Open account dashboard only when the user chooses it.
  if (user && showDashboard) {
    return (
      <Dashboard
        user={user}
        onLogout={() => {
          setUser(null);
          setShowDashboard(false);
          setShowAuth(true);
        }}
        onBack={() => setShowDashboard(false)}
      />
    );
  }

  // Wait until Supabase has checked the existing session.
  if (!authChecked) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-logo">
          AYUSH<span>OP</span>
        </div>
        <div className="app-loading-spinner"></div>
      </div>
    );
  }

  // Scroll to Store
  const goToStore = () => {
    document
      .getElementById("store")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="app">

      {/* Background Glow */}
      <div className="glow glow-blue"></div>
      <div className="glow glow-red"></div>

      {/* ================= NAVBAR ================= */}
      <nav className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="logo">AYUSH<span>OP</span></div>

        <button
          className={`menu-toggle ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="nav-links">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#portfolio" onClick={() => setMobileMenuOpen(false)}>Portfolio</a>

          <a
            href="#store"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              goToStore();
            }}
          >
            Store
          </a>

          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>

          <button
            className="mobile-account-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              if (user) {
                setShowDashboard(true);
              } else {
                setShowAuth(true);
              }
            }}
          >
            {user ? "My Account →" : "Sign In / Sign Up →"}
          </button>
        </div>

        <button
          className="signin-btn desktop-account-btn"
          onClick={() => {
            if (user) {
              setShowDashboard(true);
            } else {
              setShowAuth(true);
            }
          }}
        >
          {user ? "My Account" : "Sign In / Sign Up"}
        </button>
      </nav>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <button
          className="mobile-menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= HERO ================= */}
      <section className="hero" id="home">

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          <div className="badge">
            ✦ WELCOME TO MY DIGITAL WORLD
          </div>

          <h1>
            AYUSH
            <span>OP</span>
          </h1>

          <p>
            Creator • Developer • Digital Store
          </p>

          <p className="hero-description">
            I create modern digital experiences, creative projects
            and digital products.
          </p>

          <div className="hero-buttons">

            {/* Portfolio Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="primary-btn"
              onClick={() => {
                document
                  .getElementById("portfolio")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore Portfolio →
            </motion.button>

            {/* Store Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="secondary-btn"
              onClick={goToStore}
            >
              Visit Store →
            </motion.button>

          </div>

        </motion.div>

        {/* ================= 3D ORB ================= */}
        <motion.div
          className="orb"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="orb-inner">
            OP
          </div>
        </motion.div>

      </section>

      {/* ================= STATS ================= */}
      <section className="stats">

        <motion.div
          whileHover={{ y: -8 }}
          className="stat-card"
        >
          <h2>01</h2>
          <h3>Portfolio</h3>
          <p>My creative projects</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -8 }}
          className="stat-card"
        >
          <h2>02</h2>
          <h3>Digital Store</h3>
          <p>Products & services</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -8 }}
          className="stat-card"
        >
          <h2>03</h2>
          <h3>Experience</h3>
          <p>Things I create</p>
        </motion.div>

      </section>

      {/* ================= ABOUT ================= */}
      <section className="section" id="about">

        <div className="section-label">
          ABOUT ME
        </div>

        <h2 className="section-title">
          Building things
          <span> differently.</span>
        </h2>

        <p className="section-text">
          Welcome to AYUSH OP. This website is my personal portfolio
          and digital store where I showcase my work and products.
        </p>

      </section>

      {/* ================= PORTFOLIO ================= */}
      <section className="section" id="portfolio">

        <div className="section-label">
          MY WORK
        </div>

        <h2 className="section-title">
          Featured <span>Projects</span>
        </h2>

        <div className="project-grid">

          <div className="project-card">
            <div className="project-number">
              01
            </div>

            <h3>
              Creative Website
            </h3>

            <p>
              Modern animated web experience.
            </p>

            <button>
              View Project →
            </button>
          </div>

          <div className="project-card">
            <div className="project-number">
              02
            </div>

            <h3>
              Digital Store
            </h3>

            <p>
              Modern e-commerce experience.
            </p>

            <button
              onClick={goToStore}
            >
              View Store →
            </button>
          </div>

          <div className="project-card">
            <div className="project-number">
              03
            </div>

            <h3>
              My Projects
            </h3>

            <p>
              More projects coming soon.
            </p>

            <button>
              Explore →
            </button>
          </div>

        </div>

      </section>

      {/* ================= STORE ================= */}
      <Store />

      {/* ================= FOOTER ================= */}
      <footer id="contact">

        <div className="logo">
          AYUSH<span>OP</span>
        </div>

        <p>
          © 2026 AYUSH OP. All rights reserved.
        </p>

      </footer>

      {/* ================= AUTH OVERLAY ================= */}
      {showAuth && !user && (
        <div className="auth-overlay auth-required">

          <div className="auth-required-badge">
            🔐 Login required to access AYUSH OP
          </div>

          <Auth />

        </div>
      )}

    </div>
  );
}

export default App;