import { useState, useEffect, useRef, useCallback } from "react";

// ─── NOTE ON THEME ───
// Vishal flagged he's not sold on the black background and wants Tanzil's
// input since she's been doing USC-theming work on the validator GUI.
// Left as-is for now — this is her call to make, not changed unilaterally.

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
      <circle cx={cx} cy={cy} r={innerR * 0.45} fill="#F7F7F5" />
      <circle cx={cx} cy={cy} r={innerR * 0.2} fill={fill} opacity="0.4" />
    </g>
  );
};

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
              background: i % 3 === 0 ? "#990000" : "#D4AF37",
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

const NeuralLines = ({ mouseX, mouseY }) => {
  const nodes = useRef(
    Array.from({ length: 12 }, () => ({ x: Math.random() * 100, y: Math.random() * 100 }))
  ).current;

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {nodes.map((n, i) =>
        nodes.slice(i + 1).map((m, j) => {
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist > 40) return null;
          return (
            <line key={`${i}-${j}`} x1={n.x + (mouseX - 0.5) * 2} y1={n.y + (mouseY - 0.5) * 2} x2={m.x + (mouseX - 0.5) * 1.5} y2={m.y + (mouseY - 0.5) * 1.5} stroke="#990000" strokeWidth="0.08" opacity={0.15 - dist * 0.003} />
          );
        })
      )}
    </svg>
  );
};

const GearSystem = ({ mouseX, mouseY }) => {
  const baseRotation = mouseX * 360 + mouseY * 180;
  const gears = [
    { cx: 200, cy: 200, teeth: 16, innerR: 55, outerR: 72, mult: 1, fill: "#990000" },
    { cx: 330, cy: 175, teeth: 12, innerR: 40, outerR: 54, mult: -1.33, fill: "#7A0000" },
    { cx: 145, cy: 330, teeth: 10, innerR: 32, outerR: 44, mult: -1.6, fill: "#D4AF37" },
    { cx: 430, cy: 240, teeth: 20, innerR: 65, outerR: 82, mult: 0.8, fill: "#600000" },
    { cx: 290, cy: 310, teeth: 8, innerR: 25, outerR: 36, mult: -2, fill: "#C4A030" },
    { cx: 100, cy: 140, teeth: 14, innerR: 45, outerR: 60, mult: -1.14, fill: "#8A0000" },
    { cx: 480, cy: 130, teeth: 6, innerR: 20, outerR: 30, mult: 2.67, fill: "#D4AF37", opacity: 0.6 },
    { cx: 530, cy: 310, teeth: 10, innerR: 30, outerR: 42, mult: -1.6, fill: "#990000", opacity: 0.4 },
  ];
  return (
    <svg viewBox="0 0 600 420" style={{ width: "100%", maxWidth: 600, height: "auto", filter: "drop-shadow(0 0 40px rgba(153,0,0,0.15))" }}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#990000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#990000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="420" fill="url(#glow)" />
      {gears.map((g, i) => (
        <Gear key={i} cx={g.cx} cy={g.cy} teeth={g.teeth} innerR={g.innerR} outerR={g.outerR} rotation={baseRotation * g.mult} fill={g.fill} opacity={g.opacity || 1} />
      ))}
      <text x="300" y="205" textAnchor="middle" fill="#1C1C1F" fontSize="13" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" letterSpacing="3">
        BUILDER HUB
      </text>
    </svg>
  );
};

// ─── Shared data ───
const ADVISORS = [
  { name: "Prof. Adel Javanmard", url: "https://www.linkedin.com/in/adel-javanmard-6b287545/" },
  { name: "Prof. Vishal Gupta", url: "https://www.linkedin.com/in/vishal-gupta-usc/" },
];

const STUDENT_BUILDERS = ["Agastya Bassi", "Tanzil Hussain", "Francis Ruan", "Natalie Lam Johnson", "Abhibhav Dujodwala"];

