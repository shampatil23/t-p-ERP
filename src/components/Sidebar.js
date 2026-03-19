"use client";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import {
    HiOutlineHome,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineDocumentText,
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCog6Tooth,
    HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const navItems = [
    {
        section: "Main",
        items: [
            { label: "Dashboard", icon: HiOutlineHome, path: "/dashboard" },
            {
                label: "Placement Drives",
                icon: HiOutlineBriefcase,
                path: "/dashboard/drives",
            },
            {
                label: "Training Sessions",
                icon: HiOutlineAcademicCap,
                path: "/dashboard/sessions",
            },
            {
                label: "Weekly Reports",
                icon: HiOutlineDocumentText,
                path: "/dashboard/weekly-reports",
            },
        ],
    },
    {
        section: "Management",
        items: [
            {
                label: "Students",
                icon: HiOutlineUsers,
                path: "/dashboard/students",
            },
            {
                label: "Reports & Export",
                icon: HiOutlineChartBar,
                path: "/dashboard/reports",
            },
            {
                label: "AI Assistant",
                icon: HiOutlineChatBubbleLeftRight,
                path: "/dashboard/ai-assistant",
            },
        ],
    },
    {
        section: "System",
        items: [
            {
                label: "Settings",
                icon: HiOutlineCog6Tooth,
                path: "/dashboard/settings",
            },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
        router.push("/");
    };

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <HiOutlineChartBar />
                </div>
                <div className="sidebar-brand">
                    <h2>JSCOE ERP</h2>
                    <span>T&amp;P Department</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <div
                                key={item.path}
                                className={`nav-item ${pathname === item.path ? "active" : ""}`}
                                onClick={() => router.push(item.path)}
                            >
                                <span className="nav-icon">
                                    <item.icon />
                                </span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={handleSignOut}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="student-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                            {user?.displayName?.[0] || "U"}
                        </div>
                    )}
                    <div className="sidebar-user-info">
                        <h4>{user?.displayName || "User"}</h4>
                        <span>
                            <HiOutlineArrowRightOnRectangle style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                            Sign Out
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
