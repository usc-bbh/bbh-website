import { useState, useEffect, useRef } from "react";

// ─── NOTE ON THEME ───
// Colors: USC Cardinal (#990000) + muted Gold (#D4AF37), light background.
// Hero gear animation removed per Vishal's feedback — replaced with a
// simpler, cleaner layout (neural lines + particles kept, no spinning gears).

// ─── Magnetic dot grid — dots ripple away from the cursor, spring back ───
const MagneticDotGrid = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const dotsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;

    const SPACING = 34;
    const RADIUS = 1.6;
    const REPEL_DIST = 90;
    const REPEL_STRENGTH = 26;
    const SPRING = 0.12;
    const DAMPING = 0.82;

    const buildGrid = () => {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dots = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * SPACING;
          const oy = r * SPACING;
          dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0, gold: (r * cols + c) % 5 === 0 });
        }
      }
      dotsRef.current = dots;
    };

    const step = () => {
      const { x: mx, y: my } = mouseRef.current;
      const dots = dotsRef.current;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.hypot(dx, dy);

        if (dist < REPEL_DIST) {
          const force = (1 - dist / REPEL_DIST) * REPEL_STRENGTH;
          const angle = Math.atan2(dy, dx);
          d.vx += Math.cos(angle) * force * 0.06;
          d.vy += Math.sin(angle) * force * 0.06;
        }

        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;
        d.vx *= DAMPING;
        d.vy *= DAMPING;
        d.x += d.vx;
        d.y += d.vy;

        const displacement = Math.hypot(d.x - d.ox, d.y - d.oy);
        const alpha = Math.min(0.45, 0.1 + displacement * 0.012);

        ctx.beginPath();
        ctx.arc(d.x, d.y, RADIUS + Math.min(1.2, displacement * 0.03), 0, Math.PI * 2);
        ctx.fillStyle = d.gold ? `rgba(212,175,55,${alpha})` : `rgba(153,0,0,${alpha})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    const handleResize = () => buildGrid();

    buildGrid();
    rafRef.current = requestAnimationFrame(step);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};

// ─── Shared data ───
const ADVISORS = [
  { name: "Prof. Adel Javanmard", url: "https://www.linkedin.com/in/adel-javanmard-6b287545/" },
  { name: "Prof. Vishal Gupta", url: "https://www.linkedin.com/in/vishal-gupta-usc/" },
];

// Abhi removed from public team listing per request.
// Photos: none yet — falls back to initials avatar. Add a `photo` field
// (path under public/team/) per person once headshots are available.
const STUDENT_BUILDERS = [
  { name: "Agastya Bassi", linkedin: "https://www.linkedin.com/in/agastya-bassi/", photo: null },
  { name: "Tanzil Hussain", linkedin: "https://www.linkedin.com/in/tanzilhussain/", photo: null },
  { name: "Francis Ruan", linkedin: "https://www.linkedin.com/in/francisruan/", photo: null },
  { name: "Natalie Lam Johnson", linkedin: "https://www.linkedin.com/in/natalie-lam-johnson/", photo: null },
];

const TOOLS = [
  {
    id: "next-sem-validator",
    name: "Next Semester Validator",
    nameIsPlaceholder: true,
    tagline: "Check your planned schedule before you register",
    description:
      "Upload your STARS report and pick the sections you're planning to register for next semester. The validator checks for time conflicts, full sections, D-clearance requirements, and missing lab or discussion sections — catching the things that would make a WebReg registration attempt fail, before you try it.",
    status: "live",
    link: "https://usc-bbh.github.io/next-sem-validator/",
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

// ─── Avatar: real photo if provided, else initials circle ───
const Avatar = ({ person, size = 56 }) => {
  if (person.photo) {
    return (
      <img
        src={person.photo}
        alt={person.name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(153,0,0,0.15)", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #990000 0%, #600000 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, flexShrink: 0,
      }}
    >
      {person.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
    </div>
  );
};

const HomePage = ({ setActiveTab }) => (
  <div>
    <section style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "60px 24px 80px", overflow: "hidden" }}>
      <MagneticDotGrid />
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
        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("projects")}
            style={{ padding: "13px 30px", background: "#990000", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: "pointer" }}
          >
            VIEW PROJECTS
          </button>
          <button
            onClick={() => setActiveTab("team")}
            style={{ padding: "13px 30px", background: "transparent", color: "#990000", border: "1px solid rgba(153,0,0,0.3)", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: "pointer" }}
          >
            MEET THE TEAM
          </button>
        </div>
      </div>
    </section>

    <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
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

    <section style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: "#D4AF37" }} />
        <span style={{ fontSize: 11, letterSpacing: 4, color: "#B8952E", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>CURRENT PROJECT UMBRELLA</span>
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(153,0,0,0.05) 0%, rgba(212,175,55,0.05) 100%)", border: "1px solid rgba(153,0,0,0.15)", borderRadius: 14, padding: "clamp(32px, 5vw, 56px)", position: "relative", overflow: "hidden", cursor: "pointer", transition: "border-color 0.3s" }}
        onClick={() => setActiveTab("projects")}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(153,0,0,0.4)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(153,0,0,0.15)")}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#B8952E", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 16 }}>3 TOOLS, ONE GOAL →</div>
        <h3 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: "0 0 16px" }}>Course Registration Support</h3>
        <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: 560 }}>
          Three connected tools that help USC students plan and register for classes with more
          confidence — validating a next-semester schedule, checking a full multi-semester degree
          plan, and gathering anonymized data to keep testing and improving both.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, color: "#990000", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1 }}>
          VIEW ALL 3 TOOLS
          <span style={{ fontSize: 18 }}>→</span>
        </div>
      </div>
    </section>

    <section style={{ padding: "60px 24px 100px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
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
        <span title="Placeholder name — team is brainstorming a better one" style={{ fontSize: 10, letterSpacing: 1, color: "#B8952E", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 5, padding: "3px 8px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          NAME TBD
        </span>
      )}
      <span style={{ fontSize: 10, letterSpacing: 1, color: tool.status === "live" ? "#16A34A" : "#5B5B63", border: `1px solid ${tool.status === "live" ? "rgba(22,163,74,0.35)" : "rgba(0,0,0,0.15)"}`, borderRadius: 5, padding: "3px 8px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
        {tool.status === "live" ? "LIVE" : "UNDER CONSTRUCTION"}
      </span>
    </div>
    <p style={{ fontSize: 13, color: "#B8952E", fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: 14 }}>{tool.tagline}</p>
    <p style={{ fontSize: 14.5, color: "#52525B", lineHeight: 1.75, fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>{tool.description}</p>
    {tool.link ? (
      <a href={tool.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#990000", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5, marginBottom: 28 }}>
        TRY IT ↗
      </a>
    ) : (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "rgba(0,0,0,0.05)", color: "#5B5B63", borderRadius: 7, fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5, marginBottom: 28 }}>
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
        {tool.team.map((person, i) => (
          person.linkedin ? (
            <a key={i} href={person.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: 4 }}>{person.name}</a>
          ) : (
            <div key={i} style={{ fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{person.name}</div>
          )
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
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#B8952E", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 24 }}>FACULTY ADVISORS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ADVISORS.map((prof, i) => (
          <a key={i} href={prof.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px", background: "rgba(153,0,0,0.04)", border: "1px solid rgba(153,0,0,0.1)", borderRadius: 10, textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <Avatar person={{ name: prof.name.replace("Prof. ", "") }} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif" }}>{prof.name}</div>
              <div style={{ fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>USC Faculty · View LinkedIn profile ↗</div>
            </div>
          </a>
        ))}
      </div>
    </div>

    <div>
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#B8952E", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 24 }}>STUDENT BUILDERS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {STUDENT_BUILDERS.map((person, i) => (
          <a
            key={i}
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "32px 24px", background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10, textAlign: "center", transition: "border-color 0.2s", textDecoration: "none", display: "block" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)")}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Avatar person={person} size={64} />
            </div>
            <div style={{ fontSize: 15, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 6 }}>{person.name}</div>
            <div style={{ fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif" }}>BUAI Student Builder · LinkedIn ↗</div>
          </a>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);

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
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#F7F7F5", color: "#1C1C1F", fontFamily: "'Inter', sans-serif", overflow: "auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(153,0,0,0.2); color: #1C1C1F; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F7F7F5; }
        ::-webkit-scrollbar-thumb { background: rgba(153,0,0,0.3); border-radius: 3px; }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(255,255,255,0.92)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent", transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s" }}>
        <div onClick={() => setActiveTab("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg, #990000, #600000)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>B</div>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1F", letterSpacing: 1.5 }}>BBH</span>
        </div>
        <div style={{ display: "flex", gap: 4 }} className="desktop-nav">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "8px 16px", background: activeTab === tab.id ? "rgba(153,0,0,0.1)" : "transparent", border: "none", borderRadius: 6, color: activeTab === tab.id ? "#990000" : "#52525B", fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: "pointer", transition: "all 0.2s" }}>
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "14px 32px", background: activeTab === tab.id ? "rgba(153,0,0,0.1)" : "transparent", border: "none", borderRadius: 8, color: activeTab === tab.id ? "#990000" : "#52525B", fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1, cursor: "pointer", width: 240 }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "home" && <HomePage setActiveTab={setActiveTab} />}
      {activeTab === "projects" && <ProjectsPage />}
      {activeTab === "team" && <TeamPage />}
      {activeTab === "buai" && <BuaiPage />}
      {activeTab === "contact" && <ContactPage />}

      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "40px 24px", textAlign: "center" }}>
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
