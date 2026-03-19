"use client";
import { useEffect, useState } from "react";
import { ref, get, push, remove, child } from "firebase/database";
import { db } from "@/lib/firebase";
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowDownTray,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const initialForm = {
    name: "",
    rollNo: "",
    branch: "",
    batch: "",
    email: "",
    phone: "",
    cgpa: "",
    backlogs: "0",
    status: "Active",
};

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [filterBranch, setFilterBranch] = useState("All");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const snapshot = await get(ref(db, "students"));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setStudents(list);
            } else {
                setStudents([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!form.name || !form.rollNo || !form.branch) {
            toast.error("Fill required fields");
            return;
        }
        setSaving(true);
        try {
            await push(ref(db, "students"), {
                ...form,
                createdAt: new Date().toISOString(),
            });
            toast.success("Student added!");
            setShowModal(false);
            setForm(initialForm);
            fetchStudents();
        } catch {
            toast.error("Failed to add student");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this student?")) return;
        try {
            await remove(child(ref(db), "students/" + id));
            toast.success("Student removed");
            fetchStudents();
        } catch {
            toast.error("Delete failed");
        }
    };

    const filtered = students.filter((s) => {
        const matchSearch =
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase());
        const matchBranch =
            filterBranch === "All" || s.branch === filterBranch;
        return matchSearch && matchBranch;
    });

    const branches = ["All", ...new Set(students.map((s) => s.branch).filter(Boolean))];

    const exportCSV = () => {
        const headers = "Name,Roll No,Branch,Batch,Email,Phone,CGPA,Backlogs,Status\n";
        const rows = filtered.map(
            (s) =>
                `${s.name},${s.rollNo},${s.branch},${s.batch},${s.email},${s.phone},${s.cgpa},${s.backlogs},${s.status}`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "students.csv";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported!");
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
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Student Database</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
                        {filtered.length} students • Manage student records
                    </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-outline" onClick={exportCSV}>
                        <HiOutlineArrowDownTray /> Export CSV
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <HiOutlinePlus /> Add Student
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div
                className="card"
                style={{ marginBottom: 20, padding: "16px 20px" }}
            >
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
                        <HiOutlineMagnifyingGlass className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search students by name, roll no, or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        style={{ width: 150 }}
                    >
                        {branches.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            {loading ? (
                <div className="loading-screen" style={{ minHeight: 300 }}>
                    <div className="loading-spinner" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🎓</div>
                        <h3>No Students Found</h3>
                        <p>
                            {search || filterBranch !== "All"
                                ? "No students match your search criteria."
                                : "Add your first student to the database."}
                        </p>
                        {!search && filterBranch === "All" && (
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: 20 }}
                                onClick={() => setShowModal(true)}
                            >
                                <HiOutlinePlus /> Add Student
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Roll No</th>
                                    <th>Branch</th>
                                    <th>Batch</th>
                                    <th>CGPA</th>
                                    <th>Backlogs</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="student-info">
                                                <div className="student-avatar">
                                                    {s.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                                        {s.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                        {s.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{s.rollNo}</td>
                                        <td>
                                            <span className="badge badge-primary">{s.branch}</span>
                                        </td>
                                        <td>{s.batch}</td>
                                        <td>{s.cgpa}</td>
                                        <td>{s.backlogs}</td>
                                        <td>
                                            <span
                                                className={`badge ${s.status === "Active"
                                                    ? "badge-success"
                                                    : s.status === "Placed"
                                                        ? "badge-primary"
                                                        : "badge-warning"
                                                    }`}
                                            >
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(s.id)}
                                            >
                                                <HiOutlineTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Student Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Student</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        className="form-input"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Student full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Roll Number *</label>
                                    <input
                                        className="form-input"
                                        name="rollNo"
                                        value={form.rollNo}
                                        onChange={handleChange}
                                        placeholder="e.g. 2021CSE001"
                                    />
                                </div>
                            </div>
                            <div className="form-row-3">
                                <div className="form-group">
                                    <label className="form-label">Branch *</label>
                                    <select
                                        className="form-select"
                                        name="branch"
                                        value={form.branch}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Branch</option>
                                        <option>CSE</option>
                                        <option>IT</option>
                                        <option>ENTC</option>
                                        <option>MECH</option>
                                        <option>ELECT</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Batch</label>
                                    <input
                                        className="form-input"
                                        name="batch"
                                        value={form.batch}
                                        onChange={handleChange}
                                        placeholder="e.g. 2025"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option>Active</option>
                                        <option>Placed</option>
                                        <option>Graduated</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        className="form-input"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="student@email.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        className="form-input"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">CGPA</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        name="cgpa"
                                        value={form.cgpa}
                                        onChange={handleChange}
                                        placeholder="e.g. 8.5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Active Backlogs</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="backlogs"
                                        value={form.backlogs}
                                        onChange={handleChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Add Student"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
