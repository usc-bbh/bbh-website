import { useState, useEffect, useRef } from "react";

// ─── NOTE ON THEME ───
// Colors: USC Cardinal (#990000) + muted Gold (#D4AF37), light background.
// Hero gear animation removed per Vishal's feedback — replaced with a
// simpler, cleaner layout (neural lines + particles kept, no spinning gears).

// ─── Neural network field — layered nodes, signals firing left to right,
// nodes near the cursor light up and fire. Faded behind the hero text. ───
const NeuralNetField = ({ thin = false }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width, height, dpr, nodes, layers, edges, outgoing, pulses, lastSpawn = 0;

    const rand = (a, b) => a + Math.random() * (b - a);

    const build = () => {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const L = Math.max(4, Math.min(thin ? 12 : 9, Math.round(width / (thin ? 130 : 170))));
      const padX = Math.max(28, width * 0.05);
      nodes = []; layers = []; edges = []; outgoing = []; pulses = [];
      for (let i = 0; i < L; i++) {
        const mid = 1 - Math.abs(i - (L - 1) / 2) / ((L - 1) / 2 || 1);
        const count = thin ? Math.round(rand(2, 3)) : Math.round(rand(4, 5) + mid * rand(1, 3));
        const x = padX + (i * (width - padX * 2)) / (L - 1);
        const top = height * 0.1, span = height * 0.86;
        const layer = [];
        for (let j = 0; j < count; j++) {
          const y = top + ((j + 0.5) * span) / count + rand(-10, 10);
          const n = { x, y, ox: x + rand(-14, 14), oy: y, act: 0, phase: rand(0, Math.PI * 2), layer: i };
          layer.push(nodes.length);
          nodes.push(n);
          outgoing.push([]);
        }
        layers.push(layer);
      }
      for (let i = 0; i < L - 1; i++) {
        layers[i].forEach((a) => {
          let made = 0;
          layers[i + 1].forEach((b) => {
            if (Math.random() < 0.45) { outgoing[a].push(edges.length); edges.push({ a, b, w: rand(0.25, 1) }); made++; }
          });
          if (!made) {
            const b = layers[i + 1][Math.floor(Math.random() * layers[i + 1].length)];
            outgoing[a].push(edges.length); edges.push({ a, b, w: rand(0.25, 1) });
          }
        });
      }
    };

    const fire = (nodeIdx, gold) => {
      const outs = outgoing[nodeIdx];
      if (!outs.length || pulses.length > 70) return;
      const k = 1 + (Math.random() < 0.35 ? 1 : 0);
      for (let i = 0; i < k; i++) {
        const e = outs[Math.floor(Math.random() * outs.length)];
        pulses.push({ e, t: 0, speed: rand(0.008, 0.016), gold: gold ?? Math.random() < 0.3 });
      }
    };

    const draw = (time) => {
      const { x: mx, y: my } = mouseRef.current;
      ctx.clearRect(0, 0, width, height);

      // node positions: gentle drift + cursor influence
      nodes.forEach((n) => {
        n.x = n.ox + (reduce ? 0 : Math.sin(time * 0.0005 + n.phase) * 4);
        n.y = n.oy + (reduce ? 0 : Math.cos(time * 0.0004 + n.phase) * 5);
        const d = Math.hypot(n.x - mx, n.y - my);
        if (d < 160) {
          n.act = Math.max(n.act, 1 - d / 160);
          if (!reduce && Math.random() < 0.02) fire(nodes.indexOf(n), true);
        }
      });

      // edges
      edges.forEach((e) => {
        const A = nodes[e.a], B = nodes[e.b];
        const lit = Math.max(A.act, B.act);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = `rgba(153,0,0,${0.05 + 0.07 * e.w + lit * 0.25})`;
        ctx.lineWidth = 1 + lit * 0.6;
        ctx.stroke();
      });

      // pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const e = edges[p.e];
        const A = nodes[e.a], B = nodes[e.b];
        p.t += p.speed;
        const t = Math.min(1, p.t);
        const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
        const tt = Math.max(0, t - 0.12);
        const tx = A.x + (B.x - A.x) * tt, ty = A.y + (B.y - A.y) * tt;
        const col = p.gold ? "212,175,55" : "153,0,0";
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, `rgba(${col},0)`);
        grad.addColorStop(1, `rgba(${col},0.75)`);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.95)`; ctx.fill();
        if (p.t >= 1) {
          pulses.splice(i, 1);
          B.act = Math.min(1, B.act + 0.8);
          if (Math.random() < 0.72) fire(e.b, p.gold);
        }
      }

      // nodes
      nodes.forEach((n) => {
        if (n.act > 0.02) {
          ctx.beginPath(); ctx.arc(n.x, n.y, 6 + n.act * 10, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(153,0,0,${n.act * 0.1})`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.4 + n.act * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = n.act > 0.15 ? `rgba(153,0,0,${0.35 + n.act * 0.6})` : "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = `rgba(153,0,0,${0.3 + n.act * 0.6})`;
        ctx.stroke();
        n.act *= 0.955;
      });

      // spawn input signals from the first layer
      if (!reduce && time - lastSpawn > 260) {
        lastSpawn = time;
        const first = layers[0];
        fire(first[Math.floor(Math.random() * first.length)]);
      }

      if (!reduce) rafRef.current = requestAnimationFrame(draw);
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    const handleResize = () => { build(); if (reduce) draw(0); };

    build();
    if (reduce) draw(0); else rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [thin]);

  const fade = "radial-gradient(ellipse 46% 42% at 50% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 55%, #000 100%)";
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", WebkitMaskImage: fade, maskImage: fade }} />;
};

