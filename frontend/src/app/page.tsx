"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, FileText, Mail, Table, Clock, Briefcase } from "lucide-react";
import ReactMarkdown from "react-markdown";

const tabs = ["Setup", "Calibrate", "Progress", "Results", "Validate", "Outputs"];

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
          {activeTab === 0 && <SetupTab onStart={() => setActiveTab(2)} />}
          {activeTab === 1 && <CalibrateTab />}
          {activeTab === 2 && <ProgressTab />}
          {activeTab === 3 && <ResultsTab />}
          {activeTab === 4 && <ValidateTab />}
          {activeTab === 5 && <OutputsTab />}
        </motion.div>
      </AnimatePresence>

    </main>
  );
}

function SetupTab({ onStart }: { onStart: () => void }) {
  const [threshold, setThreshold] = useState(60);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<{ id: number; title: string; jd: string }[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleJD, setNewRoleJD] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddRole = () => {
    if (!newRoleTitle || !newRoleJD) return;
    if (editingId !== null) {
      setRoles(roles.map(r => r.id === editingId ? { ...r, title: newRoleTitle, jd: newRoleJD } : r));
      setEditingId(null);
    } else {
      setRoles([...roles, { id: Date.now(), title: newRoleTitle, jd: newRoleJD }]);
    }
    setNewRoleTitle("");
    setNewRoleJD("");
    setShowAddRole(false);
  };

  const handleEditRole = (role: { id: number; title: string; jd: string }) => {
    setNewRoleTitle(role.title);
    setNewRoleJD(role.jd);
    setEditingId(role.id);
    setShowAddRole(true);
  };

  const handleDeleteRole = (id: number) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const handleRun = async () => {
    if (roles.length === 0 || !files) {
      setError("Please add at least one role and upload resumes.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append("files", file));
      await fetch("http://localhost:8000/upload-resumes", { method: "POST", body: formData });

      const screenerData = new FormData();
      screenerData.append("roles", roles.map(r => r.title).join(","));
      screenerData.append("jds", JSON.stringify(roles.reduce((acc, r) => ({ ...acc, [r.title]: r.jd }), {})));
      screenerData.append("threshold", threshold.toString());
      await fetch("http://localhost:8000/run-screener", { method: "POST", body: screenerData });

      onStart();
    } catch (err) {
      setError("Failed to connect to backend. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

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

      {/* Roles Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
            OPEN ROLES ({roles.length})
          </label>
          <motion.button
            onClick={() => { setShowAddRole(!showAddRole); setEditingId(null); setNewRoleTitle(""); setNewRoleJD(""); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "6px 14px",
              background: showAddRole ? "var(--surface-2)" : "var(--accent)",
              color: showAddRole ? "var(--text-secondary)" : "#000",
              border: "none",
              borderRadius: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {showAddRole ? "Cancel" : "+ Add Role"}
          </motion.button>
        </div>

        {/* Add/Edit Role Form */}
        <AnimatePresence>
          {showAddRole && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--accent)",
                borderRadius: "10px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                overflow: "hidden",
              }}
            >
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
                  ROLE TITLE
                </label>
                <input
                  placeholder="e.g. Software Engineering Intern"
                  value={newRoleTitle}
                  onChange={e => setNewRoleTitle(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: "6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 12px", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
                  JOB DESCRIPTION
                </label>
                <textarea
                  placeholder="Paste the full job description here..."
                  value={newRoleJD}
                  onChange={e => setNewRoleJD(e.target.value)}
                  rows={6}
                  style={{ display: "block", width: "100%", marginTop: "6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "10px 12px", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "14px", resize: "vertical" }}
                />
              </div>
              <motion.button
                onClick={handleAddRole}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "10px",
                  background: "var(--accent)",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {editingId !== null ? "Update Role" : "Save Role"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <AnimatePresence>
            {roles.map(role => (
              <motion.div
                key={role.id}
                variants={cardVariants}
                exit="exit"
                layout
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: "15px", fontFamily: "var(--font-display)" }}>{role.title}</p>
                  <p style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                    fontFamily: "var(--font-mono)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {role.jd.slice(0, 80)}...
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <motion.button
                    onClick={() => handleEditRole(role)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "5px 12px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteRole(role.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "5px 12px",
                      background: "rgba(255,77,77,0.08)",
                      border: "1px solid rgba(255,77,77,0.2)",
                      borderRadius: "6px",
                      color: "var(--fail)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {roles.length === 0 && !showAddRole && (
            <div style={{
              border: "1px dashed var(--border)",
              borderRadius: "10px",
              padding: "2rem",
              textAlign: "center",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
            }}>
              No roles added yet. Click "+ Add Role" to get started.
            </div>
          )}
        </motion.div>
      </div>

      {/* Resume Upload */}
      <div
        onClick={() => document.getElementById("resume-upload")?.click()}
        style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "10px", padding: "2rem", textAlign: "center", cursor: "pointer" }}
      >
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          multiple
          style={{ display: "none" }}
          onChange={e => setFiles(e.target.files)}
        />
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px" }}>
          {files ? `${files.length} file(s) selected` : "Resume PDFs"}
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
          {files ? Array.from(files).map(f => f.name).join(", ") : "Upload one or multiple PDF resumes"}
        </p>
      </div>

      {/* Threshold */}
      <ThresholdCard value={threshold} onChange={setThreshold} />

      {/* Run Button */}
      <motion.button
        onClick={handleRun}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        style={{
          width: "100%",
          padding: "14px",
          background: loading ? "var(--surface-2)" : "var(--accent)",
          color: loading ? "var(--text-muted)" : "#000",
          border: "none",
          borderRadius: "10px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "-0.3px",
        }}
      >
        {loading ? "Running pipeline..." : "Run Screener →"}
      </motion.button>

      {error && (
        <p style={{ color: "var(--fail)", fontSize: "13px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function ThresholdCard({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
    </div>
  );
}

const FIELDS = [
  "Relevant Skills Match",
  "Experience Level",
  "Project Relevance",
  "Educational Background",
  "Tools & Technologies",
  "Achievement Quality",
  "Communication Clarity",
  "Role-Specific Keywords",
  "Extracurriculars / Leadership",
  "Overall Fit Impression",
];

function CalibrateTab() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [currentResume, setCurrentResume] = useState(0);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [currentScores, setCurrentScores] = useState<Record<string, number>>(
    Object.fromEntries(FIELDS.map(f => [f, 5]))
  );
  const [calibrating, setCalibrating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const resumeList = files ? Array.from(files) : [];
  const currentFile = resumeList[currentResume];

  const handleScoreChange = (field: string, value: number) => {
    setCurrentScores(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveResume = () => {
    if (!currentFile) return;
    setScores(prev => ({ ...prev, [currentFile.name]: currentScores }));
    if (currentResume < resumeList.length - 1) {
      setCurrentResume(currentResume + 1);
      setCurrentScores(Object.fromEntries(FIELDS.map(f => [f, 5])));
    }
  };

  const handleCalibrate = async () => {
    if (Object.keys(scores).length < 1) {
      setError("Please score at least one resume before calibrating.");
      return;
    }
    setCalibrating(true);
    setError("");

    try {
      // Step 1 — upload the calibration resumes to backend
      const formData = new FormData();
      Array.from(files!).forEach(file => formData.append("files", file));
      await fetch("http://localhost:8000/upload-calibration-resumes", {
        method: "POST",
        body: formData,
      });

      // Step 2 — send manual scores to calibrate endpoint
      const response = await fetch("http://localhost:8000/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      if (response.ok) setDone(true);
      else setError("Calibration failed. Check the backend.");
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setCalibrating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  if (done) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "1rem", padding: "4rem 0", textAlign: "center"
      }}
    >
      <div style={{
        width: "64px", height: "64px", borderRadius: "50%",
        background: "rgba(0,255,148,0.1)", border: "2px solid var(--pass)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "28px"
      }}>✓</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800 }}>
        Calibration Complete
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "400px" }}>
        Your scoring preferences have been captured. The pipeline will now score candidates aligned to your style.
      </p>
      <motion.button
        onClick={() => { setDone(false); setFiles(null); setCurrentResume(0); setScores({}); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: "10px 24px", background: "var(--surface-2)",
          border: "1px solid var(--border)", borderRadius: "8px",
          color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
          fontSize: "13px", cursor: "pointer", marginTop: "8px"
        }}
      >
        Recalibrate
      </motion.button>
    </motion.div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Calibrate
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Score 3-5 resumes manually. The system will learn your evaluation style.
        </p>
      </div>

      {/* Upload */}
      {!files && (
        <div
          onClick={() => document.getElementById("calibrate-upload")?.click()}
          style={{
            background: "var(--surface)", border: "1px dashed var(--border)",
            borderRadius: "10px", padding: "2.5rem", textAlign: "center", cursor: "pointer"
          }}
        >
          <input
            id="calibrate-upload" type="file" accept=".pdf" multiple
            style={{ display: "none" }}
            onChange={e => setFiles(e.target.files)}
          />
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px" }}>
            Upload 3-5 resumes to calibrate
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            You'll score each one manually on the 10 fields
          </p>
        </div>
      )}

      {/* Scoring UI */}
      {files && currentFile && (
        <>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {resumeList.map((f, i) => (
              <div key={f.name} style={{
                height: "4px", flex: 1, borderRadius: "2px",
                background: i < currentResume ? "var(--pass)" :
                  i === currentResume ? "var(--accent)" : "var(--border)"
              }} />
            ))}
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid var(--accent)",
            borderRadius: "10px", padding: "1rem 1.25rem",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: "15px" }}>{currentFile.name}</p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                Resume {currentResume + 1} of {resumeList.length}
              </p>
            </div>
            <span style={{
              fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
              background: "rgba(200,255,0,0.1)", color: "var(--accent)",
              fontFamily: "var(--font-mono)"
            }}>
              Scoring
            </span>
          </div>

          {/* Field Scores */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {FIELDS.map((field, i) => (
              <motion.div
                key={field}
                variants={itemVariants}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "10px", padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: "16px"
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>{field}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    Field {i + 1} of 10
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="range" min={0} max={10}
                    value={currentScores[field]}
                    onChange={e => handleScoreChange(field, Number(e.target.value))}
                    style={{ width: "120px", accentColor: "var(--accent)" }}
                  />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 500,
                    color: "var(--accent)", width: "32px", textAlign: "right"
                  }}>
                    {currentScores[field]}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Total */}
          <div style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "10px", padding: "1rem 1.25rem",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              TOTAL SCORE
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 500, color: "var(--accent)" }}>
              {Object.values(currentScores).reduce((a, b) => a + b, 0)}/100
            </span>
          </div>

          {/* Save / Calibrate */}
          <div style={{ display: "flex", gap: "12px" }}>
            {currentResume < resumeList.length - 1 ? (
              <motion.button
                onClick={handleSaveResume}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1, padding: "12px", background: "var(--accent)", color: "#000",
                  border: "none", borderRadius: "10px", fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: "15px", cursor: "pointer"
                }}
              >
                Save & Next Resume →
              </motion.button>
            ) : (
              <motion.button
                onClick={() => { handleSaveResume(); setTimeout(handleCalibrate, 100); }}
                disabled={calibrating}
                whileHover={{ scale: calibrating ? 1 : 1.01 }}
                whileTap={{ scale: calibrating ? 1 : 0.98 }}
                style={{
                  flex: 1, padding: "12px",
                  background: calibrating ? "var(--surface-2)" : "var(--accent)",
                  color: calibrating ? "var(--text-muted)" : "#000",
                  border: "none", borderRadius: "10px", fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: "15px",
                  cursor: calibrating ? "not-allowed" : "pointer"
                }}
              >
                {calibrating ? "Calibrating..." : "Save & Calibrate →"}
              </motion.button>
            )}
          </div>

          {error && (
            <p style={{ color: "var(--fail)", fontSize: "13px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
              {error}
            </p>
          )}
        </>
      )}

      {/* Scored Resumes Summary */}
      {Object.keys(scores).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
            SCORED SO FAR
          </label>
          {Object.entries(scores).map(([name, s]) => (
            <div key={name} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderLeft: "3px solid var(--pass)", borderRadius: "10px",
              padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: "13px" }}>{name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--pass)" }}>
                {Object.values(s).reduce((a, b) => a + b, 0)}/100
              </span>
            </div>
          ))}
        </div>
      )}
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
  const [report, setReport] = useState<string | null>(null);
  const [timeLog, setTimeLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/results")
      .then(res => res.json())
      .then(data => {
        setReport(data.report);
        setTimeLog(data.time_log);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not fetch results. Make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
      Fetching results...
    </div>
  );

  if (error) return (
    <div style={{ color: "var(--fail)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>{error}</div>
  );

  if (!report) return (
    <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
      No results yet. Run the screener first.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Screening Results
        </h2>
        {timeLog && (
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
            {timeLog.split("\n")[0]}
          </p>
        )}
      </div>

      {/* Raw Report */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "1.5rem",
        fontSize: "14px",
        color: "var(--text-primary)",
        lineHeight: "1.8",
        maxHeight: "600px",
        overflowY: "auto",
      }}>
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </div>
  );
}

function ValidateTab() {
  return (
    <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
      Validation coming soon...
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
              padding: "1.75rem",
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