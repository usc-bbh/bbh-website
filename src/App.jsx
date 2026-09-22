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
const P = {
  agastya: { name: "Agastya Bassi", linkedin: "https://www.linkedin.com/in/agastya-bassi/", photo: null },
  tanzil: { name: "Tanzil Hussain", linkedin: "https://www.linkedin.com/in/tanzilhussain/", photo: null },
  francis: { name: "Francis Ruan", linkedin: "https://www.linkedin.com/in/francisruan/", photo: null },
  natalie: { name: "Natalie Lam Johnson", linkedin: "https://www.linkedin.com/in/natalie-lam-johnson/", photo: null },
};

const TOOL_BUILDERS = [
  { name: "Agastya Bassi", linkedin: "https://www.linkedin.com/in/agastya-bassi/", photo: null },
  { name: "Tanzil Hussain", linkedin: "https://www.linkedin.com/in/tanzilhussain/", photo: null },
  { name: "Francis Ruan", linkedin: "https://www.linkedin.com/in/francisruan/", photo: null },
  { name: "Natalie Lam Johnson", linkedin: "https://www.linkedin.com/in/natalie-lam-johnson/", photo: null },
];

// Everyone shown on the Team page. Tool cards on the Projects page use TOOL_BUILDERS.
const STUDENT_BUILDERS = [
  ...TOOL_BUILDERS,
  { name: "Avi Chopra", linkedin: "https://www.linkedin.com/in/avichopra/", photo: null },
];

