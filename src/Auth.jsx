import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    if (isLogin) {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Login successful! 🎉");
      }
    } else {
      // SIGN UP
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Account created! Please check your email for verification."
        );
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#050507",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          padding: "40px",
          borderRadius: "25px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h1
          style={{
            fontSize: "35px",
            fontWeight: "900",
            marginBottom: "10px",
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <p style={{ color: "#777", marginBottom: "30px" }}>
          {isLogin
            ? "Sign in to your AYUSH OP account."
            : "Create your AYUSH OP account."}
        </p>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              color: "#4d8cff",
              fontSize: "14px",
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#777" }}>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            style={{
              marginLeft: "8px",
              background: "none",
              border: "none",
              color: "#1680ff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg,#0969ff,#7430ff)",
  color: "white",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer",
};

export default Auth;