"use client";
import { useEffect, useState } from "react";
import { ref, get, push, remove, child } from "firebase/database";
import { db } from "@/lib/firebase";
import { generateSessionReport } from "@/lib/reportGenerator";
import { generateReportContent, autoFillSessionFromText } from "@/lib/gemini";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDocumentArrowDown,
    HiOutlineSparkles,
    HiOutlineEye,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const initialForm = {
    rawInput: "",
    companyName: "",
    topic: "",
    date: "",
    time: "",
    batch: "",
    branches: "",
    academicYear: "",
    venue: "Seminar Hall",
    mode: "Offline",
    registeredCount: "",
    attendance: "",
    feedback: "",
    purpose: "",
    outcome: "",
    overview: "",
    trainerName: "",
    trainerContact: "",
    trainerEmail: "",
    trainerProfile: "",
    departmentAttendance: {
        CS: "",
        IT: "",
        ENTC: "",
        Mech: "",
    },
    photos: [],
};

export default function SessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewSession, setViewSession] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showExtractedData, setShowExtractedData] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const snapshot = await get(ref(db, "sessions"));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setSessions(list);
            } else {
                setSessions([]);
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

    const handleDeptChange = (dept, value) => {
        setForm({
            ...form,
            departmentAttendance: {
                ...form.departmentAttendance,
                [dept]: value,
            },
        });
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const results = await Promise.all(
                files.map((f) => uploadToCloudinary(f, "erp-sessions"))
            );
            setForm({
                ...form,
                photos: [...form.photos, ...results.map((r) => r.url)],
            });
            toast.success(`${files.length} photo(s) uploaded!`);
        } catch {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAutoFill = async () => {
        if (!form.rawInput || form.rawInput.trim().length < 10) {
            toast.error("Please paste the raw training data first");
            return;
        }
        setGenerating(true);
        try {
            const data = await autoFillSessionFromText(form.rawInput);
            setForm({
                ...form,
                companyName: data.companyName || form.companyName,
                topic: data.topic || form.topic,
                date: data.date || form.date,
                time: data.time || form.time,
                batch: data.batch || form.batch,
                branches: data.branches || form.branches,
                academicYear: data.academicYear || form.academicYear,
                venue: data.venue || form.venue,
                mode: data.mode || form.mode,
                registeredCount: data.registeredCount || form.registeredCount,
                attendance: data.attendance || form.attendance,
                feedback: data.feedback || form.feedback,
                purpose: data.purpose || form.purpose,
                outcome: data.outcome || form.outcome,
                overview: data.overview || form.overview,
                trainerName: data.trainerName || form.trainerName,
                trainerContact: data.trainerContact || form.trainerContact,
                trainerEmail: data.trainerEmail || form.trainerEmail,
                trainerProfile: data.trainerProfile || form.trainerProfile,
                departmentAttendance: data.departmentAttendance || form.departmentAttendance,
            });
            setShowExtractedData(true);
            toast.success("Data successfully extracted & organized!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to parse the text with AI");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!form.companyName || !form.topic) {
            toast.error("Process AI data or fill required fields first");
            return;
        }
        setSaving(true);
        try {
            await push(ref(db, "sessions"), {
                ...form,
                createdAt: new Date().toISOString(),
            });
            toast.success("Session saved!");
            setShowModal(false);
            setForm(initialForm);
            fetchSessions();
        } catch (err) {
            console.error("Save session error:", err);
            toast.error("Save failed: " + (err.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async (session) => {
        try {
            await generateSessionReport(session);
            toast.success("DOCX downloaded!");
        } catch (e) {
            toast.error("Export failed");
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this session report?")) return;
        try {
            await remove(child(ref(db), "sessions/" + id));
            toast.success("Deleted");
            fetchSessions();
        } catch {
            toast.error("Delete failed");
        }
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
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Training Sessions</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
                        Manage training & awareness session reports
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus /> New Session
                </button>
            </div>

            {loading ? (
                <div className="loading-screen" style={{ minHeight: 300 }}>
                    <div className="loading-spinner" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <h3>No Training Sessions Yet</h3>
                        <p>Create your first training session report.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={() => setShowModal(true)}
                        >
                            <HiOutlinePlus /> Create Session Report
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {sessions.map((s) => (
                        <div key={s.id} className="report-card">
                            <div className="report-card-header">
                                <span className="report-type-badge session">Session</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setViewSession(s)}
                                    >
                                        <HiOutlineEye /> View
                                    </button>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleExport(s)}
                                    >
                                        <HiOutlineDocumentArrowDown /> Export
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            </div>
                            <h3>
                                {s.topic} – {s.companyName}
                            </h3>
                            <p>
                                {s.purpose
                                    ? s.purpose.substring(0, 150) + "..."
                                    : s.overview
                                        ? s.overview.substring(0, 150) + "..."
                                        : "No details"}
                            </p>
                            <div className="report-meta">
                                <span>📅 {s.date}</span>
                                <span>🎓 Batch: {s.batch}</span>
                                <span>📋 {s.branches}</span>
                                <span>👥 Attendance: {s.attendance}</span>
                                <span>📍 {s.mode}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewSession && (
                <div className="modal-overlay" onClick={() => setViewSession(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{viewSession.topic}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setViewSession(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <table className="data-table">
                                <tbody>
                                    {[
                                        ["Report Type", "Session"],
                                        ["Company", viewSession.companyName],
                                        ["Topic", viewSession.topic],
                                        ["Batch", viewSession.batch],
                                        ["Branch", viewSession.branches],
                                        ["AY", viewSession.academicYear],
                                        ["Date", viewSession.date],
                                        ["Time", viewSession.time],
                                        ["Registered", viewSession.registeredCount],
                                        ["Attendance", viewSession.attendance],
                                        ["Mode", viewSession.mode],
                                        ["Venue", viewSession.venue],
                                        ["Trainer", viewSession.trainerName],
                                        ["Purpose", viewSession.purpose],
                                        ["Outcome", viewSession.outcome],
                                    ].map(([l, v]) => (
                                        <tr key={l}>
                                            <td style={{ fontWeight: 600, width: "35%" }}>{l}</td>
                                            <td>{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {viewSession.departmentAttendance && (
                                <div style={{ marginTop: 20 }}>
                                    <h4 style={{ marginBottom: 8 }}>Department-wise Attendance</h4>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                {Object.keys(viewSession.departmentAttendance).map(
                                                    (d) => (
                                                        <th key={d}>{d}</th>
                                                    )
                                                )}
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                {Object.values(viewSession.departmentAttendance).map(
                                                    (v, i) => (
                                                        <td key={i}>{v || 0}</td>
                                                    )
                                                )}
                                                <td>
                                                    {Object.values(
                                                        viewSession.departmentAttendance
                                                    ).reduce((s, v) => s + Number(v || 0), 0)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-success"
                                onClick={() => handleExport(viewSession)}
                            >
                                <HiOutlineDocumentArrowDown /> Export DOCX
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setViewSession(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div
                        className="modal"
                        style={{ maxWidth: 900 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Create Session Report</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Raw Data Input Zone */}
                            <div className="card" style={{ padding: "16px", marginBottom: "20px", background: "var(--bg-secondary)", border: "1px solid var(--accent-primary)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-primary)" }}>
                                        <HiOutlineSparkles style={{ display: 'inline', marginRight: 6 }} />
                                        Bulk Data Entry
                                    </h3>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={handleAutoFill}
                                        disabled={generating}
                                    >
                                        <HiOutlineSparkles /> {generating ? "Extracting Data..." : "Process with AI"}
                                    </button>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "12px" }}>
                                    Paste raw training data, logs, or informal notes here. Our AI will automatically extract and organize it into the proper report fields.
                                </p>
                                <textarea
                                    className="form-textarea"
                                    name="rawInput"
                                    value={form.rawInput}
                                    onChange={handleChange}
                                    disabled={generating}
                                    placeholder="e.g. Total 45 students from CSE and IT attended the webinar on Cloud Computing by Mr. Rajesh today at 11am in Seminar Hall..."
                                    style={{ height: "120px" }}
                                />
                            </div>

                            {/* Extracted Data Review Zone */}
                            {showExtractedData && (
                                <div className="card fade-in" style={{ padding: "16px", marginBottom: "20px" }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                                        Extracted Information (Review & Edit)
                                    </h3>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Company / Organization *</label>
                                            <input className="form-input" name="companyName" value={form.companyName} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Topic *</label>
                                            <input className="form-input" name="topic" value={form.topic} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row-3">
                                        <div className="form-group">
                                            <label className="form-label">Date *</label>
                                            <input type="date" className="form-input" name="date" value={form.date} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Time</label>
                                            <input type="time" className="form-input" name="time" value={form.time} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Academic Year</label>
                                            <input className="form-input" name="academicYear" value={form.academicYear} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row-3">
                                        <div className="form-group">
                                            <label className="form-label">Batch</label>
                                            <input className="form-input" name="batch" value={form.batch} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Branches</label>
                                            <input className="form-input" name="branches" value={form.branches} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Mode</label>
                                            <select className="form-select" name="mode" value={form.mode} onChange={handleChange}>
                                                <option>Offline</option>
                                                <option>Online</option>
                                                <option>Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Venue</label>
                                            <input className="form-input" name="venue" value={form.venue} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Trainer Name</label>
                                            <input className="form-input" name="trainerName" value={form.trainerName} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Registered</label>
                                            <input type="number" className="form-input" name="registeredCount" value={form.registeredCount} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Attendance</label>
                                            <input type="number" className="form-input" name="attendance" value={form.attendance} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 8px" }}>Department-wise Attendance</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                                        {Object.keys(form.departmentAttendance).map((dept) => (
                                            <div className="form-group" key={dept}>
                                                <label className="form-label">{dept}</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={form.departmentAttendance[dept]}
                                                    onChange={(e) => handleDeptChange(dept, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="form-group" style={{ marginTop: 16 }}>
                                        <label className="form-label">Purpose</label>
                                        <textarea className="form-textarea" name="purpose" value={form.purpose} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Overview</label>
                                        <textarea className="form-textarea" name="overview" value={form.overview} onChange={handleChange} style={{ height: 100 }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Outcome & Feedback</label>
                                        <textarea className="form-textarea" name="outcome" value={form.outcome} onChange={handleChange} />
                                    </div>
                                </div>
                            )}

                            {/* Photos */}
                            <div className="form-group">
                                <label className="form-label">Photos</label>
                                <div className="file-upload-zone">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: "none" }}
                                        id="session-photos"
                                    />
                                    <label
                                        htmlFor="session-photos"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="file-upload-icon">📸</div>
                                        <h4>
                                            {uploading ? "Uploading..." : "Click to upload photos"}
                                        </h4>
                                        <p>Support JPG, PNG images</p>
                                    </label>
                                </div>
                                {form.photos.length > 0 && (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            marginTop: 12,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {form.photos.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt=""
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                    border: "1px solid var(--border-color)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
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
                                {saving ? "Saving..." : "Save Session Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
