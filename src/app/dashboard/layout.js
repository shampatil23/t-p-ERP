"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const pageTitles = {
    "/dashboard": { title: "Dashboard", subtitle: "Overview & Analytics" },
    "/dashboard/drives": {
        title: "Placement Drives",
        subtitle: "Manage campus placement drives",
    },
    "/dashboard/sessions": {
        title: "Training Sessions",
        subtitle: "Manage training & awareness sessions",
    },
    "/dashboard/weekly-reports": {
        title: "Weekly Reports",
        subtitle: "HOD Weekly Report management",
    },
    "/dashboard/students": {
        title: "Students",
        subtitle: "Student database management",
    },
    "/dashboard/reports": {
        title: "Reports & Export",
        subtitle: "Generate & export DOCX reports",
    },
    "/dashboard/ai-assistant": {
        title: "AI Assistant",
        subtitle: "Gemini-powered report assistant",
    },
    "/dashboard/settings": {
        title: "Settings",
        subtitle: "System configuration",
    },
};

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!user) return null;

    const pageInfo = pageTitles[pathname] || {
        title: "Dashboard",
        subtitle: "",
    };

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main
                className="main-content"
                style={{ marginLeft: sidebarCollapsed ? 64 : 256 }}
            >
                <Topbar
                    title={pageInfo.title}
                    subtitle={pageInfo.subtitle}
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <div className="page-content">{children}</div>
            </main>
        </div>
    );
}