// NOTE: tool names are placeholders — Vishal flagged the current names need a team brainstorm.
const TOOLS = [
  {
    id: "next-sem-validator",
    name: "Next Semester Validator",
    nameIsPlaceholder: true,
    tagline: "Check your planned schedule before you register",
    description:
      "Upload your STARS report and pick the sections you're planning to register for next semester. The validator checks for time conflicts, full sections, D-clearance requirements, and missing lab or discussion sections — catching the things that would make a WebReg registration attempt fail, before you try it.",
    status: "live",
    link: "https://cozy-sundae-1c8292.netlify.app/",
    team: STUDENT_BUILDERS,
  },
  {
    id: "degree-plan-validator",
    name: "Degree Plan Validator",
    nameIsPlaceholder: true,
    tagline: "Check a full multi-semester plan against your degree requirements",
    description:
      "Takes a student's intended majors, minors, and emphases along with a plan for remaining semesters, and checks it against actual degree requirements — flagging missing required courses, unit overloads, and other issues across the full path to graduation, not just next semester.",
    status: "in_progress",
    link: null,
    team: STUDENT_BUILDERS,
  },
  {
    id: "stars-collection-tool",
    name: "STARS Collection Tool",
    nameIsPlaceholder: true,
    tagline: "Help us gather anonymized STARS reports to test the tools",
    description:
      "Upload your STARS report and the app removes your name, address, student ID, grades, and GPA, turning grades into simple pass/fail markers — entirely in your browser, nothing sent to a server. Anonymized samples help us test and improve the other BBH tools.",
    status: "live",
    link: "https://huggingface.co/spaces/buai-builder-hub/STARSRedacter",
    team: STUDENT_BUILDERS,
  },
];

