"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const features = [
  { icon: <HiOutlineBriefcase />, text: "Placement Drive Reports & DOCX Export" },
  { icon: <HiOutlineAcademicCap />, text: "Training & Awareness Session Management" },
  { icon: <HiOutlineUsers />, text: "Student Database & Records" },
  { icon: <HiOutlineDocumentText />, text: "HOD Weekly Report Generation" },
  { icon: <HiOutlineSparkles />, text: "AI-Powered Report Assistant" },
];

export default function LoginPage() {
  const { user, loading, signInWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome to JSCOE T&P ERP!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Sign-in failed. Please try again.");
      console.error(error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        toast.success("Welcome back!");
      } else {
        await signUpWithEmail(email, password, name);
        toast.success("Account created successfully!");
      }
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        toast.error("Invalid email or password.");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already in use.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else {
        toast.error(isLogin ? "Login failed. Please try again." : "Sign up failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="login-page">
      {/* ── Background Video ── */}
      <div className="login-video-bg">
        <video autoPlay muted loop playsInline>
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
          {/* Fallback secondary source */}
          <source
            src="https://videos.pexels.com/video-files/5527827/5527827-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="login-video-overlay" />
      </div>

      {/* ── Main Content ── */}
      <div className="login-content">
        {/* Left Panel */}
        <div className="login-info">
          <div className="login-info-eyebrow">
            🎓 &nbsp; JSPM&apos;s JSCOE &nbsp;·&nbsp; T&amp;P Department
          </div>

          <h1 className="login-info-title">
            Training &amp; <br />
            <span className="highlight">Placement ERP</span>
          </h1>

          <p className="login-info-subtitle">
            A centralized platform to manage, track, and report all campus placement
            and training activities — powered by AI.
          </p>

          <div className="login-features">
            {features.map((f, i) => (
              <div key={i} className="login-feature-item">
                <div className="login-feature-dot">{f.icon}</div>
                <span className="login-feature-text">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-stats">
            <div className="login-stat">
              <div className="login-stat-num">500+</div>
              <div className="login-stat-label">Students Placed</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-num">80+</div>
              <div className="login-stat-label">Companies Visited</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-num">100%</div>
              <div className="login-stat-label">Digital Reports</div>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="login-card">
          <div className="login-card-icon">🎓</div>

          <div className="login-card-title">
            {isLogin ? "Welcome back" : "Create account"}
          </div>
          <div className="login-card-sub">
            {isLogin
              ? "Sign in to your T&P ERP account"
              : "Register to access the system"}
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@jscoe.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px 20px", fontSize: "14.5px", borderRadius: 12 }}
              disabled={signingIn}
            >
              {signingIn ? "Please wait..." : isLogin ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or continue with</span>
            <div className="login-divider-line" />
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            style={{ borderRadius: 12 }}
          >
            <FcGoogle size={20} />
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="login-switch-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="login-switch-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
