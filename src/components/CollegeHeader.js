"use client";

export default function CollegeHeader() {
    return (
        <header className="college-header">
            <div className="college-header-logo">🎓</div>
            <div className="college-header-text">
                <div className="college-header-jspm">JSPM&apos;s</div>
                <div className="college-header-name">
                    Jayawantrao Sawant College of Engineering, Hadapsar, Pune.
                </div>
                <div className="college-header-sub">
                    (Approved By AICTE &amp; Affiliated To Savitribai Phule Pune University &amp; Accredited with A+ Grade by NAAC)
                </div>
            </div>
            <div className="college-header-logo">
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1a3a6b" }}>T&amp;P</span>
            </div>
        </header>
    );
}