// ─── Shared data ───
const ADVISORS = [
  { name: "Prof. Adel Javanmard", url: "https://faculty.marshall.usc.edu/Adel-Javanmard/", photo: "team/adel-javanmard.jpg" },
  { name: "Prof. Vishal Gupta", url: "https://faculty.marshall.usc.edu/Vishal-Gupta/", photo: "team/vishal-gupta.jpg" },
];

// Abhi removed from public team listing per request.
// Photos live in public/team/. Anyone without one falls back to an initials avatar. Add a `photo` field
// (path under public/team/) per person once headshots are available.
const P = {
  agastya: { name: "Agastya Bassi", linkedin: "https://www.linkedin.com/in/agastya-bassi/", photo: "team/agastya-bassi.jpg" },
  tanzil: { name: "Tanzil Hussain", linkedin: "https://www.linkedin.com/in/tanzilhussain/", photo: "team/tanzil-hussain.jpg" },
  francis: { name: "Francis Ruan", linkedin: "https://www.linkedin.com/in/francisruan/", photo: "team/francis-ruan.jpg" },
  natalie: { name: "Natalie Lam Johnson", linkedin: "https://www.linkedin.com/in/natalie-lam-johnson/", photo: "team/natalie-lam-johnson.jpg" },
};

const TOOL_BUILDERS = [
  { name: "Agastya Bassi", linkedin: "https://www.linkedin.com/in/agastya-bassi/", photo: "team/agastya-bassi.jpg" },
  { name: "Tanzil Hussain", linkedin: "https://www.linkedin.com/in/tanzilhussain/", photo: "team/tanzil-hussain.jpg" },
  { name: "Francis Ruan", linkedin: "https://www.linkedin.com/in/francisruan/", photo: "team/francis-ruan.jpg" },
  { name: "Natalie Lam Johnson", linkedin: "https://www.linkedin.com/in/natalie-lam-johnson/", photo: "team/natalie-lam-johnson.jpg" },
];

// Everyone shown on the Team page. Tool cards on the Projects page use TOOL_BUILDERS.
const STUDENT_BUILDERS = [
  ...TOOL_BUILDERS,
  { name: "Avi Chopra", linkedin: "https://www.linkedin.com/in/avichopra/", photo: "team/avi-chopra.jpg" },
];

