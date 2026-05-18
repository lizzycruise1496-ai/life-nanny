import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  { id: "learning", label: "Learning", icon: "📚", color: "#F59E0B", nag: ["Haven't checked your learning goals today!", "Knowledge doesn't grow itself — any progress?", "Psst... your books miss you."] },
  { id: "health", label: "Health", icon: "💪", color: "#10B981", nag: ["Did you move your body today?", "Water? Sleep? Exercise? Any of these?", "Your body called. It wants attention."] },
  { id: "jobs", label: "Job Switch", icon: "🚀", color: "#6366F1", nag: ["Any applications sent today?", "Dream job won't find you on the couch!", "LinkedIn profile updated lately?"] },
  { id: "resume", label: "Resume", icon: "📄", color: "#EC4899", nag: ["When did you last update your resume?", "New skills to add? Achievements to highlight?", "Your resume is dusty. Let's fix that."] },
  { id: "friends", label: "Friends", icon: "👯", color: "#F97316", nag: ["Great, socializing! But... study time?", "Fun with friends — did you hit your goals first?", "Friends are important. So is that job switch!"] },
];

const NANNY_REACTIONS = {
  learning: { friends: "Aren't you forgetting to study?", health: "Body AND mind need work!", jobs: "Learn something new for that job switch!", resume: "Update your skills on that resume too!" },
  health: { friends: "Exercise done before hanging out? Good!", jobs: "A healthy you = a better candidate!", learning: "Brain needs a healthy body!", resume: "Add that fitness discipline to your soft skills!" },
  jobs: { friends: "Any applications sent before socializing?", health: "Job hunting is stressful — take care of yourself!", learning: "Learning something for that new role?", resume: "Resume polished for those job apps?" },
  resume: { friends: "Resume updated? Now go enjoy friends!", health: "Self-care and career care — balance!", jobs: "Resume ready? Now apply!", learning: "Add those new skills to your resume!" },
  friends: { learning: "Oh! Aren't you forgetting to study?", health: "Did you work out today? Be honest.", jobs: "Made any progress on the job switch?", resume: "When did you last update your resume?" },
};

const TASKS = {
  learning: ["Read for 30 minutes", "Watch an educational video", "Practice a new skill", "Review notes"],
  health: ["30 min workout", "Drink 8 glasses of water", "Get 7-8 hours sleep", "Take a walk outside"],
  jobs: ["Apply to 2 positions", "Research target companies", "Update LinkedIn", "Reach out to a contact"],
  resume: ["Add recent achievement", "Update skills section", "Tailor for a job posting", "Get a friend to review"],
  friends: ["Check in with a friend", "Plan a hangout", "Reply to messages", "Schedule a call"],
};

function NannyBubble({ message, visible }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 1000,
      transform: visible ? "translateY(0) scale(1)" : "translateY(-80px) scale(0.8)",
      opacity: visible ? 1 : 0,
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      maxWidth: 280,
    }}>
      <div style={{
        background: "#1a1a2e", border: "2px solid #e2c27d",
        borderRadius: 16, padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(226,194,125,0.3)", position: "relative",
      }}>
        <div style={{ fontSize: 11, color: "#e2c27d", fontFamily: "serif", fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>NANNY SAYS</div>
        <div style={{ color: "#f0e6c8", fontSize: 14, fontFamily: "Georgia, serif", lineHeight: 1.5 }}>{message}</div>
        <div style={{ position: "absolute", bottom: -10, right: 24, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "10px solid #e2c27d" }} />
      </div>
    </div>
  );
}

function TaskItem({ task, done, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      background: done ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
      borderRadius: 10, cursor: "pointer",
      border: `1px solid ${done ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)"}`,
      transition: "all 0.2s", marginBottom: 8,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        border: `2px solid ${done ? "#10B981" : "rgba(255,255,255,0.3)"}`,
        background: done ? "#10B981" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.2s",
      }}>
        {done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{
        color: done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
        fontSize: 14, fontFamily: "Georgia, serif",
        textDecoration: done ? "line-through" : "none", transition: "all 0.2s",
      }}>{task}</span>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      {!isUser && <div style={{ fontSize: 20, marginRight: 8, alignSelf: "flex-end" }}>🤖</div>}
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "#6366F1" : "rgba(255,255,255,0.1)",
        color: "#f0e6c8", fontSize: 14, fontFamily: "Georgia, serif", lineHeight: 1.6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>{msg.content}</div>
    </div>
  );
}

