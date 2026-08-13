import { useState, useEffect, useRef, useCallback } from "react";

// ─── Gear SVG Component ───
const Gear = ({ cx, cy, teeth, innerR, outerR, rotation, fill, opacity = 1 }) => {
  const points = [];
  const step = Math.PI / teeth;
  for (let i = 0; i < 2 * teeth; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step + (rotation * Math.PI) / 180;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return (
    <g style={{ opacity }}>
      <polygon points={points.join(" ")} fill={fill} stroke={fill} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={innerR * 0.45} fill="#08090d" />
      <circle cx={cx} cy={cy} r={innerR * 0.2} fill={fill} opacity="0.4" />
    </g>
  );
};

// ─── Floating particles ───
const Particles = ({ mouseX, mouseY }) => {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  ).current;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const offsetX = (mouseX - 0.5) * p.speed * 30;
        const offsetY = (mouseY - 0.5) * p.speed * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#C41E3A" : "#F0B429",
              opacity: p.opacity,
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              transition: "transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Neural network lines background ───
const NeuralLines = ({ mouseX, mouseY }) => {
  const nodes = useRef(
    Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
  ).current;

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {nodes.map((n, i) =>
        nodes.slice(i + 1).map((m, j) => {
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist > 40) return null;
          return (
            <line
              key={`${i}-${j}`}
              x1={n.x + (mouseX - 0.5) * 2}
              y1={n.y + (mouseY - 0.5) * 2}
              x2={m.x + (mouseX - 0.5) * 1.5}
              y2={m.y + (mouseY - 0.5) * 1.5}
              stroke="#C41E3A"
              strokeWidth="0.08"
              opacity={0.15 - dist * 0.003}
            />
          );
        })
      )}
    </svg>
  );
};

