"use client";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import {
    generateDriveReport,
    generateSessionReport,
    generateWeeklyReport,
} from "@/lib/reportGenerator";
import {
    HiOutlineDocumentArrowDown,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineDocumentText,
    HiOutlineFunnel,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ReportsPage() {
    const [allReports, setAllReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        try {
            const [drivesSnap, sessionsSnap, weeklySnap] = await Promise.all([
                get(ref(db, "drives")),
                get(ref(db, "sessions")),
                get(ref(db, "weeklyReports")),
            ]);

            const drivesData = drivesSnap.exists() ? drivesSnap.val() : {};
            const sessionsData = sessionsSnap.exists() ? sessionsSnap.val() : {};
            const weeklyData = weeklySnap.exists() ? weeklySnap.val() : {};

            const drives = Object.keys(drivesData).map((k) => ({
                id: k,
                type: "drive",
                ...drivesData[k],
            }));
            const sessions = Object.keys(sessionsData).map((k) => ({
                id: k,
                type: "session",
                ...sessionsData[k],
            }));
            const weekly = Object.keys(weeklyData).map((k) => ({
                id: k,
                type: "weekly",
                ...weeklyData[k],
            }));

            const all = [...drives, ...sessions, ...weekly].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setAllReports(all);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (report) => {
        try {
            switch (report.type) {
                case "drive":
                    await generateDriveReport(report);
                    break;
                case "session":
                    await generateSessionReport(report);
                    break;
                case "weekly":
                    await generateWeeklyReport(report);
                    break;
            }
            toast.success("DOCX report downloaded!");
        } catch (e) {
            toast.error("Export failed");
            console.error(e);
        }
    };

    const handleExportAll = async () => {
        const filtered = getFilteredReports();
        toast.loading(`Exporting ${filtered.length} reports...`);
        for (const report of filtered) {
            try {
                await handleExport(report);
                await new Promise((r) => setTimeout(r, 500));
            } catch (e) {
                console.error(e);
            }
        }
        toast.dismiss();
        toast.success("All reports exported!");
    };

    const getFilteredReports = () => {
        let reports = allReports;
        if (activeTab !== "all") {
            reports = reports.filter((r) => r.type === activeTab);
        }
        if (search) {
            const s = search.toLowerCase();
            reports = reports.filter(
                (r) =>
                    r.companyName?.toLowerCase().includes(s) ||
                    r.topic?.toLowerCase().includes(s) ||
                    r.weekRange?.toLowerCase().includes(s) ||
                    r.batch?.toLowerCase().includes(s)
            );
        }
        return reports;
    };

    const filtered = getFilteredReports();

    const getReportTitle = (r) => {
        switch (r.type) {
            case "drive":
                return `Drive: ${r.companyName}`;
            case "session":
                return `Session: ${r.topic} – ${r.companyName}`;
            case "weekly":
                return `Weekly: ${r.weekRange}`;
            default:
                return "Report";
        }
    };

    const getReportIcon = (type) => {
        switch (type) {
            case "drive":
                return <HiOutlineBriefcase />;
            case "session":
                return <HiOutlineAcademicCap />;
            case "weekly":
                return <HiOutlineDocumentText />;
        }
    };

    const stats = {
        all: allReports.length,
        drive: allReports.filter((r) => r.type === "drive").length,
        session: allReports.filter((r) => r.type === "session").length,
        weekly: allReports.filter((r) => r.type === "weekly").length,
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Reports & Export</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
                        View all reports and export as DOCX documents
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleExportAll}>
                    <HiOutlineDocumentArrowDown /> Export All ({filtered.length})
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: "Total Reports", value: stats.all, color: "blue" },
                    { label: "Drive Reports", value: stats.drive, color: "purple" },
                    { label: "Session Reports", value: stats.session, color: "green" },
                    { label: "Weekly Reports", value: stats.weekly, color: "orange" },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs & Filters */}
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 20,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <div className="tabs">
                    {[
                        { key: "all", label: `All (${stats.all})` },
                        { key: "drive", label: `Drives (${stats.drive})` },
                        { key: "session", label: `Sessions (${stats.session})` },
                        { key: "weekly", label: `Weekly (${stats.weekly})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`tab ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
                    <HiOutlineFunnel className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="loading-screen" style={{ minHeight: 300 }}>
                    <div className="loading-spinner" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h3>No Reports Found</h3>
                        <p>Create reports from Drives, Sessions, or Weekly Reports pages.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {filtered.map((r) => (
                        <div
                            key={`${r.type}-${r.id}`}
                            className="card"
                            style={{ padding: "16px 20px" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div
                                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                                >
                                    <div
                                        className={`stat-icon ${r.type === "drive"
                                            ? "blue"
                                            : r.type === "session"
                                                ? "purple"
                                                : "green"
                                            }`}
                                        style={{ width: 40, height: 40, fontSize: 18 }}
                                    >
                                        {getReportIcon(r.type)}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: 15, fontWeight: 600 }}>
                                            {getReportTitle(r)}
                                        </h4>
                                        <p
                                            style={{
                                                fontSize: 12,
                                                color: "var(--text-muted)",
                                                marginTop: 2,
                                            }}
                                        >
                                            {r.date || r.weekRange} •{" "}
                                            {r.batch ? `Batch ${r.batch}` : ""}{" "}
                                            {r.academicYear ? `• AY ${r.academicYear}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span className={`report-type-badge ${r.type}`}>
                                        {r.type}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleExport(r)}
                                    >
                                        <HiOutlineDocumentArrowDown /> DOCX
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
