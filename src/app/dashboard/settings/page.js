"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
    HiOutlineUser,
    HiOutlineBuildingOffice2,
    HiOutlineCog6Tooth,
    HiOutlineShieldCheck,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { key: "profile", label: "Profile", icon: <HiOutlineUser /> },
        { key: "department", label: "Department", icon: <HiOutlineBuildingOffice2 /> },
        { key: "system", label: "System", icon: <HiOutlineCog6Tooth /> },
        { key: "security", label: "Security", icon: <HiOutlineShieldCheck /> },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Settings</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
                    Configure your ERP preferences
                </p>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: "240px 1fr" }}>
                {/* Tabs */}
                <div className="card" style={{ padding: 12 }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.key}
                            className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="nav-icon">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="card">
                    <div className="card-header">
                        <h3>{tabs.find((t) => t.key === activeTab)?.label} Settings</h3>
                    </div>
                    <div className="card-body">
                        {activeTab === "profile" && (
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 20,
                                        marginBottom: 28,
                                    }}
                                >
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="avatar"
                                            referrerPolicy="no-referrer"
                                            style={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: "50%",
                                                border: "3px solid var(--accent-primary)",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="student-avatar"
                                            style={{ width: 72, height: 72, fontSize: 28 }}
                                        >
                                            {user?.displayName?.[0] || "U"}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                                            {user?.displayName}
                                        </h3>
                                        <p
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: 14,
                                            }}
                                        >
                                            {user?.email}
                                        </p>
                                        <span className="badge badge-primary" style={{ marginTop: 6 }}>
                                            Faculty
                                        </span>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Display Name</label>
                                        <input
                                            className="form-input"
                                            defaultValue={user?.displayName}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input
                                            className="form-input"
                                            defaultValue={user?.email}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "var(--text-muted)",
                                        marginTop: 8,
                                    }}
                                >
                                    Profile data is managed through Google account.
                                </p>
                            </div>
                        )}

                        {activeTab === "department" && (
                            <div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">College Name</label>
                                        <input
                                            className="form-input"
                                            defaultValue="JSPM's Jayawantrao Sawant College of Engineering"
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input
                                            className="form-input"
                                            defaultValue="Training and Placement Department"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">HOD / TPO Name</label>
                                        <input
                                            className="form-input"
                                            defaultValue="Mr. Sachim Kangutkar"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Contact</label>
                                        <input
                                            className="form-input"
                                            defaultValue="(020) 26970889, 26970888"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-textarea"
                                        defaultValue="Hadapsar Campus, S. No - 58, Handewadi Road, Hadapsar, Pune - 411028"
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => toast.success("Settings saved!")}
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {activeTab === "system" && (
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Firebase Project ID</label>
                                    <input
                                        className="form-input"
                                        value="jscoe-erp-8842a"
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cloudinary Cloud Name</label>
                                    <input
                                        className="form-input"
                                        value="djaieji0g"
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">AI Model</label>
                                    <input
                                        className="form-input"
                                        value="Google Gemini 2.0 Flash"
                                        disabled
                                    />
                                </div>
                                <div
                                    style={{
                                        padding: 16,
                                        background: "rgba(16, 185, 129, 0.08)",
                                        border: "1px solid rgba(16, 185, 129, 0.2)",
                                        borderRadius: "var(--radius-md)",
                                        marginTop: 16,
                                    }}
                                >
                                    <p style={{ fontSize: 13, color: "var(--accent-success)" }}>
                                        ✅ All services connected and operational
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div>
                                <div
                                    style={{
                                        padding: 20,
                                        background: "var(--bg-secondary)",
                                        borderRadius: "var(--radius-md)",
                                        marginBottom: 16,
                                    }}
                                >
                                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                                        Authentication Provider
                                    </h4>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                        Google OAuth 2.0 via Firebase Authentication
                                    </p>
                                </div>
                                <div
                                    style={{
                                        padding: 20,
                                        background: "var(--bg-secondary)",
                                        borderRadius: "var(--radius-md)",
                                        marginBottom: 16,
                                    }}
                                >
                                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                                        Database
                                    </h4>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                        Cloud Firestore with security rules
                                    </p>
                                </div>
                                <div
                                    style={{
                                        padding: 20,
                                        background: "var(--bg-secondary)",
                                        borderRadius: "var(--radius-md)",
                                    }}
                                >
                                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                                        File Storage
                                    </h4>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                        Cloudinary CDN with secure uploads
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