export default function MyLifeApp() {
  const [activeSection, setActiveSection] = useState("friends");
  const [prevSection, setPrevSection] = useState(null);
  const [nannyMsg, setNannyMsg] = useState("");
  const [nannyVisible, setNannyVisible] = useState(false);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("nanny-tasks");
    if (saved) return JSON.parse(saved);
    const init = {};
    SECTIONS.forEach(s => { init[s.id] = TASKS[s.id].map(t => ({ text: t, done: false })); });
    return init;
  });
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hey! I'm your Life Nanny 👋 I'll keep you on track across all your goals. What's on your mind today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef(null);
  const nannyTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem("nanny-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const showNanny = (msg) => {
    setNannyMsg(msg);
    setNannyVisible(true);
    if (nannyTimer.current) clearTimeout(nannyTimer.current);
    nannyTimer.current = setTimeout(() => setNannyVisible(false), 5000);
  };

  const switchSection = (id) => {
    if (id === activeSection) return;
    setPrevSection(activeSection);
    setActiveSection(id);
    const reactions = NANNY_REACTIONS[id];
    if (reactions && activeSection && reactions[activeSection]) {
      setTimeout(() => showNanny(reactions[activeSection]), 400);
    } else {
      const section = SECTIONS.find(s => s.id === id);
      const nags = section?.nag || [];
      if (nags.length) setTimeout(() => showNanny(nags[Math.floor(Math.random() * nags.length)]), 400);
    }
  };

  const toggleTask = (sectionId, idx) => {
    setTasks(prev => {
      const updated = [...prev[sectionId]];
      updated[idx] = { ...updated[idx], done: !updated[idx].done };
      return { ...prev, [sectionId]: updated };
    });
  };

  const getProgress = (sectionId) => {
    const t = tasks[sectionId];
    return Math.round((t.filter(x => x.done).length / t.length) * 100);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    const progressSummary = SECTIONS.map(s => `${s.label}: ${getProgress(s.id)}%`).join(", ");
    const currentSection = SECTIONS.find(s => s.id === activeSection);
    try {
      const history = [...chatMessages, { role: "user", content: userMsg }];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a warm, witty, slightly bossy Life Nanny. You help the user stay on track across 5 life areas: Learning, Health, Job Switch, Resume, and Friends. Current section: "${currentSection?.label}". Today's progress: ${progressSummary}. Keep responses to 2-4 sentences. Be encouraging but honest. Use light humor and occasional emojis.`,
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.find(c => c.type === "text")?.text || "I'm here for you! Keep going 💪";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Hmm, lost my train of thought. Try again?" }]);
    }
    setChatLoading(false);
  };

  const current = SECTIONS.find(s => s.id === activeSection);
  const overallProgress = Math.round(SECTIONS.reduce((sum, s) => sum + getProgress(s.id), 0) / SECTIONS.length);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%)", fontFamily: "Georgia, serif", color: "#f0e6c8", position: "relative" }}>
      <NannyBubble message={nannyMsg} visible={nannyVisible} />

      <div style={{ padding: "24px 24px 0", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#e2c27d", marginBottom: 4 }}>YOUR LIFE</div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#f0e6c8" }}>Life Nanny ✨</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>OVERALL</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: overallProgress > 60 ? "#10B981" : overallProgress > 30 ? "#F59E0B" : "#EC4899" }}>{overallProgress}%</div>
          </div>
        </div>
        <div style={{ marginTop: 16, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #6366F1, #EC4899)", width: `${overallProgress}%`, transition: "width 0.5s ease" }} />
        </div>
      </div>

      <div style={{ padding: "20px 16px 0", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {SECTIONS.map(s => {
          const prog = getProgress(s.id);
          const isActive = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => switchSection(s.id)} style={{
              flexShrink: 0, padding: "10px 16px", borderRadius: 12,
              border: `2px solid ${isActive ? s.color : "rgba(255,255,255,0.1)"}`,
              background: isActive ? `${s.color}22` : "rgba(255,255,255,0.04)",
              color: isActive ? s.color : "rgba(255,255,255,0.5)",
              cursor: "pointer", transition: "all 0.25s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 72,
            }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</span>
              <div style={{ width: "100%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${prog}%`, background: s.color, borderRadius: 2, transition: "width 0.4s" }} />
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "20px 20px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${current?.color}22`, border: `2px solid ${current?.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{current?.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{current?.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{getProgress(activeSection)}% complete today</div>
            </div>
          </div>
          <button onClick={() => showNanny(NANNY_REACTIONS[activeSection]?.[prevSection] || current?.nag[0])} style={{
            background: "rgba(226,194,125,0.15)", border: "1px solid rgba(226,194,125,0.3)",
            borderRadius: 10, color: "#e2c27d", padding: "8px 12px", cursor: "pointer", fontSize: 12,
          }}>🧓 Ask Nanny</button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>TODAY'S TASKS</div>
          {tasks[activeSection].map((task, idx) => (
            <TaskItem key={idx} task={task.text} done={task.done} onToggle={() => toggleTask(activeSection, idx)} />
          ))}
        </div>

        <div style={{ background: "rgba(226,194,125,0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(226,194,125,0.15)" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#e2c27d", marginBottom: 12 }}>🧓 NANNY'S EYE ON YOU</div>
          {SECTIONS.filter(s => s.id !== activeSection).map(s => {
            const prog = getProgress(s.id);
            return (
              <div key={s.id} onClick={() => switchSection(s.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${prog}%`, background: prog > 60 ? "#10B981" : prog > 30 ? "#F59E0B" : "#EC4899", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: prog < 30 ? "#EC4899" : "rgba(255,255,255,0.4)", minWidth: 28 }}>{prog}%</span>
                  {prog < 30 && <span style={{ fontSize: 10, color: "#EC4899" }}>⚠️</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => setShowChat(true)} style={{
        position: "fixed", bottom: 24, right: 20,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #6366F1, #EC4899)",
        border: "none", cursor: "pointer", fontSize: 22,
        boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}>💬</button>

      {showChat && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowChat(false); }}>
          <div style={{ width: "100%", maxHeight: "75vh", background: "#1a1a2e", borderRadius: "24px 24px 0 0", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>🧓 Chat with Nanny</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Your AI life coach</div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
              {chatLoading && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 20 }}>🤖</div>
                  <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.1)", borderRadius: "16px 16px 16px 4px", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>thinking...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Talk to your nanny..."
                style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", color: "#f0e6c8", fontSize: 14, outline: "none" }} />
              <button onClick={sendChat} style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", color: "#fff", fontSize: 16 }}>➤</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
