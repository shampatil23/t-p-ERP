"use client";
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    AlignmentType,
    BorderStyle,
    HeadingLevel,
    ImageRun,
    PageBreak,
} from "docx";
import { saveAs } from "file-saver";

const COLLEGE_NAME = "JSPM's Jayawantrao Sawant College of Engineering, Pune";
const DEPT_NAME = "Training and Placement Department";

const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

const createInfoCell = (text, bold = false) =>
    new TableCell({
        borders: cellBorders,
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text,
                        bold,
                        size: 22,
                        font: "Calibri",
                    }),
                ],
                spacing: { before: 60, after: 60 },
            }),
        ],
        width: { size: 50, type: WidthType.PERCENTAGE },
    });

const createHeaderParagraphs = (reportType, academicYear) => [
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: COLLEGE_NAME,
                bold: true,
                size: 28,
                font: "Calibri",
            }),
        ],
        spacing: { after: 100 },
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: DEPT_NAME,
                bold: true,
                size: 24,
                font: "Calibri",
            }),
        ],
        spacing: { after: 200 },
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: `${reportType} Report - ${academicYear}`,
                bold: true,
                size: 32,
                font: "Calibri",
                underline: {},
            }),
        ],
        spacing: { after: 300 },
    }),
];

// ===== DRIVE REPORT =====
export const generateDriveReport = async (data) => {
    const summaryRows = [
        ["1", "Report Type", "Drive"],
        ["2", "Company Name", data.companyName || ""],
        ["3", "Batch", data.batch || ""],
        ["4", "Branch", data.branches || ""],
        ["5", "AY", data.academicYear || ""],
        ["6", "Date and Time", data.date || ""],
        ["7", "Time", data.time || ""],
        ["8", "Registered Student count", String(data.registeredCount || "")],
        ["9", "Attendance", String(data.attendance || "")],
        [
            "10",
            "Shortlisted Student Count",
            data.shortlistedInfo || String(data.shortlisted || ""),
        ],
        ["11", "HR Feedback", data.hrFeedback || "Awaited"],
    ];

    const summaryTable = new Table({
        rows: summaryRows.map(
            ([num, label, value]) =>
                new TableRow({
                    children: [
                        createInfoCell(num, true),
                        createInfoCell(label, true),
                        createInfoCell(value),
                    ],
                })
        ),
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const sections = [
        {
            children: [
                ...createHeaderParagraphs("Drive", data.academicYear),
                new Paragraph({
                    text: `Summary Drive Report - ${data.academicYear}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 200 },
                }),
                summaryTable,
                new Paragraph({ text: "", spacing: { before: 300 } }),
                new Paragraph({
                    text: "Overview:",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.overview || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Drive Details:",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.driveDetails || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Selected Students:",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.selectedStudentsInfo || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Company: ${data.companyName}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Date: ${data.date}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Time: ${data.time}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Venue: ${data.venue || ""}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `AY: ${data.academicYear}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Batch: ${data.batch}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Branch: ${data.branches}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `No criteria: ${data.criteria || "No backlogs"}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Total Students attended: ${data.attendance}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Mode: ${data.mode || "Off-line"}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Company Profile:",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.companyProfile || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `ROUND Details: ${data.rounds || ""}`,
                            bold: true,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 300 },
                }),
            ],
        },
    ];

    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    saveAs(
        blob,
        `Drive Report of ${data.companyName}_${data.date} for the batch ${data.academicYear}.docx`
    );
};

// ===== SESSION REPORT =====
export const generateSessionReport = async (data) => {
    const summaryRows = [
        ["1", "Report Type", "Session"],
        ["2", "Company Name", data.companyName || ""],
        ["3", "Batch", data.batch || ""],
        ["4", "Branch", data.branches || ""],
        ["5", "AY", data.academicYear || ""],
        ["6", "Date and Time", data.date || ""],
        ["", "Time", data.time || ""],
        ["7", "Topic", data.topic || ""],
        ["8", "Registered Student count", String(data.registeredCount || "")],
        ["9", "Attendance", String(data.attendance || "")],
        ["10", "Feed Back", data.feedback || ""],
        ["11", "Purpose of the Session", data.purpose || ""],
        ["12", "Outcome of the Session", data.outcome || ""],
    ];

    const summaryTable = new Table({
        rows: summaryRows.map(
            ([num, label, value]) =>
                new TableRow({
                    children: [
                        createInfoCell(num, true),
                        createInfoCell(label, true),
                        createInfoCell(value),
                    ],
                })
        ),
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    // Department-wise attendance table
    const deptAttendance = data.departmentAttendance || {};
    const deptTable = new Table({
        rows: [
            new TableRow({
                children: [
                    createInfoCell("Department", true),
                    ...Object.keys(deptAttendance).map((dept) =>
                        createInfoCell(dept, true)
                    ),
                    createInfoCell("Total", true),
                ],
            }),
            new TableRow({
                children: [
                    createInfoCell("Student Attendance", true),
                    ...Object.values(deptAttendance).map((count) =>
                        createInfoCell(String(count))
                    ),
                    createInfoCell(
                        String(
                            Object.values(deptAttendance).reduce(
                                (sum, v) => sum + Number(v),
                                0
                            )
                        )
                    ),
                ],
            }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const sections = [
        {
            children: [
                ...createHeaderParagraphs("Session", data.academicYear),
                new Paragraph({
                    text: `Summary of Session Report - ${data.academicYear}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 200 },
                }),
                summaryTable,
                new Paragraph({ text: "", spacing: { before: 300 } }),
                new Paragraph({
                    text: `Session Report - ${data.academicYear}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    text: "Overview",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 100, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.overview || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Training Summary",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 100, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Company: ${data.companyName}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Topic: ${data.topic}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Venue: ${data.venue || "Seminar Hall"}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `AY: ${data.academicYear}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Batch: ${data.batch}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Total Students attended: ${data.attendance}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Mode: ${data.mode || "Offline"}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Trainer Details",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Name: ${data.trainerName || ""}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Contact details: ${data.trainerContact || ""}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Email id: ${data.trainerEmail || ""}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Profile: ${data.trainerProfile || ""}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Schedule:",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Date and Time: ${data.date} ${data.time || ""}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Attendance: ${data.attendance}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Department-wise Attendance:",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                }),
                deptTable,
                new Paragraph({ text: "", spacing: { before: 300 } }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Feedback: ${data.feedback || "Yet to receive"}`,
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Outcome:",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.outcome || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 300 },
                }),
            ],
        },
    ];

    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    saveAs(
        blob,
        `Session Report AY ${data.academicYear} _${data.topic} - ${data.companyName}.docx`
    );
};

// ===== HOD WEEKLY REPORT =====
export const generateWeeklyReport = async (data) => {
    const headerTable = new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders: cellBorders,
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Name of Department: ${DEPT_NAME}`,
                                        bold: true,
                                        size: 22,
                                        font: "Calibri",
                                    }),
                                ],
                                spacing: { before: 60, after: 60 },
                            }),
                        ],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        borders: cellBorders,
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Head of Department: TPO- ${data.hodName || "Mr. Sachim Kangutkar"}`,
                                        bold: true,
                                        size: 22,
                                        font: "Calibri",
                                    }),
                                ],
                                spacing: { before: 60, after: 60 },
                            }),
                        ],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    createInfoCell("Agenda", true),
                    createInfoCell("Resolution", true),
                    createInfoCell("Action Taken", true),
                ],
            }),
            ...(data.agendaItems || []).map(
                (item) =>
                    new TableRow({
                        children: [
                            createInfoCell(item.agenda || ""),
                            createInfoCell(item.resolution || ""),
                            createInfoCell(item.actionTaken || ""),
                        ],
                    })
            ),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const sections = [
        {
            children: [
                ...createHeaderParagraphs("HOD Weekly", data.academicYear || ""),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: `Week: ${data.weekRange || ""}`,
                            bold: true,
                            size: 24,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 300 },
                }),
                headerTable,
                new Paragraph({ text: "", spacing: { before: 300 } }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.summary || "",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 300 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: " MoM Editor",
                            size: 22,
                            font: "Calibri",
                        }),
                        new TextRun({
                            text: "\t\t\t\t\t\t\t\t\t\t\t\t",
                        }),
                        new TextRun({
                            text: "Head of Department",
                            size: 22,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { before: 400 },
                }),
            ],
        },
    ];

    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    saveAs(
        blob,
        `HOD Weekly Report on T&P@ ${data.weekRange || ""}.docx`
    );
};