// ─── Interactive Gear System ───
const GearSystem = ({ mouseX, mouseY }) => {
  const baseRotation = mouseX * 360 + mouseY * 180;

  const gears = [
    { cx: 200, cy: 200, teeth: 16, innerR: 55, outerR: 72, mult: 1, fill: "#C41E3A" },
    { cx: 330, cy: 175, teeth: 12, innerR: 40, outerR: 54, mult: -1.33, fill: "#9B1B30" },
    { cx: 145, cy: 330, teeth: 10, innerR: 32, outerR: 44, mult: -1.6, fill: "#F0B429" },
    { cx: 430, cy: 240, teeth: 20, innerR: 65, outerR: 82, mult: 0.8, fill: "#7A1225" },
    { cx: 290, cy: 310, teeth: 8, innerR: 25, outerR: 36, mult: -2, fill: "#D4922A" },
    { cx: 100, cy: 140, teeth: 14, innerR: 45, outerR: 60, mult: -1.14, fill: "#A8152E" },
    { cx: 480, cy: 130, teeth: 6, innerR: 20, outerR: 30, mult: 2.67, fill: "#F0B429", opacity: 0.6 },
    { cx: 530, cy: 310, teeth: 10, innerR: 30, outerR: 42, mult: -1.6, fill: "#C41E3A", opacity: 0.4 },
  ];

  return (
    <svg
      viewBox="0 0 600 420"
      style={{
        width: "100%",
        maxWidth: 600,
        height: "auto",
        filter: "drop-shadow(0 0 40px rgba(196,30,58,0.15))",
      }}
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C41E3A" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C41E3A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="420" fill="url(#glow)" />
      {gears.map((g, i) => (
        <Gear
          key={i}
          cx={g.cx}
          cy={g.cy}
          teeth={g.teeth}
          innerR={g.innerR}
          outerR={g.outerR}
          rotation={baseRotation * g.mult}
          fill={g.fill}
          opacity={g.opacity || 1}
        />
      ))}
      {/* Center text */}
      <text x="300" y="205" textAnchor="middle" fill="#F1F5F9" fontSize="13" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" letterSpacing="3">
        BUILDER HUB
      </text>
    </svg>
  );
};

// ─── Section Components ───

const HomePage = ({ mouseX, mouseY, setActiveTab }) => (
  <div>
    {/* Hero */}
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "60px 24px 80px",
        overflow: "hidden",
      }}
    >
      <NeuralLines mouseX={mouseX} mouseY={mouseY} />
      <Particles mouseX={mouseX} mouseY={mouseY} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 800 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 5,
            color: "#C41E3A",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          USC Marshall × Viterbi
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 7vw, 72px)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: "#F1F5F9",
            lineHeight: 1.05,
            margin: "0 0 8px",
          }}
        >
          BUAI
          <br />
          <span style={{ color: "#C41E3A" }}>Builder Hub</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(13px, 2vw, 17px)",
            color: "#94A3B8",
            fontFamily: "'Inter', sans-serif",
            maxWidth: 520,
            margin: "16px auto 0",
            lineHeight: 1.7,
          }}
        >
          Where BUAI students build real AI solutions. A collaborative space
          for applied artificial intelligence — from prototype to impact.
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 2, marginTop: 24, width: "100%", maxWidth: 600 }}>
        <GearSystem mouseX={mouseX} mouseY={mouseY} />
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "#475569",
          fontSize: 10,
          letterSpacing: 2,
          fontFamily: "'Space Grotesk', sans-serif",
          animation: "pulse 2s infinite",
        }}
      >
        <span>SCROLL</span>
        <span style={{ fontSize: 16 }}>↓</span>
      </div>
    </section>

    {/* What is BBH */}
    <section style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: "#C41E3A" }} />
        <span
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: "#C41E3A",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          WHAT WE DO
        </span>
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 4vw, 44px)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: "#F1F5F9",
          lineHeight: 1.15,
          margin: "0 0 28px",
        }}
      >
        Building AI is different
        <br />
        from studying AI.
      </h2>
      <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", maxWidth: 680 }}>
        The Artificial Intelligence Builder Hub (BBH) is a collaborative space where students
        build AI agents using synthetic models in a safe, controlled testing environment — designed
        to complement classroom learning with hands-on experience. Located at ACC 215, the BBH
        connects students with faculty mentors to develop portfolio-ready projects that solve real challenges.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 48,
        }}
      >
        {[
          { icon: "⚙️", title: "Build", desc: "Create AI agents and tools in a controlled sandbox environment" },
          { icon: "🧪", title: "Test", desc: "Safe synthetic models for experimentation without risk" },
          { icon: "🤝", title: "Collaborate", desc: "Faculty-mentored teams working on applied AI challenges" },
          { icon: "📂", title: "Ship", desc: "Portfolio-ready projects with real-world impact" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(196,30,58,0.04)",
              border: "1px solid rgba(196,30,58,0.12)",
              borderRadius: 10,
              padding: "28px 24px",
              transition: "border-color 0.3s, background 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,30,58,0.35)";
              e.currentTarget.style.background = "rgba(196,30,58,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,30,58,0.12)";
              e.currentTarget.style.background = "rgba(196,30,58,0.04)";
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#F1F5F9",
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: 8,
              }}
            >
              {item.title}
            </div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Current Project Highlight */}
    <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: "#F0B429" }} />
        <span
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: "#F0B429",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          CURRENT PROJECT
        </span>
      </div>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(196,30,58,0.06) 0%, rgba(240,180,41,0.04) 100%)",
          border: "1px solid rgba(196,30,58,0.15)",
          borderRadius: 14,
          padding: "clamp(32px, 5vw, 56px)",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          transition: "border-color 0.3s",
        }}
        onClick={() => setActiveTab("projects")}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,30,58,0.4)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(196,30,58,0.15)")}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,30,58,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: "#F0B429",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          LIVE PROJECT →
        </div>
        <h3
          style={{
            fontSize: "clamp(22px, 3.5vw, 32px)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: "#F1F5F9",
            margin: "0 0 16px",
          }}
        >
          AI-Powered WebReg
          <br />
          Course Engine
        </h3>
        <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: 560 }}>
          An intelligent course recommendation system integrated into WebReg, leveraging AI to
          personalize academic planning based on your record, degree requirements, career goals,
          and interests.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
            color: "#C41E3A",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: 1,
          }}
        >
          VIEW PROJECT DETAILS
          <span style={{ fontSize: 18, transition: "transform 0.2s" }}>→</span>
        </div>
      </div>
    </section>

    {/* Mission */}
    <section
      style={{
        padding: "80px 24px 120px",
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <blockquote
        style={{
          fontSize: "clamp(18px, 3vw, 26px)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 400,
          color: "#CBD5E1",
          lineHeight: 1.6,
          margin: 0,
          padding: "0 20px",
          borderLeft: "none",
        }}
      >
        "At the USC Marshall School of Business BUAI program,{" "}
        <span style={{ color: "#C41E3A", fontWeight: 600 }}>students are actively using their skills</span>{" "}
        to improve the world around them."
      </blockquote>
      <div
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "#64748B",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 1,
        }}
      >
        MARSHALL SCHOOL OF BUSINESS × VITERBI SCHOOL OF ENGINEERING
      </div>
    </section>
  </div>
);

const ProjectsPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 40, height: 2, background: "#C41E3A" }} />
      <span style={{ fontSize: 11, letterSpacing: 4, color: "#C41E3A", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
        PROJECT 001
      </span>
    </div>
    <h2
      style={{
        fontSize: "clamp(28px, 4vw, 44px)",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        color: "#F1F5F9",
        lineHeight: 1.15,
        margin: "0 0 20px",
      }}
    >
      AI-Powered WebReg
      <br />
      Course Engine
    </h2>
    <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
      One of the first projects emerging from the BBH — an AI-Powered Web Registration Course Engine
      designed to help USC students navigate course selection with greater confidence and personalization.
    </p>

    {/* How it works */}
    <div style={{ marginBottom: 56 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#F1F5F9", fontWeight: 600, marginBottom: 24 }}>
        How It Works
      </h3>
      <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 28 }}>
        Integrated directly into WebReg, the tool leverages AI to recommend courses by analyzing multiple
        dimensions of each student's academic life:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { emoji: "🎓", label: "Academic Record", desc: "Past coursework, grades, and credit progress" },
          { emoji: "📚", label: "Degree Requirements", desc: "Remaining courses needed for your major" },
          { emoji: "💼", label: "Career Goals", desc: "Industry alignment and career trajectory mapping" },
          { emoji: "⭐", label: "Individual Interests", desc: "Elective preferences and exploration areas" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(241,245,249,0.03)",
              border: "1px solid rgba(241,245,249,0.06)",
              borderRadius: 10,
              padding: "24px 20px",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 10 }}>{item.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Goals */}
    <div style={{ marginBottom: 56 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#F1F5F9", fontWeight: 600, marginBottom: 20 }}>
        Project Goals
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          "Streamline the academic advising process",
          "Improve course planning accuracy for students",
          "Create a personalized academic experience at USC",
          "Demonstrate applied AI built by students, for students",
        ].map((goal, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              background: "rgba(196,30,58,0.04)",
              border: "1px solid rgba(196,30,58,0.08)",
              borderRadius: 8,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C41E3A", flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#CBD5E1", fontFamily: "'Inter', sans-serif" }}>{goal}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Faculty Leads */}
    <div style={{ marginBottom: 56 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#F1F5F9", fontWeight: 600, marginBottom: 24 }}>
        Faculty Leads
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { name: "Prof. Milan Miric", url: "https://www.linkedin.com/in/milanmiric/" },
          { name: "Prof. Adel Javanmard", url: "https://www.linkedin.com/in/adel-javanmard-6b287545/" },
          { name: "Prof. Vishal Gupta", url: "https://www.linkedin.com/in/vishal-gupta-usc/" },
        ].map((prof, i) => (
          <a
            key={i}
            href={prof.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "rgba(241,245,249,0.03)",
              border: "1px solid rgba(241,245,249,0.06)",
              borderRadius: 8,
              textDecoration: "none",
              color: "#E2E8F0",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,30,58,0.3)";
              e.currentTarget.style.background = "rgba(196,30,58,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(241,245,249,0.06)";
              e.currentTarget.style.background = "rgba(241,245,249,0.03)";
            }}
          >
            <span>{prof.name}</span>
            <span style={{ fontSize: 12, color: "#64748B" }}>LinkedIn ↗</span>
          </a>
        ))}
      </div>
    </div>

    {/* Student Builders */}
    <div>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#F1F5F9", fontWeight: 600, marginBottom: 24 }}>
        Student Builders
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {["Agastya Bassi", "Tanzil Hussain", "Francis Ruan", "Natalie Lam Johnson", "Avi Chopra"].map((name, i) => (
          <div
            key={i}
            style={{
              padding: "20px 16px",
              background: "rgba(241,245,249,0.03)",
              border: "1px solid rgba(241,245,249,0.06)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `linear-gradient(135deg, rgba(196,30,58,${0.15 + i * 0.08}), rgba(240,180,41,${0.1 + i * 0.05}))`,
                border: "1px solid rgba(196,30,58,0.2)",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#E2E8F0",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              {name.charAt(0)}
            </div>
            <div style={{ fontSize: 13, color: "#E2E8F0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TeamPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 40, height: 2, background: "#C41E3A" }} />
      <span style={{ fontSize: 11, letterSpacing: 4, color: "#C41E3A", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
        OUR TEAM
      </span>
    </div>
    <h2
      style={{
        fontSize: "clamp(28px, 4vw, 40px)",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        color: "#F1F5F9",
        lineHeight: 1.15,
        margin: "0 0 16px",
      }}
    >
      The People Behind the Hub
    </h2>
    <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 56 }}>
      Faculty and students collaborating at the intersection of AI, business, and education.
    </p>

    {/* Faculty */}
    <div style={{ marginBottom: 56 }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: 3,
          color: "#F0B429",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        FACULTY ADVISORS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { name: "Prof. Milan Miric", url: "https://www.linkedin.com/in/milanmiric/", desc: "" },
          { name: "Prof. Adel Javanmard", url: "https://www.linkedin.com/in/adel-javanmard-6b287545/", desc: "" },
          { name: "Prof. Vishal Gupta", url: "https://www.linkedin.com/in/vishal-gupta-usc/", desc: "" },
        ].map((prof, i) => (
          <a
            key={i}
            href={prof.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "24px",
              background: "rgba(196,30,58,0.04)",
              border: "1px solid rgba(196,30,58,0.1)",
              borderRadius: 10,
              textDecoration: "none",
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,30,58,0.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,30,58,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C41E3A 0%, #7A1225 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                color: "#fff",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {prof.name.split(" ").pop().charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#F1F5F9", fontFamily: "'Space Grotesk', sans-serif" }}>
                {prof.name}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
                USC Faculty · {prof.desc || "View LinkedIn profile ↗"}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>

    {/* Student Builders */}
    <div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: 3,
          color: "#F0B429",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        STUDENT BUILDERS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {["Agastya Bassi", "Tanzil Hussain", "Francis Ruan", "Natalie Lam Johnson", "Avi Chopra"].map((name, i) => (
          <div
            key={i}
            style={{
              padding: "32px 24px",
              background: "rgba(241,245,249,0.025)",
              border: "1px solid rgba(241,245,249,0.06)",
              borderRadius: 10,
              textAlign: "center",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(240,180,41,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(241,245,249,0.06)")}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, rgba(196,30,58,${0.2 + i * 0.06}), rgba(240,180,41,${0.12 + i * 0.04}))`,
                border: "1px solid rgba(196,30,58,0.15)",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#F1F5F9",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
              }}
            >
              {name.charAt(0)}
            </div>
            <div style={{ fontSize: 15, color: "#F1F5F9", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 6 }}>
              {name}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'Inter', sans-serif" }}>BUAI Student Builder</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BuaiPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 40, height: 2, background: "#C41E3A" }} />
      <span style={{ fontSize: 11, letterSpacing: 4, color: "#C41E3A", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
        THE PROGRAM
      </span>
    </div>
    <h2
      style={{
        fontSize: "clamp(28px, 4vw, 40px)",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        color: "#F1F5F9",
        lineHeight: 1.15,
        margin: "0 0 20px",
      }}
    >
      What is BUAI?
    </h2>
    <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 40 }}>
      The Bachelor of Science in Artificial Intelligence for Business (BUAI) is a joint degree
      offered by the USC Marshall School of Business and the USC Viterbi School of Engineering.
      Launched in Fall 2023, it is widely recognized as the nation's first undergraduate degree
      to combine artificial intelligence with strategic business foundations.
    </p>

    {/* Key stats */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 16,
        marginBottom: 56,
      }}
    >
      {[
        { value: "4th", label: "Year of Program" },
        { value: "~40", label: "Students per Cohort" },
        { value: "128", label: "Units Required" },
        { value: "2", label: "Schools, One Degree" },
      ].map((stat, i) => (
        <div
          key={i}
          style={{
            padding: "28px 20px",
            background: "rgba(196,30,58,0.04)",
            border: "1px solid rgba(196,30,58,0.1)",
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#C41E3A",
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: 6,
            }}
          >
            {stat.value}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
            {stat.label.toUpperCase()}
          </div>
        </div>
      ))}
    </div>

    {/* Program pillars */}
    <div style={{ marginBottom: 56 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#F1F5F9", fontWeight: 600, marginBottom: 24 }}>
        Program Pillars
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          {
            title: "Integrated Curriculum",
            desc: "Courses from both Marshall and Viterbi — blending business strategy with AI/ML, NLP, computer vision, and ethics. Classes are updated in real-time based on industry trends.",
          },
          {
            title: "Industry Partnerships",
            desc: "Partnerships with organizations like OpenAI, plus priority registration access and exclusive BUAI-only internship opportunities at companies like Google, Apple, Amazon, McKinsey, and NVIDIA.",
          },
          {
            title: "Tight-Knit Community",
            desc: "Only ~40 students per cohort — creating an intimate community with 1-on-1 Big/Little mentorship, cohorted events, BUAI socials, and formal galas.",
          },
          {
            title: "Builder Culture",
            desc: "The BUAI Builder Hub and Marshall AI Association (MAIA) provide collaborative spaces for developing real AI agents, conducting research, and creating portfolio-ready projects.",
          },
        ].map((pillar, i) => (
          <div
            key={i}
            style={{
              padding: "24px",
              background: "rgba(241,245,249,0.025)",
              border: "1px solid rgba(241,245,249,0.06)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
              {pillar.title}
            </div>
            <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
              {pillar.desc}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Program founders */}
    <div
      style={{
        padding: "28px",
        background: "rgba(196,30,58,0.04)",
        border: "1px solid rgba(196,30,58,0.1)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#F0B429", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 12 }}>
        PROGRAM ORIGINS
      </div>
      <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", margin: 0 }}>
        BUAI was conceived by Professors Kimon Drakopoulos and Ramandeep Randhawa at USC Marshall,
        who recognized that the people with technical AI expertise often weren't the ones making
        decisions on how to use the technology. The program launched in Fall 2023 with its first cohort
        of 48 students, and graduates receive a diploma signed by the deans of both Marshall and Viterbi.
      </p>
    </div>

    <div style={{ marginTop: 40, textAlign: "center" }}>
      <a
        href="https://www.marshall.usc.edu/programs/undergraduate-programs/undergraduate-degrees/bs-artificial-intelligence-for-business-buai"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 28px",
          background: "#C41E3A",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: 1,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#A8152E")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#C41E3A")}
      >
        LEARN MORE AT USC MARSHALL ↗
      </a>
    </div>
  </div>
);

const ContactPage = () => {
  const [suggestion, setSuggestion] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (suggestion.trim()) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setSuggestion("");
      setEmail("");
    }
  };

  return (
    <div style={{ padding: "120px 24px 100px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: "#C41E3A" }} />
        <span style={{ fontSize: 11, letterSpacing: 4, color: "#C41E3A", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          GET IN TOUCH
        </span>
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 4vw, 40px)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: "#F1F5F9",
          lineHeight: 1.15,
          margin: "0 0 12px",
        }}
      >
        What should we build next?
      </h2>
      <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
        Have an idea for an AI project? A problem you wish someone would solve?
        We want to hear from you.
      </p>

      {/* Suggestion Form */}
      <div
        style={{
          background: "rgba(241,245,249,0.025)",
          border: "1px solid rgba(241,245,249,0.08)",
          borderRadius: 14,
          padding: "36px",
          marginBottom: 40,
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: 12,
            letterSpacing: 2,
            color: "#94A3B8",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          YOUR EMAIL (OPTIONAL)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@usc.edu"
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "rgba(8,9,13,0.6)",
            border: "1px solid rgba(241,245,249,0.08)",
            borderRadius: 8,
            color: "#E2E8F0",
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: 12,
            letterSpacing: 2,
            color: "#94A3B8",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          YOUR IDEA
        </label>
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Describe the AI project or problem you'd like us to tackle..."
          rows={5}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "rgba(8,9,13,0.6)",
            border: "1px solid rgba(241,245,249,0.08)",
            borderRadius: 8,
            color: "#E2E8F0",
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.6,
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            padding: "14px 32px",
            background: suggestion.trim() ? "#C41E3A" : "rgba(196,30,58,0.3)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: 1,
            cursor: suggestion.trim() ? "pointer" : "default",
            transition: "background 0.2s",
          }}
        >
          {sent ? "✓ SENT!" : "SUBMIT IDEA"}
        </button>
      </div>

      {/* Direct contact */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#64748B", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>
          Or reach us directly:
        </p>
        <a
          href="mailto:bbh@usc.edu"
          style={{
            color: "#C41E3A",
            fontSize: 18,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: 1,
          }}
        >
          bbh@usc.edu
        </a>
      </div>
    </div>
  );
};

// ─── Main App ───
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget?.getBoundingClientRect?.();
    if (rect) {
      setMouseX(e.clientX / rect.width);
      setMouseY(e.clientY / rect.height);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setMenuOpen(false);
  }, [activeTab]);

  const tabs = [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "team", label: "Team" },
    { id: "buai", label: "What is BUAI" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        width: "100%",
        height: "100vh",
        background: "#08090d",
        color: "#F1F5F9",
        fontFamily: "'Inter', sans-serif",
        overflow: "auto",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        ::selection { background: rgba(196,30,58,0.3); color: #F1F5F9; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #08090d; }
        ::-webkit-scrollbar-thumb { background: rgba(196,30,58,0.3); border-radius: 3px; }
      `}</style>

      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(8,9,13,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(241,245,249,0.05)" : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        }}
      >
        <div
          onClick={() => setActiveTab("home")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "linear-gradient(135deg, #C41E3A, #7A1225)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#F1F5F9",
              letterSpacing: 1.5,
            }}
          >
            BBH
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 4 }} className="desktop-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                background: activeTab === tab.id ? "rgba(196,30,58,0.12)" : "transparent",
                border: "none",
                borderRadius: 6,
                color: activeTab === tab.id ? "#C41E3A" : "#94A3B8",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: 1,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#F1F5F9",
            fontSize: 22,
            cursor: "pointer",
            padding: 8,
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            top: 64,
            background: "rgba(8,9,13,0.97)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 32px",
                background: activeTab === tab.id ? "rgba(196,30,58,0.12)" : "transparent",
                border: "none",
                borderRadius: 8,
                color: activeTab === tab.id ? "#C41E3A" : "#94A3B8",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: 1,
                cursor: "pointer",
                width: 240,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Page Content */}
      {activeTab === "home" && <HomePage mouseX={mouseX} mouseY={mouseY} setActiveTab={setActiveTab} />}
      {activeTab === "projects" && <ProjectsPage />}
      {activeTab === "team" && <TeamPage />}
      {activeTab === "buai" && <BuaiPage />}
      {activeTab === "contact" && <ContactPage />}

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(241,245,249,0.05)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "#475569", fontFamily: "'Inter', sans-serif", lineHeight: 1.8 }}>
          BUAI Builder Hub · USC Marshall School of Business × Viterbi School of Engineering
          <br />
          <a href="mailto:bbh@usc.edu" style={{ color: "#64748B", textDecoration: "none" }}>
            bbh@usc.edu
          </a>
          {" · "}
          <a
            href="https://www.marshall.usc.edu/programs/undergraduate-programs/undergraduate-degrees/bs-artificial-intelligence-for-business-buai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#64748B", textDecoration: "none" }}
          >
            USC BUAI Program ↗
          </a>
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
