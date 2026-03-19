"use client";
import {
    HiOutlineBars3,
    HiOutlineBell,
    HiOutlineMagnifyingGlass,
    HiOutlineHome,
    HiOutlineChevronRight,
} from "react-icons/hi2";

export default function Topbar({ title, subtitle, onToggleSidebar }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <button className="topbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
                    <HiOutlineBars3 />
                </button>
                <div className="topbar-title">
                    <h1 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <HiOutlineHome style={{ fontSize: 14, color: "var(--text-muted)" }} />
                        <HiOutlineChevronRight style={{ fontSize: 12, color: "var(--text-muted)" }} />
                        {title}
                    </h1>
                    {subtitle && <span>{subtitle}</span>}
                </div>
            </div>
            <div className="topbar-right">
                <button className="topbar-btn" aria-label="Search">
                    <HiOutlineMagnifyingGlass />
                </button>
                <button className="topbar-btn" aria-label="Notifications">
                    <HiOutlineBell />
                    <span className="badge-dot" />
                </button>
            </div>
        </div>
    );
}
