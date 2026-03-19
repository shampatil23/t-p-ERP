"use client";
import { useEffect, useState } from "react";
import { ref, get, push, remove, child } from "firebase/database";
import { db } from "@/lib/firebase";
import { generateWeeklyReport } from "@/lib/reportGenerator";
import { generateReportContent, autoFillWeeklyFromText } from "@/lib/gemini";
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDocumentArrowDown,
    HiOutlineSparkles,
    HiOutlineEye,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const emptyAgenda = { agenda: "", resolution: "", actionTaken: "" };
const initialForm = {
    weekRange: "",
    academicYear: "",
    hodName: "Mr. Sachim Kangutkar",
    summary: "",
    agendaItems: [{ ...emptyAgenda }],
    rawInput: "", // For AI bulk entry
};

export default function WeeklyReportsPage() {
    const [reports, setReports] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewReport, setViewReport] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const snapshot = await get(ref(db, "weeklyReports"));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setReports(list);
            } else {
                setReports([]);
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

    const handleAgendaChange = (index, field, value) => {
        const items = [...form.agendaItems];
        items[index] = { ...items[index], [field]: value };
        setForm({ ...form, agendaItems: items });
    };

    const addAgendaItem = () => {
        setForm({
            ...form,
            agendaItems: [...form.agendaItems, { ...emptyAgenda }],
        });
    };

    const removeAgendaItem = (index) => {
        if (form.agendaItems.length === 1) return;
        setForm({
            ...form,
            agendaItems: form.agendaItems.filter((_, i) => i !== index),
        });
    };

    const handleAutoFill = async () => {
        if (!form.rawInput) {
            toast.error("Please paste weekly notes first");
            return;
        }
        setGenerating(true);
        try {
            const data = await autoFillWeeklyFromText(form.rawInput);
            setForm({
                ...form,
                ...data,
                agendaItems: data.agendaItems?.length > 0 ? data.agendaItems : form.agendaItems
            });
            toast.success("Agenda items extracted!");
        } catch (e) {
            toast.error("AI extraction failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleAIGenerate = async () => {
        const hasData = form.agendaItems.some((item) => item.agenda);
        if (!hasData) {
            toast.error("Add at least one agenda item first");
            return;
        }
        setGenerating(true);
        try {
            const ai = await generateReportContent("weekly", form);
            setForm({ ...form, summary: ai.summary || form.summary });
            toast.success("AI summary generated!");
        } catch {
            toast.error("AI generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!form.weekRange) {
            toast.error("Please enter the week range");
            return;
        }
        setSaving(true);
        try {
            await push(ref(db, "weeklyReports"), {
                ...form,
                createdAt: new Date().toISOString(),
            });
            toast.success("Weekly report saved!");
            setShowModal(false);
            setForm({
                weekRange: "",
                academicYear: "",
                hodName: "Mr. Sachim Kangutkar",
                summary: "",
                agendaItems: [{ agenda: "", resolution: "", actionTaken: "" }],
            });
            fetchReports();
        } catch (error) {
            console.error("Save weekly report error:", error);
            toast.error("Save failed: " + (error.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async (report) => {
        try {
            await generateWeeklyReport(report);
            toast.success("DOCX downloaded!");
        } catch (e) {
            toast.error("Export failed");
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this weekly report?")) return;
        try {
            await remove(child(ref(db), "weeklyReports/" + id));
            toast.success("Deleted");
            fetchReports();
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
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>
                        HOD Weekly Reports
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
                        Minutes of Meeting & weekly activity reports
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus /> New Report
                </button>
            </div>

            {loading ? (
                <div className="loading-screen" style={{ minHeight: 300 }}>
                    <div className="loading-spinner" />
                </div>
            ) : reports.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No Weekly Reports Yet</h3>
                        <p>Create your first HOD weekly report.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={() => setShowModal(true)}
                        >
                            <HiOutlinePlus /> Create Report
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {reports.map((r) => (
                        <div key={r.id} className="report-card">
                            <div className="report-card-header">
                                <span className="report-type-badge weekly">Weekly</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setViewReport(r)}
                                    >
                                        <HiOutlineEye /> View
                                    </button>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleExport(r)}
                                    >
                                        <HiOutlineDocumentArrowDown /> Export
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(r.id)}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            </div>
                            <h3>Week: {r.weekRange}</h3>
                            <p>
                                {r.summary
                                    ? r.summary.substring(0, 200) + "..."
                                    : `${r.agendaItems?.length || 0} agenda items`}
                            </p>
                            <div className="report-meta">
                                <span>📅 {r.weekRange}</span>
                                <span>👤 HOD: {r.hodName}</span>
                                <span>📝 {r.agendaItems?.length || 0} items</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewReport && (
                <div className="modal-overlay" onClick={() => setViewReport(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Weekly Report – {viewReport.weekRange}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setViewReport(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    marginBottom: 8,
                                    fontSize: 13,
                                }}
                            >
                                Department: Training and Placement Department
                            </p>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    marginBottom: 20,
                                    fontSize: 13,
                                }}
                            >
                                HOD: TPO- {viewReport.hodName}
                            </p>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Agenda</th>
                                        <th>Resolution</th>
                                        <th>Action Taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(viewReport.agendaItems || []).map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.agenda}</td>
                                            <td>{item.resolution}</td>
                                            <td>{item.actionTaken}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {viewReport.summary && (
                                <div style={{ marginTop: 20 }}>
                                    <h4 style={{ marginBottom: 8 }}>Summary</h4>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.7,
                                            fontSize: 14,
                                        }}
                                    >
                                        {viewReport.summary}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-success"
                                onClick={() => handleExport(viewReport)}
                            >
                                <HiOutlineDocumentArrowDown /> Export DOCX
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setViewReport(null)}
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
                            <h2>Create Weekly Report</h2>
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
                                        Weekly Agenda Bulk Entry
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
                                    Paste your weekly meeting notes or activity logs here. AI will extract agenda items, resolutions, and actions.
                                </p>
                                <textarea
                                    className="form-textarea"
                                    name="rawInput"
                                    value={form.rawInput}
                                    onChange={handleChange}
                                    placeholder="e.g. Conducted a meeting on 2nd Feb. Discussed VOIS campus visit. Resolved to prepare student list. TPC to follow up..."
                                    style={{ height: "120px" }}
                                />
                            </div>

                            <div className="form-row-3">
                                <div className="form-group">
                                    <label className="form-label">Week Range *</label>
                                    <input
                                        className="form-input"
                                        name="weekRange"
                                        value={form.weekRange}
                                        onChange={handleChange}
                                        placeholder="e.g. 27th till 31st Jan 2026"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Academic Year</label>
                                    <input
                                        className="form-input"
                                        name="academicYear"
                                        value={form.academicYear}
                                        onChange={handleChange}
                                        placeholder="e.g. 2025-2026"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">HOD Name</label>
                                    <input
                                        className="form-input"
                                        name="hodName"
                                        value={form.hodName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    margin: "16px 0 12px",
                                }}
                            >
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Agenda Items</h3>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={addAgendaItem}
                                >
                                    <HiOutlinePlus /> Add Item
                                </button>
                            </div>

                            {form.agendaItems.map((item, index) => (
                                <div key={index} className="agenda-item">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <span
                                            className="badge badge-primary"
                                            style={{ fontSize: 11 }}
                                        >
                                            Item {index + 1}
                                        </span>
                                        {form.agendaItems.length > 1 && (
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => removeAgendaItem(index)}
                                            >
                                                <HiOutlineTrash />
                                            </button>
                                        )}
                                    </div>
                                    <div className="form-row-3">
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Agenda</label>
                                            <textarea
                                                className="form-textarea"
                                                style={{ minHeight: 70 }}
                                                value={item.agenda}
                                                onChange={(e) =>
                                                    handleAgendaChange(index, "agenda", e.target.value)
                                                }
                                                placeholder="e.g. Training and placement activities"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Resolution</label>
                                            <textarea
                                                className="form-textarea"
                                                style={{ minHeight: 70 }}
                                                value={item.resolution}
                                                onChange={(e) =>
                                                    handleAgendaChange(
                                                        index,
                                                        "resolution",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. VOIS visit reschedule"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Action Taken</label>
                                            <textarea
                                                className="form-textarea"
                                                style={{ minHeight: 70 }}
                                                value={item.actionTaken}
                                                onChange={(e) =>
                                                    handleAgendaChange(
                                                        index,
                                                        "actionTaken",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Informed to TPC"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    margin: "20px 0 12px",
                                }}
                            >
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Summary</h3>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={handleAIGenerate}
                                    disabled={generating}
                                >
                                    <HiOutlineSparkles />{" "}
                                    {generating ? "Generating..." : "AI Generate Summary"}
                                </button>
                            </div>
                            <div className="form-group">
                                <textarea
                                    className="form-textarea"
                                    name="summary"
                                    value={form.summary}
                                    onChange={handleChange}
                                    placeholder="Summary of the week's activities..."
                                    style={{ minHeight: 120 }}
                                />
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
                                {saving ? "Saving..." : "Save Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
