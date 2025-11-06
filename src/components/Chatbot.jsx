import React, { useState, useEffect, useRef } from 'react';
import knowledge from '../data/chatbotKnowledge';
import '../styles/universal.css';

const matchAnswer = (text) => {
  const q = (text || '').toLowerCase();
  if (!q) return null;
  // Try exact keyword matching
  for (const item of knowledge) {
    for (const kw of item.keywords) {
      if (q.includes(kw)) return item.answer;
    }
  }
  // Fallback: check question words
  for (const item of knowledge) {
    const tokens = item.question.toLowerCase().split(/[\s,?]+/);
    for (const t of tokens) if (t && q.includes(t)) return item.answer;
  }
  return null;
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'sys-1', from: 'bot', text: 'Hi — I can answer common questions about this Social Impact platform. Try: "What is this project?" or click a suggested question.' }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(() => {
    try {
      const v = localStorage.getItem('chat_suggestions_visible');
      return v === null ? true : v === 'true';
    } catch (e) { return true; }
  });
  const [input, setInput] = useState('');
  const msgRef = useRef(null);

  useEffect(() => {
    if (open && msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages, open]);

  // Determine compact mode (used on login/auth pages where .container is present)
  useEffect(() => {
    try {
      const isAuthContainer = !!document.querySelector('.container');
      const path = window.location && window.location.pathname ? window.location.pathname.toLowerCase() : '';
      const looksLikeAuth = /auth|login|organization-register|role/.test(path);
      setCompactMode(isAuthContainer || looksLikeAuth);
    } catch (e) {
      setCompactMode(false);
    }
  }, []);

  // Toggle a class on the body so the rest of the page can adjust (push) when chat is open
  useEffect(() => {
    try {
      // Clean previous classes then add the appropriate one depending on compactMode
      document.body.classList.remove('chat-open', 'chat-compact-open');
      if (open && !compactMode) {
        document.body.classList.add('chat-open');
      }
      if (open && compactMode) {
        document.body.classList.add('chat-compact-open');
      }
    } catch (e) {
      // server-side rendering or restrictive environments may fail
    }
    return () => { try { document.body.classList.remove('chat-open', 'chat-compact-open'); } catch (e) {} };
  }, [open, compactMode]);

  const send = (text) => {
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Simulate thinking
    setTimeout(() => {
      const ans = matchAnswer(text) || "Sorry, I don't know the exact answer — try one of the suggested questions or check TEST_CREDENTIALS.md and PROJECT_IMPACT_ASSESSMENT.md for details.";
      const botMsg = { id: `b-${Date.now()}`, from: 'bot', text: ans };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  const quickQuestions = knowledge.slice(0,6).map(k => ({ id: k.id, q: k.question }));

  useEffect(() => {
    try { localStorage.setItem('chat_suggestions_visible', showSuggestions ? 'true' : 'false'); } catch (e) {}
  }, [showSuggestions]);

  return (
    <div>
      <div className={`chatbot ${open ? 'chatbot-open' : ''}`} aria-hidden={!open}>
        <div className="chatbot-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Help & Questions</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Project assistant</div>
          </div>
          <div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', padding: 6 }}>✕</button>
          </div>
        </div>

        <div className="chatbot-body" ref={msgRef}>
          {messages.map(m => (
            <div key={m.id} className={`chatbot-msg ${m.from === 'bot' ? 'bot' : 'user'}`}>
              <div className="chatbot-msg-text">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="chatbot-suggestions">
          <div className="chatbot-sugg-list">
            {showSuggestions ? quickQuestions.map(s => (
              <button key={s.id} className="chatbot-sugg" onClick={() => send(s.q)}>{s.q}</button>
            )) : (
              <button className="chatbot-sugg" onClick={() => setShowSuggestions(true)}>Show suggestions</button>
            )}
          </div>
          <div className="chatbot-sugg-control">
            <button className="chatbot-sugg-toggle" onClick={() => setShowSuggestions(s => !s)}>{showSuggestions ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        <div className="chatbot-input">
          <input
            aria-label="Ask the project assistant"
            placeholder="Ask about this project..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
          />
          <button className="btn" onClick={() => send(input)}>Send</button>
        </div>
      </div>

      <button className={`chatbot-toggle ${open ? 'hidden' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Toggle help chat">
        💬
      </button>
    </div>
  );
};

export default Chatbot;
