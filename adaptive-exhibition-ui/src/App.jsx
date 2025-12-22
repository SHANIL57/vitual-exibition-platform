import React, { useState, useEffect } from "react";
import { booths as boothData } from "./data";
import { calculateBoothScore, calculateLeadScore } from "./logic";
import "./styles.css";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("visitor");
  const [booths, setBooths] = useState(
    boothData.map(b => ({ ...b, score: 0 }))
  );
  const [sessionLog, setSessionLog] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }

  function handleInteraction(boothId, action) {
    const updatedBooths = booths.map(booth =>
      booth.id === boothId
        ? { ...booth, score: calculateBoothScore(booth.score, action) }
        : booth
    );

    updatedBooths.sort((a, b) => b.score - a.score);
    setBooths(updatedBooths);

    setSessionLog(prev => [
      ...prev,
      { boothId, action, time: new Date().toLocaleTimeString() }
    ]);

    updateLead(boothId, action);
  }

  function updateLead(boothId, action) {
    const impact = {
      view: { time: 20, downloads: 0, compares: 0 },
      download: { time: 10, downloads: 1, compares: 0 },
      compare: { time: 15, downloads: 0, compares: 1 }
    };

    const existing = leads.find(l => l.boothId === boothId);

    if (existing) {
      existing.time += impact[action].time;
      existing.downloads += impact[action].downloads;
      existing.compares += impact[action].compares;
      existing.score = calculateLeadScore(existing);
      setLeads([...leads]);
    } else {
      const newLead = {
        boothId,
        ...impact[action]
      };
      newLead.score = calculateLeadScore(newLead);
      setLeads([...leads, newLead]);
    }
  }

  return (
    <div className="app">
      <div className="container">
        {/* HEADER */}
        <div className="header">
          <div>
            <h1>Adaptive Virtual Exhibition Platform</h1>
            <p>Supervised learning–based adaptive ranking with explainable intelligence</p>
          </div>
          <button className="toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* TABS */}
        <div className="tabs">
          {["visitor", "exhibitor", "admin"].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* VISITOR */}
        {activeTab === "visitor" &&
          booths.map((booth, index) => (
            <div
              key={booth.id}
              className={`card ${index === 0 ? "recommended" : ""}`}
            >
              <strong>{booth.name}</strong>

              <div className="actions">
                <button className="primary" onClick={() => handleInteraction(booth.id, "view")}>
                  View
                </button>
                <button onClick={() => handleInteraction(booth.id, "download")}>
                  Download
                </button>
                <button onClick={() => handleInteraction(booth.id, "compare")}>
                  Compare
                </button>
              </div>

              <small>Score: {booth.score}</small>
            </div>
          ))}

        {/* EXHIBITOR */}
        {activeTab === "exhibitor" &&
          leads.map(lead => (
            <div key={lead.boothId} className="card">
              <strong>
                Booth: {boothData.find(b => b.id === lead.boothId)?.name}
              </strong>
              <p>Lead Score: {lead.score.toFixed(1)}</p>

              <div className="explain">
                <strong>Why this lead?</strong>
                <ul>
                  <li>Time spent: {lead.time}s</li>
                  <li>Downloads: {lead.downloads}</li>
                  <li>Comparisons: {lead.compares}</li>
                </ul>
              </div>
            </div>
          ))}

        {/* ADMIN */}
        {activeTab === "admin" &&
          sessionLog.map((log, i) => (
            <div key={i} className="log">
              Booth {log.boothId} → {log.action} @ {log.time}
            </div>
          ))}
      </div>
    </div>
  );
}
