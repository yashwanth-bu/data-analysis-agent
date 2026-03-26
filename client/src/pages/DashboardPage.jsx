import { useState, useRef, useEffect, useCallback } from 'react'
import { visualize, fetchSuggestions } from '../utils/api.js'
import styles from './DashboardPage.module.css'

// ── Result item — flat, no card border ───────────────────
function ResultItem({ result }) {
  return (
    <div className={styles.resultItem}>
      {/* User bubble */}
      <div className={styles.userBubble}>
        <div className={styles.userAvatar}>U</div>
        <p className={styles.userText}>{result.prompt}</p>
      </div>

      {/* Agent response */}
      <div className={styles.agentBubble}>
        <div className={styles.agentAvatarWrap}>
          <div className={styles.agentAvatar}>◈</div>
          <span className={styles.agentName}>Data-Agent</span>
          <span className={styles.agentTime}>
            {new Date(result.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {result.error && (
          <div className={styles.errorBox}>⚠ {result.error}</div>
        )}

        {result.image_base64 && (
          <div className={styles.imageBlock}>
            <img
              src={`data:image/png;base64,${result.image_base64}`}
              alt="Visualization"
              className={styles.vizImage}
            />
          </div>
        )}

        {result.insight && (
          <p className={styles.insightText}>{result.insight}</p>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────
export default function DashboardPage({ datasetName, onReset }) {
  const [prompt, setPrompt]           = useState('')
  const [results, setResults]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [showBanner, setShowBanner]   = useState(true)
  const [dots, setDots]               = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [filtered, setFiltered]       = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIdx, setActiveIdx]     = useState(-1)
  const textareaRef = useRef()
  const bottomRef   = useRef()
  const dropdownRef = useRef()

  // Fetch suggestions once on mount
  useEffect(() => {
    fetchSuggestions().then(s => setSuggestions(s))
  }, [])

  // Filter suggestions as user types
  useEffect(() => {
    if (!prompt.trim()) {
      setFiltered([])
      setShowDropdown(false)
      return
    }
    const q = prompt.toLowerCase()
    const matches = suggestions.filter(s => s.toLowerCase().includes(q)).slice(0, 6)
    setFiltered(matches)
    setShowDropdown(matches.length > 0)
    setActiveIdx(-1)
  }, [prompt, suggestions])

  // Loading dots
  useEffect(() => {
    if (!loading) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [loading])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [results, loading])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [prompt])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSubmit(overridePrompt) {
    const q = (overridePrompt || prompt).trim()
    if (!q || loading) return
    setShowDropdown(false)
    setLoading(true)
    setShowBanner(false)
    setPrompt('')
    try {
      const data = await visualize(q)
      setResults(prev => [...prev, { ...data, prompt: q, id: Date.now() }])
    } catch (err) {
      setResults(prev => [...prev, { error: err.message, prompt: q, id: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  function selectSuggestion(s) {
    setPrompt(s)
    setShowDropdown(false)
    textareaRef.current?.focus()
  }

  function onKeyDown(e) {
    if (showDropdown && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, -1))
        return
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && activeIdx >= 0)) {
        e.preventDefault()
        selectSuggestion(filtered[activeIdx >= 0 ? activeIdx : 0])
        return
      }
      if (e.key === 'Escape') {
        setShowDropdown(false)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={styles.root}>

      {/* ── Topbar (no sidebar) ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.logoMark}>◈</div>
          <span className={styles.logoLabel}>Data-Agent</span>
          <span className={styles.topbarDivider}>|</span>
          <div className={styles.datasetPill} title={datasetName}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0}}>
              <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 5h10" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span>{datasetName}</span>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.onlinePill}>
            <span className={styles.onlineDot} />
            <span>Online</span>
          </div>
          <button className={styles.uploadBtn} onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v8M3 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New Dataset
          </button>
        </div>
      </header>

      {/* ── Main scroll area ── */}
      <main className={styles.main}>
        <div className={styles.feed}>

          {/* Success banner */}
          {showBanner && (
            <div className={styles.banner}>
              <div className={styles.bannerCheck}>✓</div>
              <div>
                <p className={styles.bannerTitle}>Dataset uploaded successfully</p>
                <p className={styles.bannerSub}><strong>{datasetName}</strong> is ready. Type a query below to start.</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results.map(r => <ResultItem key={r.id} result={r} />)}

          {/* Loading */}
          {loading && (
            <div className={styles.loadingBubble}>
              <div className={styles.agentAvatarWrap}>
                <div className={styles.agentAvatar}>◈</div>
                <span className={styles.agentName}>Data-Agent</span>
              </div>
              <div className={styles.thinkingRow}>
                <span className={styles.loadingSpinner} />
                <span className={styles.loadingText}>Thinking{dots}</span>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && results.length === 0 && !showBanner && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>◈</span>
              <p className={styles.emptyTitle}>Nothing here yet</p>
              <p className={styles.emptyText}>Ask a question about your data below.</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Prompt input ── */}
        <div className={styles.inputSection}>
          <div className={styles.inputOuter} ref={dropdownRef}>

            {/* Google-style suggestion dropdown */}
            {showDropdown && (
              <div className={styles.dropdown}>
                {filtered.map((s, i) => (
                  <button
                    key={i}
                    className={`${styles.dropdownItem} ${i === activeIdx ? styles.dropdownActive : ''}`}
                    onMouseDown={() => selectSuggestion(s)}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={styles.dropdownIcon}>
                      <circle cx="6" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className={`${styles.inputBox} ${loading ? styles.inputDisabled : ''}`}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="Ask anything about your data…"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => prompt.trim() && filtered.length > 0 && setShowDropdown(true)}
                disabled={loading}
                rows={1}
              />
              <button
                className={`${styles.sendBtn} ${!prompt.trim() || loading ? styles.sendDisabled : ''}`}
                onClick={() => handleSubmit()}
                disabled={!prompt.trim() || loading}
              >
                {loading
                  ? <span className={styles.miniSpinner} />
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                }
              </button>
            </div>
          </div>
          <p className={styles.hint}>
            <span className={styles.kbd}>Enter</span> to send ·
            <span className={styles.kbd}>↑↓</span> to navigate suggestions ·
            <span className={styles.kbd}>Tab</span> to select
          </p>
        </div>
      </main>
    </div>
  )
}