const TOOLS = [
  {
    id: "next-sem-validator",
    name: "Next Semester Validator",
    nameIsPlaceholder: true,
    tagline: "Check your planned schedule before you register",
    description:
      "Upload your STARS report and pick the sections you're planning to register for next semester. The validator checks for time conflicts, full sections, D-clearance requirements, and missing lab or discussion sections — catching the things that would make a WebReg registration attempt fail, before you try it.",
    status: "in_progress",
    link: null,
    repos: [
      { label: "App repo", url: "https://github.com/usc-bbh/next-sem-validator" },
      { label: "Validator repo", url: "https://github.com/usc-bbh/bbh-course-reg-project/tree/main/validator" },
    ],
    leads: [P.agastya, P.tanzil],
    contributors: [P.natalie],
    team: TOOL_BUILDERS,
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
    repos: [{ label: "Repo", url: "https://github.com/usc-bbh/bbh-course-reg-project" }],
    leads: [P.tanzil],
    contributors: [P.agastya, P.natalie],
    team: TOOL_BUILDERS,
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
    repos: [{ label: "Source", url: "https://huggingface.co/spaces/buai-builder-hub/STARSRedacter/tree/main" }],
    leads: [P.natalie, P.francis],
    contributors: [P.agastya, P.tanzil],
    team: TOOL_BUILDERS,
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
      <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 28px" }}>
        What is the BBH?
      </h2>
      <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", maxWidth: 680 }}>
        The BUAI Builder Hub (BBH) builds AI tools that improve the USC community. Our projects
        complement classroom learning with hands-on experience, helping students build a
        professional portfolio of AI tools. BBH draws its students from two undergraduate AI
        communities at USC Marshall,{" "}
        <a href="https://www.marshall.usc.edu/programs/undergraduate-programs/undergraduate-degrees/bs-artificial-intelligence-for-business-buai" target="_blank" rel="noopener noreferrer" style={{ color: "#990000", fontWeight: 600, textDecoration: "none" }}>
          BUAI
        </a>{" "}
        (the AI for Business degree) and{" "}
        <a href="https://www.uscmaia.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#990000", fontWeight: 600, textDecoration: "none" }}>
          MAIA
        </a>{" "}
        (the Marshall Artificial Intelligence Association), with faculty mentors from the{" "}
        <a href="https://www.marshall.usc.edu/departments/data-sciences-and-operations" target="_blank" rel="noopener noreferrer" style={{ color: "#990000", fontWeight: 600, textDecoration: "none" }}>
          Data Sciences and Operations (DSO)
        </a>{" "}
        department.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 48 }}>
        {[
          { title: "Collaborate", desc: "Work with stakeholders to identify challenges in the USC community" },
          { title: "Design & Build", desc: "Go beyond coding to design tools that respect real-world constraints: privacy, fairness, and user experience" },
          { title: "Ship", desc: "Deploy portfolio-ready projects with real-world impact" },
        ].map((item, i) => (
          <div key={i} style={{ background: "rgba(153,0,0,0.04)", border: "1px solid rgba(153,0,0,0.12)", borderRadius: 10, padding: "28px 24px", transition: "border-color 0.3s, background 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.35)"; e.currentTarget.style.background = "rgba(153,0,0,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(153,0,0,0.12)"; e.currentTarget.style.background = "rgba(153,0,0,0.04)"; }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#5B5B63", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </section>


    <section style={{ padding: "60px 24px 100px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
      <blockquote style={{ fontSize: "clamp(18px, 3vw, 26px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400, color: "#3F3F46", lineHeight: 1.6, margin: 0, padding: "0 20px" }}>
        "In Artificial Intelligence for Business (BUAI),{" "}
        <span style={{ color: "#990000", fontWeight: 600 }}>students are actively using their skills</span>{" "}
        to improve the world around them."
      </blockquote>
      <div style={{ marginTop: 24, fontSize: 14, color: "#52525B", fontFamily: "'Inter', sans-serif" }}>
        <span style={{ fontWeight: 600, color: "#1C1C1F" }}>Professor Charlie Hannigan</span>
        <br />
        Academic Director, AI for Business (BUAI)
      </div>
    </section>
  </div>
);

const ToolCard = ({ tool }) => (
  <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "clamp(26px, 4vw, 40px)", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: "0 18px 40px -24px rgba(28,28,31,0.25)" }}>
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 28 }}>
    {tool.link ? (
      <a href={tool.link} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#990000", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
        TRY IT ↗
      </a>
    ) : (
      <div style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "rgba(0,0,0,0.05)", color: "#5B5B63", borderRadius: 7, fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
        UNDER CONSTRUCTION
      </div>
    )}
    {(tool.repos || []).map((r) => (
      <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1px solid rgba(0,0,0,0.15)", color: "#1C1C1F", borderRadius: 7, textDecoration: "none", fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.3, background: "#fff" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#990000"; e.currentTarget.style.color = "#990000"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; e.currentTarget.style.color = "#1C1C1F"; }}>
        {r.label} ↗
      </a>
    ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
      <div>
        <div style={{ fontSize: 10.5, letterSpacing: 2, color: "#5B5B63", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10 }}>ADVISORS</div>
        {ADVISORS.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: 4 }}>{a.name}</a>
        ))}
      </div>
      <div>
        {(tool.leads
          ? [[tool.leads.length > 1 ? "LEAD DEVELOPERS" : "LEAD DEVELOPER", tool.leads], [(tool.contributors || []).length > 1 ? "CONTRIBUTING DEVELOPERS" : "CONTRIBUTING DEVELOPER", tool.contributors || []]]
          : [["TEAM", tool.team]]
        ).filter(([, people]) => people.length).map(([label, people], g) => (
          <div key={g} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, letterSpacing: 2, color: "#5B5B63", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10 }}>{label}</div>
            {people.map((person, i) => (
              person.linkedin ? (
                <a key={i} href={person.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", textDecoration: "none", marginBottom: 4 }}>{person.name}</a>
              ) : (
                <div key={i} style={{ fontSize: 13, color: "#3F3F46", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{person.name}</div>
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Project carousel: centered cards, equal gaps, arrows, dots, keys ───
const CARD_W = "min(580px, 84vw)";
const ProjectCarousel = ({ items }) => {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const rafRef = useRef(null);
  const [active, setActive] = useState(0);

  const goTo = (i) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    const track = trackRef.current;
    const el = cardRefs.current[n];
    if (!track || !el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  };

  const onScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      setActive(best);
    });
  };

  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

  const arrow = (dir) => {
    const disabled = dir < 0 ? active === 0 : active === items.length - 1;
    return (
      <button
        onClick={() => goTo(active + dir)}
        disabled={disabled}
        aria-label={dir < 0 ? "Previous project" : "Next project"}
        style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.14)", background: "#fff", color: "#1C1C1F", fontSize: 18, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, transition: "border-color 0.2s, color 0.2s, opacity 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = "#990000"; e.currentTarget.style.color = "#990000"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.14)"; e.currentTarget.style.color = "#1C1C1F"; }}
      >
        {dir < 0 ? "←" : "→"}
      </button>
    );
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="BBH projects"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
      }}
      style={{ outline: "none" }}
    >
      <style>{`.bbh-track::-webkit-scrollbar{display:none}`}</style>
      <div
        ref={trackRef}
        className="bbh-track"
        onScroll={onScroll}
        style={{ display: "flex", alignItems: "stretch", gap: 28, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)", maskImage: "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)", padding: `12px calc(50% - ${CARD_W} / 2) 28px` }}
      >
        {items.map((tool, i) => (
          <div
            key={tool.id}
            ref={(el) => (cardRefs.current[i] = el)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}: ${tool.name}`}
            onClick={() => { if (i !== active) goTo(i); }}
            style={{ flex: `0 0 ${CARD_W}`, scrollSnapAlign: "center", transition: "transform 0.4s cubic-bezier(.2,.8,.2,1), opacity 0.4s", transform: i === active ? "scale(1)" : "scale(0.95)", opacity: i === active ? 1 : 0.45, cursor: i === active ? "default" : "pointer" }}
          >
            <ToolCard tool={tool} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 8 }}>
        {arrow(-1)}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {items.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${t.name}`}
              aria-current={i === active}
              style={{ width: i === active ? 26 : 8, height: 8, borderRadius: 999, border: "none", padding: 0, background: i === active ? "#990000" : "rgba(0,0,0,0.18)", cursor: "pointer", transition: "width 0.3s, background 0.3s" }}
            />
          ))}
        </div>
        {arrow(1)}
      </div>
    </div>
  );
};

const ProjectsPage = () => (
  <div style={{ padding: "120px 0 100px" }}>
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
      <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 12px" }}>Our Projects</h2>
      <p style={{ fontSize: 14, color: "#5B5B63", fontFamily: "'Inter', sans-serif", margin: "0 0 32px" }}>Swipe, use the arrows, or click a card to browse.</p>
    </div>
    <div style={{ maxWidth: 1240, margin: "0 auto" }}>
      <ProjectCarousel items={TOOLS} />
    </div>
  </div>
);

const TeamPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 16px" }}>The People Behind BBH</h2>
    <p style={{ fontSize: 16, color: "#52525B", lineHeight: 1.8, fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>
      Faculty and students collaborating at the intersection of AI, business, and education. See the{" "}
      <span style={{ color: "#990000" }}>Projects</span> page for the lead developers on each tool.
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

// Paste the Google Form link here; the "join a team" card stays hidden while this is empty.
const JOIN_FORM_URL = "";

const ContactPage = () => (
  <div style={{ padding: "120px 24px 100px", maxWidth: 700, margin: "0 auto" }}>
    <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 32px" }}>Get Involved</h2>
    {JOIN_FORM_URL && (
      <div style={{ background: "linear-gradient(135deg, rgba(153,0,0,0.06) 0%, rgba(212,175,55,0.06) 100%)", border: "1px solid rgba(153,0,0,0.18)", borderRadius: 14, padding: "36px", marginBottom: 24 }}>
        <h2 style={{ fontSize: "clamp(22px, 3.2vw, 30px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.2, margin: "0 0 10px" }}>Interested in joining a future BBH team?</h2>
        <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", marginBottom: 22 }}>
          Tell us a bit about yourself and we'll reach out when the next team forms.
        </p>
        <a href={JOIN_FORM_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", background: "#990000", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1 }}>
          APPLY TO JOIN ↗
        </a>
      </div>
    )}

    <div style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "36px", marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: "0 0 10px" }}>Contribute on GitHub</h3>
      <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
        BBH believes strongly in student empowerment. All of our repos are public, so feel free to
        add functionality and open a pull request. Each tool's repo is linked on the{" "}
        <span style={{ color: "#990000", fontWeight: 600 }}>Projects</span> page.
      </p>
      <a href="https://github.com/usc-bbh" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", border: "1px solid rgba(0,0,0,0.15)", background: "#fff", color: "#1C1C1F", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
        github.com/usc-bbh ↗
      </a>
    </div>

    <div style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "36px" }}>
      <h3 style={{ fontSize: 20, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: "0 0 10px" }}>Got feedback on one of our tools?</h3>
      <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
        Feel free to raise an issue on GitHub. Bug reports, confusing results, and feature ideas all help.
      </p>
      <a href="https://github.com/usc-bbh/bbh-course-reg-project/issues/new" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", border: "1px solid rgba(0,0,0,0.15)", background: "#fff", color: "#1C1C1F", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
        Open an issue ↗
      </a>
    </div>
  </div>
);

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
    { id: "contact", label: "Get Involved" },
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
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#1C1C1F", letterSpacing: 1.5 }}>BBH</span>
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
      {activeTab === "contact" && <ContactPage />}

      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#71717A", fontFamily: "'Inter', sans-serif", lineHeight: 1.8 }}>
          BUAI Builder Hub · Tools by Students, for Students
          <br />
          USC Marshall School of Business × Viterbi School of Engineering
          <br />
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