const TOOLS = [
  {
    id: "pathwise",
    name: "Pathwise",
    nameIsPlaceholder: false,
    tagline: "Chart your path. Stay on track.",
    summary: "4-year degree planner and requirement checker.",
    image: null,
    problem:
      "Planning four years of courses across majors, minors, and emphases means cross-checking requirements by hand, and a missed prerequisite or overloaded semester can push back graduation.",
    solution:
      "Enter your programs and your plan for the remaining semesters. Pathwise checks the whole path against your actual degree requirements and flags missing courses, unit overloads, and gaps.",
    status: "in_progress",
    link: null,
    repos: [{ label: "Repo", url: "https://github.com/usc-bbh/bbh-course-reg-project" }],
    leads: [P.tanzil],
    contributors: [P.agastya, P.natalie],
    team: TOOL_BUILDERS,
  },
  {
    id: "regcheck",
    name: "RegCheck",
    nameIsPlaceholder: false,
    tagline: "Check your schedule. Cleared for launch.",
    summary: "Validate your next-semester schedule before you register.",
    image: "projects/regcheck.webp",
    imageAlt: "RegCheck showing ACCT 370 sections on a weekly calendar with a Validate schedule button",
    problem:
      "You don't find out your schedule is broken until WebReg rejects it mid-registration, whether it's a time conflict, a full section, a missing D-clearance, or a lab you forgot to add. By then your spot is gone.",
    solution:
      "Upload your STARS report and the sections you're planning to take. RegCheck catches everything that would make registration fail, before you try.",
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
    id: "eclipse",
    name: "Eclipse",
    nameIsPlaceholder: false,
    tagline: "Hide your name. Let your STARS shine.",
    summary: "Anonymize your STARS report and share it to help us build better tools.",
    image: "projects/eclipse.webp",
    imagePosition: "center 62%",
    imageAlt: "Eclipse's How it works page showing which fields are removed and which are kept",
    problem:
      "To build tools that work on real student records, we need real STARS reports, but those are full of private information.",
    solution:
      "Upload your report and the app strips your name, ID, address, grades, and GPA right in your browser. Nothing is sent anywhere until you choose to share the anonymized version, and each one helps us test the other BBH tools.",
    status: "live",
    link: "https://huggingface.co/spaces/buai-builder-hub/STARSRedacter",
    repos: [{ label: "Source", url: "https://huggingface.co/spaces/buai-builder-hub/STARSRedacter/tree/main" }],
    leads: [P.natalie, P.francis],
    contributors: [P.agastya, P.tanzil],
    team: TOOL_BUILDERS,
  },
  {
    id: "constellation",
    name: "Constellation",
    nameIsPlaceholder: false,
    tagline: "Make sense of your STARS.",
    summary: "Turns your STARS report into a clear, readable summary.",
    image: null,
    problem:
      "A STARS report is dense and hard to read. What you've finished, what's still open, and what counts toward which requirement are buried in pages of codes and abbreviations.",
    solution:
      "Upload your report and Constellation turns it into a plain summary of what's done, what's in progress, and what you still need.",
    status: "in_progress",
    link: null,
    repos: [],
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
    <section style={{ minHeight: "74vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "72px 24px 40px", overflow: "hidden" }}>
      <NeuralNetField />
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

    <section style={{ padding: "24px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
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
        {tool.status === "live" ? "LIVE" : "UNDER DEVELOPMENT"}
      </span>
    </div>
    <p style={{ fontSize: 13, color: "#B8952E", fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginBottom: tool.summary ? 5 : 14 }}>{tool.tagline}</p>
    {tool.summary && (
      <p style={{ fontSize: 13.5, color: "#52525B", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginTop: 0, marginBottom: 14 }}>{tool.summary}</p>
    )}
    <div style={{ aspectRatio: "16 / 10", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 12px 28px -18px rgba(28,28,31,0.45)", marginBottom: 22, background: "rgba(0,0,0,0.035)" }}>
      {tool.image ? (
        <img src={tool.image} alt={tool.imageAlt || tool.name} loading="lazy" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: tool.imagePosition || "top center", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, letterSpacing: 1.5, color: "#8A8A93", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>SCREENSHOT TO COME</div>
      )}
    </div>
    {[["THE PROBLEM", tool.problem], ["OUR SOLUTION", tool.solution]].map(([label, text]) => (
      <div key={label} style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 2, color: "#990000", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 6 }}>{label}</div>
        <p style={{ fontSize: 14.5, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", margin: 0 }}>{text}</p>
      </div>
    ))}
    <div style={{ height: 6 }} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 28 }}>
    {tool.link ? (
      <a href={tool.link} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#990000", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
        TRY IT ↗
      </a>
    ) : (
      <div style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "rgba(0,0,0,0.05)", color: "#5B5B63", borderRadius: 7, fontSize: 12.5, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
        UNDER DEVELOPMENT
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
  <div style={{ paddingBottom: 100 }}>
    <section style={{ position: "relative", overflow: "hidden", height: "clamp(130px, 15vw, 170px)", marginTop: 64, marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <NeuralNetField thin />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.15, margin: "0 0 8px" }}>Our Projects</h2>
        <p style={{ fontSize: 14, color: "#5B5B63", fontFamily: "'Inter', sans-serif", margin: 0 }}>Swipe, use the arrows, or click a card to browse.</p>
      </div>
    </section>
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
            <Avatar person={{ name: prof.name.replace("Prof. ", ""), photo: prof.photo }} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1F", fontFamily: "'Space Grotesk', sans-serif" }}>{prof.name}</div>
              <div style={{ fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>USC Faculty · View faculty page ↗</div>
            </div>
          </a>
        ))}
      </div>
    </div>

    <div>
      <div style={{ fontSize: 12, letterSpacing: 3, color: "#B8952E", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 24 }}>BUAI STUDENT BUILDERS</div>
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
            <div style={{ fontSize: 12, color: "#5B5B63", fontFamily: "'Inter', sans-serif" }}>LinkedIn ↗</div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

// Interest form for future BBH teams; leave empty to show "Applications open soon" instead.
const JOIN_FORM_URL = "https://forms.gle/VydyRB2Qtnr1eZB79";

const ContactPage = () => {
  const btn = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 };
  const sideCard = (accent) => ({ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: "30px 30px 30px 28px", display: "flex", flexDirection: "column", boxShadow: "0 14px 32px -24px rgba(28,28,31,0.35)" });
  const outline = (e, on, color) => { e.currentTarget.style.borderColor = on ? color : "rgba(0,0,0,0.15)"; e.currentTarget.style.color = on ? color : "#1C1C1F"; };

  return (
    <div>
      {/* Header band with a slice of the homepage network */}
      <section style={{ position: "relative", overflow: "hidden", height: "clamp(180px, 24vw, 260px)", marginTop: 64, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", borderBottom: "1px solid rgba(153,0,0,0.08)" }}>
        <NeuralNetField />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", lineHeight: 1.1, margin: "0 0 10px" }}>
            Get <span style={{ color: "#990000" }}>Involved</span>
          </h2>
          <p style={{ fontSize: 15, color: "#52525B", fontFamily: "'Inter', sans-serif", margin: 0 }}>Join a team, ship code, or tell us what to fix.</p>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 100px" }}>
        {/* Join: the main call to action */}
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #A30000 0%, #7A0000 100%)", borderRadius: 16, padding: "clamp(28px, 5vw, 44px)", marginBottom: 20, boxShadow: "0 24px 48px -28px rgba(153,0,0,0.7)" }}>
          <div aria-hidden="true" style={{ position: "absolute", right: -80, top: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0) 70%)" }} />
          <div style={{ position: "relative" }}>
            <h3 style={{ fontSize: "clamp(22px, 3.2vw, 30px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2, margin: "0 0 10px" }}>Interested in joining a future BBH team?</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", margin: "0 0 24px", maxWidth: 520 }}>
              Tell us a bit about yourself and we'll reach out when the next team forms.
            </p>
            {JOIN_FORM_URL ? (
              <a href={JOIN_FORM_URL} target="_blank" rel="noopener noreferrer" style={{ ...btn, padding: "13px 28px", background: "#FFFFFF", color: "#990000", letterSpacing: 1 }}>
                SUBMIT YOUR INTEREST ↗
              </a>
            ) : (
              <div style={{ ...btn, padding: "13px 28px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", letterSpacing: 1 }}>
                APPLICATIONS OPEN SOON
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div style={sideCard("#990000")}>
            <h3 style={{ fontSize: 19, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: "0 0 10px" }}>Contribute on GitHub</h3>
            <p style={{ fontSize: 14.5, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", margin: "0 0 22px" }}>
              BBH believes strongly in student empowerment. All of our repos are public, so feel free to
              add functionality and open a pull request. Each tool's repo is linked on the{" "}
              <span style={{ color: "#990000", fontWeight: 600 }}>Projects</span> page.
            </p>
            <a href="https://github.com/usc-bbh" target="_blank" rel="noopener noreferrer" style={{ ...btn, marginTop: "auto", alignSelf: "flex-start", border: "1px solid rgba(0,0,0,0.15)", background: "#fff", color: "#1C1C1F" }}
              onMouseEnter={(e) => outline(e, true, "#990000")} onMouseLeave={(e) => outline(e, false)}>
              github.com/usc-bbh ↗
            </a>
          </div>

          <div style={sideCard("#D4AF37")}>
            <h3 style={{ fontSize: 19, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#1C1C1F", margin: "0 0 10px" }}>Got feedback on one of our tools?</h3>
            <p style={{ fontSize: 14.5, color: "#52525B", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", margin: "0 0 22px" }}>
              Feel free to raise an issue on GitHub. Bug reports, confusing results, and feature ideas all help.
            </p>
            <a href="https://github.com/usc-bbh/bbh-course-reg-project/issues/new" target="_blank" rel="noopener noreferrer" style={{ ...btn, marginTop: "auto", alignSelf: "flex-start", border: "1px solid rgba(0,0,0,0.15)", background: "#fff", color: "#1C1C1F" }}
              onMouseEnter={(e) => outline(e, true, "#B8952E")} onMouseLeave={(e) => outline(e, false)}>
              Open an issue ↗
            </a>
          </div>
        </div>
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
