"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, FileText, Mail, Table, Clock, Briefcase } from "lucide-react";

const tabs = ["Setup", "Progress", "Results", "Outputs"];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px",
            background: "var(--accent)",
            borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#000", fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>S</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.5px" }}>
            Sieve
          </span>
        </div>

        <nav style={{ display: "flex", gap: "4px" }}>
          {tabs.map((tab, i) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(i)}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: "none",
                background: activeTab === i ? "var(--surface-2)" : "transparent",
                color: activeTab === i ? "var(--text-primary)" : "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab}
            </motion.button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}
        >
          {activeTab === 0 && <SetupTab onStart={() => setActiveTab(1)} />}
          {activeTab === 1 && <ProgressTab />}
          {activeTab === 2 && <ResultsTab />}
          {activeTab === 3 && <OutputsTab />}
        </motion.div>
      </AnimatePresence>

    </main>
  );
}

function SetupTab({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "52px", fontWeight: 800, letterSpacing: "-1px" }}>
          Screen candidates.<br />
          <span style={{ color: "var(--accent)" }}>Intelligently.</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "15px" }}>
          Drop in role titles and resumes. The system handles the rest.
        </p>
      </div>

      {/* Company + Roles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <InputCard label="Company Name" placeholder="e.g. Zepto, Google, Swiggy" />
        <InputCard label="Role Titles" placeholder="e.g. SWE Intern, PM Intern" />
      </div>

      {/* Resume Upload */}
      <UploadCard label="Resume PDFs" hint="Upload one or multiple PDF resumes" />

      {/* Threshold */}
      <ThresholdCard />

      {/* Run Button */}
      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: "100%",
          padding: "14px",
          background: "var(--accent)",
          color: "#000",
          border: "none",
          borderRadius: "10px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "16px",
          cursor: "pointer",
          letterSpacing: "-0.3px",
        }}
      >
        Run Screener →
      </motion.button>
    </div>
  );
}

function InputCard({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "1rem",
    }}>
      <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
        {label.toUpperCase()}
      </label>
      <input
        placeholder={placeholder}
        style={{
          display: "block",
          width: "100%",
          marginTop: "8px",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "15px",
        }}
      />
    </div>
  );
}

function UploadCard({ label, hint }: { label: string; hint: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px dashed var(--border)",
      borderRadius: "10px",
      padding: "2rem",
      textAlign: "center",
      cursor: "pointer",
    }}>
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px" }}>{label}</p>
      <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{hint}</p>
    </div>
  );
}

function ThresholdCard() {
  const [value, setValue] = useState(60);
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "1rem 1.25rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
          MINIMUM THRESHOLD
        </label>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 500, color: "var(--accent)" }}>
          {value}%
        </span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
    </div>
  );
}

