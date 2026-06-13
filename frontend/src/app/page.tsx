"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
      Pipeline progress will appear here...
    </div>
  );
}

function ResultsTab() {
  return (
    <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
      Results will appear here...
    </div>
  );
}

function OutputsTab() {
  return (
    <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
      Download outputs here...
    </div>
  );
}