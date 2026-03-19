"use client";
import { useEffect, useState } from "react";
import { ref, get, push, remove, child } from "firebase/database";
import { db } from "@/lib/firebase";
import { generateDriveReport } from "@/lib/reportGenerator";
import { generateReportContent, autoFillDriveFromText } from "@/lib/gemini";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDocumentArrowDown,
    HiOutlineSparkles,
    HiOutlineEye,
    HiOutlinePhoto,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const initialForm = {
    companyName: "",
    date: "",
    time: "",
    batch: "",
    branches: "",
    academicYear: "",
    venue: "",
    mode: "Offline",
    criteria: "No backlogs",
    registeredCount: "",
    attendance: "",
    shortlisted: "",
    shortlistedInfo: "",
    hrFeedback: "Awaited",
    overview: "",
    driveDetails: "",
    selectedStudentsInfo: "",
    companyProfile: "",
    rounds: "",
    photos: [],
    rawInput: "", // For AI bulk entry
};

export default function DrivesPage() {
    const [drives, setDrives] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewDrive, setViewDrive] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showExtractedData, setShowExtractedData] = useState(false);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const snapshot = await get(ref(db, "drives"));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setDrives(list);
            } else {
                setDrives([]);
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

    const handleAutoFill = async () => {
        if (!form.rawInput) {
            toast.error("Please paste drive data first");
            return;
        }
        setGenerating(true);
        try {
            const data = await autoFillDriveFromText(form.rawInput);
            setForm({ ...form, ...data });
            setShowExtractedData(true);
            toast.success("Details extracted successfully!");
        } catch (e) {
            toast.error("AI couldn't extract details. Please fill manually.");
        } finally {
            setGenerating(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const uploadPromises = files.map((file) =>
                uploadToCloudinary(file, "erp-drives")
            );
            const results = await Promise.all(uploadPromises);
            setForm({
                ...form,
                photos: [...form.photos, ...results.map((r) => r.url)],
            });
            toast.success(`${files.length} photo(s) uploaded!`);
        } catch (error) {
            toast.error("Photo upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!form.companyName || !form.date) {
            toast.error("Please fill Company Name and Date first");
            return;
        }
        setGenerating(true);
        try {
            const aiContent = await generateReportContent("drive", form);
            setForm({
                ...form,
                overview: aiContent.summary || form.overview,
                driveDetails: aiContent.driveDetails || form.driveDetails,
                companyProfile: aiContent.companyProfile || form.companyProfile,
            });
            toast.success("AI content generated!");
        } catch (e) {
            toast.error("AI generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!form.companyName || !form.date || !form.batch) {
            toast.error("Please fill required fields");
            return;
        }
        setSaving(true);
        try {
            await push(ref(db, "drives"), {
                ...form,
                createdAt: new Date().toISOString(),
            });
            toast.success("Drive report saved!");
            setShowModal(false);
            setForm(initialForm);
            fetchDrives();
        } catch (e) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async (drive) => {
        try {
            await generateDriveReport(drive);
            toast.success("DOCX report downloaded!");
        } catch (e) {
            toast.error("Export failed");
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this drive report?")) return;
        try {
            await remove(child(ref(db), "drives/" + id));
            toast.success("Drive deleted");
            fetchDrives();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Placement Drives</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
                        Create and manage campus placement drive reports
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus /> New Drive
                </button>
            </div>

            {/* Drives List */}
            {loading ? (
                <div className="loading-screen" style={{ minHeight: 300 }}>
                    <div className="loading-spinner" />
                </div>
            ) : drives.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🏢</div>
                        <h3>No Placement Drives Yet</h3>
                        <p>
                            Create your first placement drive report to get started. Reports
                            can be exported as DOCX files matching the standard format.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={() => setShowModal(true)}
                        >
                            <HiOutlinePlus /> Create Drive Report
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {drives.map((drive) => (
                        <div key={drive.id} className="report-card">
                            <div className="report-card-header">
                                <span className="report-type-badge drive">Drive</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setViewDrive(drive)}
                                    >
                                        <HiOutlineEye /> View
                                    </button>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleExport(drive)}
                                    >
                                        <HiOutlineDocumentArrowDown /> Export DOCX
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(drive.id)}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            </div>
                            <h3>{drive.companyName}</h3>
                            <p>
                                {drive.driveDetails
                                    ? drive.driveDetails.substring(0, 150) + "..."
                                    : "No details provided"}
                            </p>
                            <div className="report-meta">
                                <span>📅 {drive.date}</span>
                                <span>🎓 Batch: {drive.batch}</span>
                                <span>📋 {drive.branches}</span>
                                <span>👥 Attended: {drive.attendance}</span>
                                <span>✅ Shortlisted: {drive.shortlisted}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewDrive && (
                <div className="modal-overlay" onClick={() => setViewDrive(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Drive Report – {viewDrive.companyName}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setViewDrive(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <table className="data-table">
                                <tbody>
                                    {[
                                        ["Report Type", "Drive"],
                                        ["Company Name", viewDrive.companyName],
                                        ["Batch", viewDrive.batch],
                                        ["Branch", viewDrive.branches],
                                        ["AY", viewDrive.academicYear],
                                        ["Date & Time", `${viewDrive.date} ${viewDrive.time}`],
                                        ["Venue", viewDrive.venue],
                                        ["Registered", viewDrive.registeredCount],
                                        ["Attendance", viewDrive.attendance],
                                        [
                                            "Shortlisted",
                                            viewDrive.shortlistedInfo || viewDrive.shortlisted,
                                        ],
                                        ["HR Feedback", viewDrive.hrFeedback],
                                        ["Mode", viewDrive.mode],
                                    ].map(([label, val]) => (
                                        <tr key={label}>
                                            <td style={{ fontWeight: 600, width: "40%" }}>
                                                {label}
                                            </td>
                                            <td>{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {viewDrive.overview && (
                                <div style={{ marginTop: 20 }}>
                                    <h4 style={{ marginBottom: 8, fontWeight: 700 }}>Overview</h4>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.7,
                                            fontSize: 14,
                                        }}
                                    >
                                        {viewDrive.overview}
                                    </p>
                                </div>
                            )}
                            {viewDrive.driveDetails && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ marginBottom: 8, fontWeight: 700 }}>
                                        Drive Details
                                    </h4>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.7,
                                            fontSize: 14,
                                        }}
                                    >
                                        {viewDrive.driveDetails}
                                    </p>
                                </div>
                            )}
                            {viewDrive.companyProfile && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ marginBottom: 8, fontWeight: 700 }}>
                                        Company Profile
                                    </h4>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.7,
                                            fontSize: 14,
                                        }}
                                    >
                                        {viewDrive.companyProfile}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-success"
                                onClick={() => handleExport(viewDrive)}
                            >
                                <HiOutlineDocumentArrowDown /> Export as DOCX
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setViewDrive(null)}
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
                            <h2>Create Drive Report</h2>
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
                                        Placement Data Bulk Entry
                                    </h3>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={handleAutoFill}
                                        disabled={generating}
                                    >
                                        <HiOutlineSparkles /> {generating ? "Extracting..." : "Process with AI"}
                                    </button>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "12px" }}>
                                    Paste placement drive mail, notes, or messages here. Our AI will automatically extract all drive details.
                                </p>
                                <textarea
                                    className="form-textarea"
                                    name="rawInput"
                                    value={form.rawInput}
                                    onChange={handleChange}
                                    placeholder="e.g. Jaro Education is visiting for placement drive for 2025 batch CSE/IT students on 15 Feb at 10am in Seminar Hall..."
                                    style={{ height: "120px" }}
                                />
                            </div>

                            {/* Extracted Data Review Zone */}
                            {(showExtractedData || true) && ( // Keeping fields visible for now but highlighting extraction
                                <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                                        Drive Information
                                    </h3>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Company Name *</label>
                                            <input className="form-input" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Jaro Education" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Academic Year *</label>
                                            <input className="form-input" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="e.g. 2025-2026" />
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
                                            <label className="form-label">Batch *</label>
                                            <input className="form-input" name="batch" value={form.batch} onChange={handleChange} placeholder="e.g. 2025" />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Branches</label>
                                            <input className="form-input" name="branches" value={form.branches} onChange={handleChange} placeholder="e.g. CSE, IT, ENTC, MECH" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Venue</label>
                                            <input className="form-input" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Seminar Hall" />
                                        </div>
                                    </div>

                                    <div className="form-row-3">
                                        <div className="form-group">
                                            <label className="form-label">Mode</label>
                                            <select className="form-select" name="mode" value={form.mode} onChange={handleChange}>
                                                <option>Offline</option>
                                                <option>Online</option>
                                                <option>Hybrid</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Criteria</label>
                                            <input className="form-input" name="criteria" value={form.criteria} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">HR Feedback</label>
                                            <input className="form-input" name="hrFeedback" value={form.hrFeedback} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row-3">
                                        <div className="form-group">
                                            <label className="form-label">Registered Count</label>
                                            <input type="number" className="form-input" name="registeredCount" value={form.registeredCount} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Attendance</label>
                                            <input type="number" className="form-input" name="attendance" value={form.attendance} onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Shortlisted</label>
                                            <input type="number" className="form-input" name="shortlisted" value={form.shortlisted} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Shortlisted Info</label>
                                        <input className="form-input" name="shortlistedInfo" value={form.shortlistedInfo} onChange={handleChange} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Rounds</label>
                                        <input className="form-input" name="rounds" value={form.rounds} onChange={handleChange} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Overview & Summary</label>
                                        <textarea className="form-textarea" name="overview" value={form.overview} onChange={handleChange} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Drive Details</label>
                                        <textarea className="form-textarea" name="driveDetails" value={form.driveDetails} onChange={handleChange} style={{ height: 100 }} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Selected Students Info</label>
                                        <textarea className="form-textarea" name="selectedStudentsInfo" value={form.selectedStudentsInfo} onChange={handleChange} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Company Profile</label>
                                        <textarea className="form-textarea" name="companyProfile" value={form.companyProfile} onChange={handleChange} />
                                    </div>
                                </div>
                            )}

                            {/* Photo Upload */}
                            <div className="form-group">
                                <label className="form-label">
                                    <HiOutlinePhoto style={{ verticalAlign: "middle" }} /> Photos
                                </label>
                                <div className="file-upload-zone">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: "none" }}
                                        id="drive-photos"
                                    />
                                    <label htmlFor="drive-photos" style={{ cursor: "pointer" }}>
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
                                                alt={`photo ${i + 1}`}
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
                                {saving ? "Saving..." : "Save Drive Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
