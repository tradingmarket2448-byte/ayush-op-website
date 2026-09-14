import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function Settings({ user, onBack }) {
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState("user");
  const [createdAt, setCreatedAt] = useState(user?.created_at || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      setProfileLoading(true);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name || user.user_metadata?.full_name || "");
        setRole(data.role || "user");
        setCreatedAt(data.created_at || user.created_at || "");
      }

      setProfileLoading(false);
    };

    loadProfile();
  }, [user]);

  const joinedDate = useMemo(() => {
    if (!createdAt) return "—";
    return new Date(createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [createdAt]);

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your name.");
      return;
    }

    setSaving(true);

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
      },
    });

    if (authError) {
      alert(authError.message);
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
      });

    if (profileError) {
      console.error("Profile update error:", profileError);
      alert(profileError.message);
      setSaving(false);
      return;
    }

    alert("Profile updated successfully! ✅");
    setSaving(false);
  };

  const changeEmail = async () => {
    const nextEmail = email.trim();

    if (!nextEmail) {
      alert("Please enter an email address.");
      return;
    }

    if (nextEmail === user?.email) {
      alert("This is already your current email.");
      return;
    }

    const confirmed = window.confirm(
      "Change your account email to " + nextEmail + "?"
    );

    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      email: nextEmail,
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    alert(
      "Email change requested. Check your email for the confirmation link."
    );
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert(error.message);
      setPasswordLoading(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    alert("Password changed successfully! ✅");
    setPasswordLoading(false);
  };

  if (profileLoading) {
    return (
      <div className="settings-page">
        <div className="settings-nav">
          <div className="dashboard-logo">
            AYUSH<span>OP</span>
          </div>
          <button className="admin-back-btn" onClick={onBack}>
            ← Dashboard
          </button>
        </div>

        <div className="settings-container">
          <div className="orders-empty">Loading account...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-nav">
        <div className="dashboard-logo">
          AYUSH<span>OP</span>
        </div>

        <button className="admin-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
      </div>

      <div className="settings-container">
        <div className="orders-heading">
          <p className="dashboard-label">MY ACCOUNT</p>
          <h1>
            Profile & <span>Settings</span>
          </h1>
          <p>Manage your account information and password.</p>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">👤</div>
              <div>
                <h2>Profile</h2>
                <p>Update your personal account information.</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="settings-form">
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />

              <label>Email Address</label>
              <div className="settings-email-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  autoComplete="email"
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={changeEmail}
                  disabled={saving}
                >
                  Update
                </button>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          <div className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">🔐</div>
              <div>
                <h2>Password</h2>
                <p>Set a new password for your account.</p>
              </div>
            </div>

            <form onSubmit={changePassword} className="settings-form">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />

              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />

              <button
                type="submit"
                className="primary-btn"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          <div className="settings-card settings-account-card">
            <div className="settings-card-heading">
              <div className="settings-icon">ℹ️</div>
              <div>
                <h2>Account Info</h2>
                <p>Your account details.</p>
              </div>
            </div>

            <div className="account-info-list">
              <div>
                <span>Account email</span>
                <strong>{user?.email || "—"}</strong>
              </div>

              <div>
                <span>Account type</span>
                <strong>
                  {role === "admin" ? "Administrator" : "Customer"}
                </strong>
              </div>

              <div>
                <span>Joined</span>
                <strong>{joinedDate}</strong>
              </div>

              <div>
                <span>User ID</span>
                <strong className="account-id">{user?.id || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="settings-card security-note-card">
            <div className="settings-card-heading">
              <div className="settings-icon">🛡️</div>
              <div>
                <h2>Security</h2>
                <p>Keep your account protected.</p>
              </div>
            </div>

            <div className="security-note">
              Password changes are handled securely through Supabase
              Authentication. Never share your password with anyone.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
