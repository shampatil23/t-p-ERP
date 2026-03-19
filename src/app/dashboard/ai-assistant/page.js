"use client";
import { useState, useRef, useEffect } from "react";
import { chatWithAI } from "@/lib/gemini";
import {
    HiOutlinePaperAirplane,
    HiOutlineSparkles,
    HiOutlineTrash,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const quickPrompts = [
    "Help me draft a drive report for TCS campus placement",
    "Write a session report summary for a LinkedIn workshop",
    "Suggest best practices for T&P department",
    "Help me write an HOD weekly report summary",
    "Draft a company profile for Infosys",
    "What should I include in a placement drive report?",
];

export default function AIAssistantPage() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                "Hello! I'm your AI assistant for the Training & Placement department. I can help you draft reports, write summaries, and answer T&P related queries. How can I help you today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (text = null) => {
        const message = text || input;
        if (!message.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: message }]);
        setInput("");
        setLoading(true);

        try {
            const context = messages
                .slice(-6)
                .map((m) => `${m.role}: ${m.content}`)
                .join("\n");
            const response = await chatWithAI(message, context);
            setMessages((prev) => [...prev, { role: "ai", content: response }]);
        } catch (e) {
            toast.error("AI response failed");
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content:
                        "Sorry, I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: "ai",
                content:
                    "Chat cleared! How can I help you with T&P operations today?",
            },
        ]);
    };

    return (
        <div className="chat-container">
            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div
                    style={{
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            background: "var(--accent-gradient)",
                            borderRadius: "var(--radius-lg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            marginBottom: 16,
                        }}
                    >
                        <HiOutlineSparkles />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                        AI Report Assistant
                    </h3>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: 14,
                            marginBottom: 24,
                        }}
                    >
                        Powered by Google Gemini • Ask me anything about T&P
                    </p>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: 10,
                            width: "100%",
                            maxWidth: 700,
                        }}
                    >
                        {quickPrompts.map((prompt) => (
                            <div
                                key={prompt}
                                onClick={() => handleSend(prompt)}
                                style={{
                                    padding: "12px 16px",
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "var(--radius-md)",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    color: "var(--text-secondary)",
                                    transition: "var(--transition-fast)",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = "var(--accent-primary)";
                                    e.target.style.color = "var(--text-primary)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = "var(--border-color)";
                                    e.target.style.color = "var(--text-secondary)";
                                }}
                            >
                                <HiOutlineSparkles
                                    style={{
                                        display: "inline",
                                        verticalAlign: "middle",
                                        marginRight: 6,
                                        color: "var(--accent-primary)",
                                    }}
                                />
                                {prompt}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role}`}>
                        {msg.content.split("\n").map((line, j) => (
                            <span key={j}>
                                {line}
                                {j < msg.content.split("\n").length - 1 && <br />}
                            </span>
                        ))}
                    </div>
                ))}
                {loading && (
                    <div className="chat-msg ai">
                        <div
                            style={{ display: "flex", gap: 6, alignItems: "center" }}
                        >
                            <div
                                className="loading-spinner"
                                style={{ width: 16, height: 16, borderWidth: 2 }}
                            />
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                Thinking...
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                <button
                    className="btn btn-icon btn-outline"
                    onClick={clearChat}
                    title="Clear chat"
                    style={{ flexShrink: 0 }}
                >
                    <HiOutlineTrash />
                </button>
                <input
                    type="text"
                    placeholder="Ask me about T&P reports, placement data, or get help drafting..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button
                    className="chat-send-btn"
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                >
                    <HiOutlinePaperAirplane />
                </button>
            </div>
        </div>
    );
}
