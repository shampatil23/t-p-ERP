"use client";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import {
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineArrowTrendingUp,
    HiOutlineCalendarDays,
} from "react-icons/hi2";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalDrives: 0,
        totalSessions: 0,
        totalStudents: 0,
        totalReports: 0,
    });
    const [recentDrives, setRecentDrives] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchWithTimeout = (promise, ms = 5000) => {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms)
        );
        return Promise.race([promise, timeout]);
    };

    const fetchDashboardData = async () => {
        try {
            const results = await Promise.allSettled([
                fetchWithTimeout(get(ref(db, "drives"))),
                fetchWithTimeout(get(ref(db, "sessions"))),
                fetchWithTimeout(get(ref(db, "students"))),
                fetchWithTimeout(get(ref(db, "weeklyReports"))),
            ]);

            const getValue = (result) =>
                result.status === "fulfilled" && result.value.exists()
                    ? result.value.val()
                    : {};

            const drivesData = getValue(results[0]);
            const sessionsData = getValue(results[1]);
            const studentsData = getValue(results[2]);
            const reportsData = getValue(results[3]);

            setStats({
                totalDrives: Object.keys(drivesData).length,
                totalSessions: Object.keys(sessionsData).length,
                totalStudents: Object.keys(studentsData).length,
                totalReports: Object.keys(reportsData).length,
            });

            const drivesList = Object.keys(drivesData).map((k) => ({
                id: k,
                ...drivesData[k],
            }));
            const sessionsList = Object.keys(sessionsData).map((k) => ({
                id: k,
                ...sessionsData[k],
            }));

            setRecentDrives(
                drivesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
            );
            setRecentSessions(
                sessionsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
            );
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: "Placement Drives",
            value: stats.totalDrives,
            icon: <HiOutlineBriefcase />,
            color: "blue",
            trend: "+3 this month",
        },
        {
            label: "Training Sessions",
            value: stats.totalSessions,
            icon: <HiOutlineAcademicCap />,
            color: "purple",
            trend: "+5 this month",
        },
        {
            label: "Total Students",
            value: stats.totalStudents,
            icon: <HiOutlineUsers />,
            color: "green",
            trend: "Active records",
        },
        {
            label: "Weekly Reports",
            value: stats.totalReports,
            icon: <HiOutlineDocumentText />,
            color: "orange",
            trend: "Generated",
        },
    ];

    return (
        <div>
            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={`stat-card fade-in fade-in-delay-${index + 1}`}
                    >
                        <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-trend up">
                            <HiOutlineArrowTrendingUp />
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid-2">
                {/* Recent Placement Drives */}
                <div className="card fade-in fade-in-delay-2">
                    <div className="card-header">
                        <h3>Recent Placement Drives</h3>
                        <span className="badge badge-primary">
                            {recentDrives.length} entries
                        </span>
                    </div>
                    <div className="card-body">
                        {recentDrives.length === 0 ? (
                            <div className="empty-state" style={{ padding: "30px" }}>
                                <HiOutlineBriefcase
                                    className="empty-state-icon"
                                    style={{ fontSize: 40 }}
                                />
                                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                                    No placement drives yet. Create your first drive!
                                </p>
                            </div>
                        ) : (
                            <ul className="activity-list">
                                {recentDrives.map((drive) => (
                                    <li key={drive.id} className="activity-item">
                                        <span className="activity-dot" />
                                        <div className="activity-content">
                                            <h4>
                                                {drive.companyName} - {drive.batch}
                                            </h4>
                                            <p>
                                                <HiOutlineCalendarDays
                                                    style={{
                                                        display: "inline",
                                                        verticalAlign: "middle",
                                                        marginRight: 4,
                                                    }}
                                                />
                                                {drive.date} • {drive.attendance || 0} attended
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recent Training Sessions */}
                <div className="card fade-in fade-in-delay-3">
                    <div className="card-header">
                        <h3>Recent Training Sessions</h3>
                        <span className="badge badge-primary">
                            {recentSessions.length} entries
                        </span>
                    </div>
                    <div className="card-body">
                        {recentSessions.length === 0 ? (
                            <div className="empty-state" style={{ padding: "30px" }}>
                                <HiOutlineAcademicCap
                                    className="empty-state-icon"
                                    style={{ fontSize: 40 }}
                                />
                                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                                    No training sessions yet. Create your first session!
                                </p>
                            </div>
                        ) : (
                            <ul className="activity-list">
                                {recentSessions.map((session) => (
                                    <li key={session.id} className="activity-item">
                                        <span className="activity-dot green" />
                                        <div className="activity-content">
                                            <h4>
                                                {session.topic} – {session.companyName}
                                            </h4>
                                            <p>
                                                <HiOutlineCalendarDays
                                                    style={{
                                                        display: "inline",
                                                        verticalAlign: "middle",
                                                        marginRight: 4,
                                                    }}
                                                />
                                                {session.date} • {session.attendance || 0} attended
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card fade-in fade-in-delay-4">
                <div className="card-header">
                    <h3>Quick Actions</h3>
                </div>
                <div
                    className="card-body"
                    style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                >
                    <a href="/dashboard/drives" className="btn btn-primary">
                        <HiOutlineBriefcase /> New Drive Report
                    </a>
                    <a href="/dashboard/sessions" className="btn btn-secondary">
                        <HiOutlineAcademicCap /> New Session Report
                    </a>
                    <a href="/dashboard/weekly-reports" className="btn btn-outline">
                        <HiOutlineDocumentText /> New Weekly Report
                    </a>
                    <a href="/dashboard/students" className="btn btn-outline">
                        <HiOutlineUsers /> Manage Students
                    </a>
                    <a href="/dashboard/ai-assistant" className="btn btn-success">
                        ✨ AI Assistant
                    </a>
                </div>
            </div>
        </div>
    );
}