function ProgressTab() {
  const agents = [
    { name: "JD Generator", status: "done", time: "2.1s" },
    { name: "JD Analyst", status: "done", time: "1.8s" },
    { name: "Resume Screener", status: "running", time: null },
    { name: "Deep Analyser", status: "pending", time: null },
    { name: "Alternate Role Matcher", status: "pending", time: null },
    { name: "Interview Question Generator", status: "pending", time: null },
    { name: "Email Drafter", status: "pending", time: null },
    { name: "Report Writer", status: "pending", time: null },
    { name: "Validation Agent", status: "pending", time: null },
    { name: "Time Logger", status: "pending", time: null },
  ];

  const statusColor: Record<string, string> = {
    done: "var(--pass)",
    running: "var(--accent)",
    pending: "var(--text-muted)",
  };

  const statusLabel: Record<string, string> = {
    done: "✓",
    running: "...",
    pending: "—",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Pipeline Running
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Processing 3 candidates across 2 roles
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "var(--surface)", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "30%" }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: "var(--accent)", borderRadius: "6px" }}
        />
      </div>

      {/* Agent List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "24px", height: "24px",
                borderRadius: "50%",
                background: "var(--surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px",
                color: statusColor[agent.status],
                fontFamily: "var(--font-mono)",
              }}>
                {statusLabel[agent.status]}
              </span>
              <span style={{
                fontSize: "14px",
                color: agent.status === "pending" ? "var(--text-muted)" : "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}>
                {agent.name}
              </span>
            </div>
            {agent.time && (
              <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                {agent.time}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultsTab() {
  const candidates = [
    {
      name: "Arjun Mehta",
      role: "SWE Intern",
      score: 78,
      status: "pass",
      strengths: ["Strong Python", "Relevant projects", "Clear resume"],
      weaknesses: ["No cloud experience", "Limited leadership"],
    },
    {
      name: "Priya Sharma",
      role: "PM Intern",
      score: 65,
      status: "pass",
      strengths: ["Product thinking", "Communication clarity"],
      weaknesses: ["No internship experience"],
    },
    {
      name: "Rohan Das",
      role: "SWE Intern",
      score: 42,
      status: "fail",
      strengths: ["Good education"],
      weaknesses: ["Missing core skills", "Weak projects", "No relevant tools"],
    },
  ];

  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Screening Results
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          2 passed · 1 failed · 3 total
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        {[
          { label: "Total", value: "3", color: "var(--text-primary)" },
          { label: "Passed", value: "2", color: "var(--pass)" },
          { label: "Failed", value: "1", color: "var(--fail)" },
        ].map(card => (
          <div key={card.label} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
          }}>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              {card.label.toUpperCase()}
            </p>
            <p style={{ fontSize: "28px", fontFamily: "var(--font-mono)", fontWeight: 500, color: card.color, marginTop: "4px" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Candidate Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {candidates.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: "var(--surface)",
              border: `1px solid ${c.status === "pass" ? "var(--border)" : "var(--border)"}`,
              borderLeft: `3px solid ${c.status === "pass" ? "var(--pass)" : "var(--fail)"}`,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {/* Header Row */}
            <div
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "var(--surface-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)",
                }}>
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: "15px" }}>{c.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{c.role}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 500,
                  color: c.status === "pass" ? "var(--pass)" : "var(--fail)",
                }}>
                  {c.score}%
                </span>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                  background: c.status === "pass" ? "rgba(0,255,148,0.1)" : "rgba(255,77,77,0.1)",
                  color: c.status === "pass" ? "var(--pass)" : "var(--fail)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {c.status.toUpperCase()}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>
                  {expanded === i ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    borderTop: "1px solid var(--border)",
                    padding: "16px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>STRENGTHS</p>
                    {c.strengths.map(s => (
                      <p key={s} style={{ fontSize: "13px", color: "var(--pass)", marginBottom: "4px" }}>+ {s}</p>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>WEAKNESSES</p>
                    {c.weaknesses.map(w => (
                      <p key={w} style={{ fontSize: "13px", color: "var(--fail)", marginBottom: "4px" }}>− {w}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OutputsTab() {
  const outputs = [
    { label: "Ranked Summary", desc: "All candidates sorted by score", file: "ranked_summary.md", icon: <BarChart2 size={22} /> },
    { label: "Candidate Reports", desc: "Deep report per passed candidate", file: "reports.zip", icon: <FileText size={22} /> },
    { label: "Draft Emails", desc: "Interview invites, redirects, rejections", file: "emails.zip", icon: <Mail size={22} /> },
    { label: "Validation Sheet", desc: "Manual vs system scores side by side", file: "validation.csv", icon: <Table size={22} /> },
    { label: "Time Log", desc: "Processing time for the batch", file: "time_log.txt", icon: <Clock size={22} /> },
    { label: "Generated JDs", desc: "Auto-generated job descriptions", file: "jds.zip", icon: <Briefcase size={22} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Outputs
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          All generated files ready to download
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {outputs.map((o, i) => (
          <motion.div
            key={o.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent)",
              flexShrink: 0,
            }}>
              {o.icon}
            </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: "15px" }}>{o.label}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{o.desc}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                padding: "8px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ↓ {o.file}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}