const HomePage = ({ mouseX, mouseY, setActiveTab }) => (
  <div>
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "60px 24px 80px", overflow: "hidden" }}>
      <NeuralLines mouseX={mouseX} mouseY={mouseY} />
      <Particles mouseX={mouseX} mouseY={mouseY} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 800 }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 16, textTransform: "uppercase" }}>
          USC Marshall × Viterbi
        </div>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 72px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.05, margin: "0 0 8px" }}>
          BUAI
          <br />
          <span style={{ color: "#990000" }}>Builder Hub</span>
        </h1>
        <p style={{ fontSize: "clamp(13px, 2vw, 17px)", color: "#52525B", fontFamily: "'Inter', sans-serif", maxWidth: 520, margin: "16px auto 0", lineHeight: 1.7 }}>
          Tools by Students, for Students.
        </p>
        <p style={{ fontSize: "clamp(12px, 1.6vw, 14px)", color: "#5B5B63", fontFamily: "'Inter', sans-serif", maxWidth: 480, margin: "10px auto 0", lineHeight: 1.7 }}>
          A collaborative space for USC students to build real AI solutions — from prototype to impact.
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 2, marginTop: 24, width: "100%", maxWidth: 600 }}>
        <GearSystem mouseX={mouseX} mouseY={mouseY} />
      </div>
      <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#71717A", fontSize: 10, letterSpacing: 2, fontFamily: "'Space Grotesk', sans-serif", animation: "pulse 2s infinite" }}>
        <span>SCROLL</span>
        <span style={{ fontSize: 16 }}>↓</span>
      </div>
    </section>

    <section style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: "#990000" }} />
        <span style={{ fontSize: 11, letterSpacing: 4, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>WHAT WE DO</span>
      </div>
      <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 28px" }}>
        What is the BBH?
      </h2>
      <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", maxWidth: 680 }}>
        The BUAI Builder Hub (BBH) is a collaborative space where students build AI agents and
        tools in a safe, controlled testing environment — designed to complement classroom
        learning with hands-on, portfolio-ready experience. BBH draws its students from two
        undergraduate AI communities at USC Marshall:{" "}
        <a href="https://www.marshall.usc.edu/programs/undergraduate-programs/undergraduate-degrees/bs-artificial-intelligence-for-business-buai" target="_blank" rel="noopener noreferrer" style={{ color: "#990000", fontWeight: 600, textDecoration: "none" }}>
          BUAI
        </a>{" "}
        (the AI for Business degree) and{" "}
        <a href="https://www.uscmaia.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#990000", fontWeight: 600, textDecoration: "none" }}>
          MAIA
        </a>{" "}
        (the Marshall Artificial Intelligence Association). Located at ACC 215, the BBH connects
        students with faculty mentors to build tools that solve real problems for the USC community.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 48 }}>
        {[
          { icon: "⚙️", title: "Build", desc: "Create AI agents and tools in a controlled sandbox environment" },
          { icon: "🧪", title: "Test", desc: "Safe synthetic models for experimentation without risk" },
          { icon: "🤝", title: "Collaborate", desc: "Faculty-mentored teams working on applied AI challenges" },
          { icon: "📂", title: "Ship", desc: "Portfolio-ready projects with real-world impact" },
        ].map((item, i) => (
          <div key={i} style={{ background: "rgba(153,0,0,0.04)", border: "1px solid rgba(153,0,0,0.12)", borderRadius: 10, padding: "28px 24px", transition: "border-color 0.3s, background 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.35)"; e.currentTarget.style.background = "rgba(153,0,0,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.12)"; e.currentTarget.style.background = "rgba(153,0,0,0.04)"; }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#5B5B63", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </section>

    <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: "#D4AF37" }} />
        <span style={{ fontSize: 11, letterSpacing: 4, color: "#D4AF37", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>CURRENT PROJECT UMBRELLA</span>
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(153,0,0,0.06) 0%, rgba(212,175,55,0.04) 100%)", border: "1px solid rgba(153,0,0,0.15)", borderRadius: 14, padding: "clamp(32px, 5vw, 56px)", position: "relative", overflow: "hidden", cursor: "pointer", transition: "border-color 0.3s" }}
        onClick={() => setActiveTab("projects")}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(153,0,0,0.4)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(153,0,0,0.15)")}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(153,0,0,0.08) 0%, transparent 70%)" }} />
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#D4AF37", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 16 }}>3 TOOLS, ONE GOAL →</div>
        <h3 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: "0 0 16px" }}>Course Registration Support</h3>
        <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: 560 }}>
          Three connected tools that help USC students plan and register for classes with more
          confidence — validating a next-semester schedule, checking a full multi-semester degree
          plan, and gathering anonymized data to keep testing and improving both.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, color: "#990000", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1 }}>
          VIEW ALL 3 TOOLS
          <span style={{ fontSize: 18, transition: "transform 0.2s" }}>→</span>
        </div>
      </div>
    </section>

    <section style={{ padding: "80px 24px 120px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
      <blockquote style={{ fontSize: "clamp(18px, 3vw, 26px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400, color: "#3F3F46", lineHeight: 1.6, margin: 0, padding: "0 20px" }}>
        "At the USC Marshall School of Business BUAI program,{" "}
        <span style={{ color: "#990000", fontWeight: 600 }}>students are actively using their skills</span>{" "}
        to improve the world around them."
      </blockquote>
      <div style={{ marginTop: 24, fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
        MARSHALL SCHOOL OF BUSINESS × VITERBI SCHOOL OF ENGINEERING
      </div>
    </section>
  </div>
);

const ToolCard = ({ tool }) => (
  <div style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "clamp(28px, 4vw, 44px)", marginBottom: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
      <h3 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: 0 }}>{tool.name}</h3>
      {tool.nameIsPlaceholder && (
        <span title="Placeholder name — team is brainstorming a better one" style={{ fontSize: 10, letterSpacing: 1, color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 5, padding: "3px 8px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          NAME TBD
        </span>
      )}
      <span style={{ fontSize: 10, letterSpacing: 1, color: tool.status === "live" ? "#4ADE80" : "#52525B", border: `1px solid ${tool.status === "live" ? "rgba(74,222,128,0.3)" : "rgba(0,0,0,0.25)"}`, borderRadius: 5, padding: "3px 8px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
        {tool.status === "live" ? "LIVE" : "UNDER CONSTRUCTION"}
      </span>
    </div>
    <p style={{ fontSize: 13, color: "#D4AF37", fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 14 }}>{tool.tagline}</p>
    <p style={{ fontSize: 14.5, color: "#52525B", lineHeight: 1.75, fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>{tool.description}</p>
    {tool.link ? (
      <a href={tool.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#990000", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5, marginBottom: 28 }}>
        TRY IT ↗
      </a>
    ) : (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "rgba(0,0,0,0.08)", color: "#5B5B63", borderRadius: 7, fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5, marginBottom: 28 }}>
        UNDER CONSTRUCTION
      </div>
    )}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <div style={{ fontSize: 10.5, letterSpacing: 2, color: "#5B5B63", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10 }}>ADVISORS</div>
        {ADVISORS.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: 4 }}>{a.name}</a>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 10.5, letterSpacing: 2, color: "#5B5B63", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10 }}>TEAM</div>
        {tool.team.map((name, i) => (
          <div key={i} style={{ fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{name}</div>
        ))}
      </div>
    </div>
  </div>
);

const ProjectsPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 40, height: 2, background: "#990000" }} />
      <span style={{ fontSize: 11, letterSpacing: 4, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>COURSE REGISTRATION SUPPORT</span>
    </div>
    <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 20px" }}>Our Projects</h2>
    <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
      Three tools, built by the same team, working together to make USC course registration and degree planning less painful.
    </p>
    {TOOLS.map((tool) => (
      <ToolCard key={tool.id} tool={tool} />
    ))}
  </div>
);

const TeamPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 40, height: 2, background: "#990000" }} />
      <span style={{ fontSize: 11, letterSpacing: 4, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>OUR TEAM</span>
    </div>
    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 16px" }}>The People Behind the Hub</h2>
    <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>
      Faculty and students collaborating at the intersection of AI, business, and education. Every
      person below works across all 3 Course Registration Support tools — see the{" "}
      <span style={{ color: "#990000" }}>Projects</span> page for per-tool details.
    </p>

    <div style={{ marginBottom: 56 }}>
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#D4AF37", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 24 }}>FACULTY ADVISORS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ADVISORS.map((prof, i) => (
          <a key={i} href={prof.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px", background: "rgba(153,0,0,0.04)", border: "1px solid rgba(153,0,0,0.1)", borderRadius: 10, textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #990000 0%, #600000 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, flexShrink: 0 }}>
              {prof.name.split(" ").pop().charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif" }}>{prof.name}</div>
              <div style={{ fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>USC Faculty · View LinkedIn profile ↗</div>
            </div>
          </a>
        ))}
      </div>
    </div>

    <div>
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#D4AF37", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 24 }}>STUDENT BUILDERS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {STUDENT_BUILDERS.map((name, i) => (
          <div key={i} style={{ padding: "32px 24px", background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10, textAlign: "center", transition: "border-color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)")}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, rgba(153,0,0,${0.2 + i * 0.06}), rgba(212,175,55,${0.12 + i * 0.04}))`, border: "1px solid rgba(153,0,0,0.15)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              {name.charAt(0)}
            </div>
            <div style={{ fontSize: 15, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 6 }}>{name}</div>
            <div style={{ fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif" }}>BUAI Student Builder</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BuaiPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 40, height: 2, background: "#990000" }} />
      <span style={{ fontSize: 11, letterSpacing: 4, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>THE PROGRAMS</span>
    </div>
    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 20px" }}>BUAI &amp; MAIA</h2>
    <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 40 }}>
      The BBH draws its student builders from two USC Marshall AI communities — a formal degree program and a student organization.
    </p>

    <div style={{ marginBottom: 48 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1F", fontWeight: 600, marginBottom: 16 }}>BUAI — the degree</h3>
      <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
        The Bachelor of Science in Artificial Intelligence for Business (BUAI) is a joint degree
        offered by the USC Marshall School of Business and the USC Viterbi School of Engineering.
        Launched in Fall 2023, it is widely recognized as the nation's first undergraduate degree
        to combine artificial intelligence with strategic business foundations.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 8 }}>
        {[
          { value: "4th", label: "Year of Program" },
          { value: "~40", label: "Students per Cohort" },
          { value: "128", label: "Units Required" },
          { value: "2", label: "Schools, One Degree" },
        ].map((stat, i) => (
          <div key={i} style={{ padding: "28px 20px", background: "rgba(153,0,0,0.04)", border: "1px solid rgba(153,0,0,0.1)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "#5B5B63", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>{stat.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <a href="https://www.marshall.usc.edu/programs/undergraduate-programs/undergraduate-degrees/bs-artificial-intelligence-for-business-buai" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 20, color: "#990000", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", textDecoration: "none", letterSpacing: 1 }}>
        LEARN MORE AT USC MARSHALL ↗
      </a>
    </div>

    <div style={{ marginBottom: 48 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1F", fontWeight: 600, marginBottom: 16 }}>MAIA — the student org</h3>
      <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
        The Marshall Artificial Intelligence Association (MAIA) is USC's first student-led AI
        organization, focused on applying real machine learning and AI to different industries
        through hands-on projects and company partnerships each semester — open to students beyond just BUAI majors.
      </p>
      <a href="https://www.uscmaia.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: "#990000", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", textDecoration: "none", letterSpacing: 1 }}>
        VISIT MAIA ↗
      </a>
    </div>

    <div style={{ marginBottom: 56 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1F", fontWeight: 600, marginBottom: 24 }}>Program Pillars</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { title: "Integrated Curriculum", desc: "Courses from both Marshall and Viterbi — blending business strategy with AI/ML, NLP, computer vision, and ethics." },
          { title: "Industry Partnerships", desc: "Priority registration access and exclusive internship opportunities at companies like Google, Apple, Amazon, McKinsey, and NVIDIA." },
          { title: "Tight-Knit Community", desc: "Small cohorts creating an intimate community with mentorship, cohorted events, and socials." },
          { title: "Builder Culture", desc: "The BUAI Builder Hub and MAIA provide collaborative spaces for developing real AI agents, conducting research, and creating portfolio-ready projects." },
        ].map((pillar, i) => (
          <div key={i} style={{ padding: "24px", background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#27272A", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>{pillar.title}</div>
            <div style={{ fontSize: 14, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{pillar.desc}</div>
          </div>
        ))}
      </div>
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
        <div style={{ width: 40, height: 2, background: "#990000" }} />
        <span style={{ fontSize: 11, letterSpacing: 4, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>GET IN TOUCH</span>
      </div>
      <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 12px" }}>What should we build next?</h2>
      <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 48 }}>
        Have an idea for an AI project? A problem you wish someone would solve? We want to hear from you.
      </p>
      <div style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "36px", marginBottom: 40 }}>
        <label style={{ display: "block", fontSize: 12, letterSpacing: 2, color: "#52525B", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10 }}>YOUR EMAIL (OPTIONAL)</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@usc.edu"
          style={{ width: "100%", padding: "14px 16px", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, color: "#27272A", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
        <label style={{ display: "block", fontSize: 12, letterSpacing: 2, color: "#52525B", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10 }}>YOUR IDEA</label>
        <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} placeholder="Describe the AI project or problem you'd like us to tackle..." rows={5}
          style={{ width: "100%", padding: "14px 16px", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, color: "#27272A", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6, marginBottom: 20, boxSizing: "border-box" }} />
        <button onClick={handleSubmit} style={{ padding: "14px 32px", background: suggestion.trim() ? "#990000" : "rgba(153,0,0,0.3)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: suggestion.trim() ? "pointer" : "default", transition: "background 0.2s" }}>
          {sent ? "✓ SENT!" : "SUBMIT IDEA"}
        </button>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#5B5B63", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>Or reach us directly:</p>
        <a href="mailto:bbh@usc.edu" style={{ color: "#990000", fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, textDecoration: "none", letterSpacing: 1 }}>bbh@usc.edu</a>
      </div>
    </div>
  );
};

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
    { id: "buai", label: "BUAI & MAIA" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} style={{ width: "100%", height: "100vh", background: "#F7F7F5", color: "#1C1C1F", fontFamily: "'Inter', sans-serif", overflow: "auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        ::selection { background: rgba(153,0,0,0.3); color: #1C1C1F; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F7F7F5; }
        ::-webkit-scrollbar-thumb { background: rgba(153,0,0,0.3); border-radius: 3px; }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(255,255,255,0.92)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.05)" : "1px solid transparent", transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s" }}>
        <div onClick={() => setActiveTab("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg, #990000, #600000)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>B</div>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1F", letterSpacing: 1.5 }}>BBH</span>
        </div>
        <div style={{ display: "flex", gap: 4 }} className="desktop-nav">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "8px 16px", background: activeTab === tab.id ? "rgba(153,0,0,0.12)" : "transparent", border: "none", borderRadius: 6, color: activeTab === tab.id ? "#990000" : "#52525B", fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: "pointer", transition: "all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", color: "#1C1C1F", fontSize: 22, cursor: "pointer", padding: 8 }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, top: 64, background: "rgba(255,255,255,0.97)", zIndex: 99, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "14px 32px", background: activeTab === tab.id ? "rgba(153,0,0,0.12)" : "transparent", border: "none", borderRadius: 8, color: activeTab === tab.id ? "#990000" : "#52525B", fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: "pointer", width: 240 }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "home" && <HomePage mouseX={mouseX} mouseY={mouseY} setActiveTab={setActiveTab} />}
      {activeTab === "projects" && <ProjectsPage />}
      {activeTab === "team" && <TeamPage />}
      {activeTab === "buai" && <BuaiPage />}
      {activeTab === "contact" && <ContactPage />}

      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.05)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#71717A", fontFamily: "'Inter', sans-serif", lineHeight: 1.8 }}>
          BUAI Builder Hub · Tools by Students, for Students
          <br />
          USC Marshall School of Business × Viterbi School of Engineering
          <br />
          <a href="mailto:bbh@usc.edu" style={{ color: "#5B5B63", textDecoration: "none" }}>bbh@usc.edu</a>
          {" · "}
          <a href="https://www.marshall.usc.edu/programs/undergraduate-programs/undergraduate-degrees/bs-artificial-intelligence-for-business-buai" target="_blank" rel="noopener noreferrer" style={{ color: "#5B5B63", textDecoration: "none" }}>BUAI ↗</a>
          {" · "}
          <a href="https://www.uscmaia.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#5B5B63", textDecoration: "none" }}>MAIA ↗</a>
        </div>
      </footer>

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
