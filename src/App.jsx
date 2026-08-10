import React, { useEffect, useMemo, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { io } from 'socket.io-client'

const DEFAULT_ROOM_ID = 'LUMEN-7F4K'
const emptyCode = { HTML: '', CSS: '', JavaScript: '' }

function createRoomId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()
  }

  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

const initialCode = {
  HTML: `<main class="hero">
  <div class="orb orb-one"></div>
  <div class="orb orb-two"></div>
  <p class="eyebrow">CREATIVE CODE, TOGETHER</p>
  <h1>Build something <span>brilliant.</span></h1>
  <p class="copy">A little collaborative space for the ideas that need to ship.</p>
  <button>Start creating <b>→</b></button>
</main>`,
  CSS: `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0b1020; color: #f8fafc; }
.hero { min-height: 100vh; display: grid; place-content: center; text-align: center; overflow: hidden; position: relative; background: #101729; }
.hero > *:not(.orb) { position: relative; z-index: 1; }
.eyebrow { color: #8ca4ff; font-size: 11px; letter-spacing: .18em; font-weight: 800; }
h1 { font-size: clamp(44px, 7vw, 86px); line-height: .96; margin: 20px 0; max-width: 720px; }
h1 span { color: #8b5cf6; }
.copy { max-width: 420px; color: #aeb8cc; margin: 0 auto 28px; line-height: 1.6; }
button { border: 0; padding: 14px 20px; border-radius: 9px; color: white; background: #6d4aff; font-weight: 700; cursor: pointer; }
button b { margin-left: 16px; font-size: 18px; }
.orb { width: 340px; height: 340px; border-radius: 50%; filter: blur(50px); position: absolute; opacity: .35; }
.orb-one { background: #6d4aff; left: -120px; top: -130px; }
.orb-two { background: #0ea5e9; right: -100px; bottom: -150px; }`,
  JavaScript: `document.querySelector('button').addEventListener('click', () => {
  document.querySelector('button').textContent = 'Let\'s go!  ✨'
})`,
}

const languages = [
  { label: 'HTML', monaco: 'html', color: '#ef6c4f' },
  { label: 'CSS', monaco: 'css', color: '#3b82f6' },
  { label: 'JavaScript', monaco: 'javascript', color: '#eab308' },
]

const team = [
  { name: 'Zeel Bhakhar', initials: 'ZB', color: 'coral', active: true, you: true },
  { name: 'Dhanvi Rafaliya', initials: 'DR', color: 'violet', active: true },
  { name: 'Khushali Bavasiya', initials: 'KB', color: 'blue', active: true },
  { name: 'Khushi Suvagiya', initials: 'KS', color: 'amber', active: false },
]

function Icon({ children, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
}

function App() {
  const [roomId, setRoomId] = useState(DEFAULT_ROOM_ID)
  const [selectedLanguage, setSelectedLanguage] = useState('HTML')
  const [code, setCode] = useState(initialCode)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRunning, setRunning] = useState(false)
  const [isConnected, setConnected] = useState(false)
  const [previewVersion, setPreviewVersion] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const socketRef = useRef(null)
  const editorRef = useRef(null)
  const selectedLanguageRef = useRef(selectedLanguage)
  const pendingSelectionRef = useRef(null)
  const incomingChangeRef = useRef(null)

  const activeLanguage = languages.find((lang) => lang.label === selectedLanguage)
  const previewDocument = useMemo(() => [
    '<!doctype html><html><head><style>',
    code.CSS,
    '</style></head><body>',
    code.HTML,
    '<script>',
    code.JavaScript.replaceAll('</script>', '<\\/script>'),
    '</script>',
    `<script>document.addEventListener('click', (event) => {
      if (event.target.closest('button')) {
        window.parent.postMessage({ source: 'collab-code-preview', type: 'run-preview' }, '*')
      }
    })</script>`,
    '</body></html>',
  ].join(''), [code])

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage
  }, [selectedLanguage])

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'https://onrender.com', {
      transports: ['websocket'],
    })

    socketRef.current = socket
    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-room', roomId)
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('room-state', (remoteCode) => {
      if (remoteCode && typeof remoteCode === 'object') {
        setCode((current) => ({ ...current, ...remoteCode }))
      }
    })

    socket.on('code-change', ({ language, content }) => {
      if (!languages.some((item) => item.label === language) || typeof content !== 'string') return

      const editor = editorRef.current
      if (editor && language === selectedLanguageRef.current) {
        pendingSelectionRef.current = {
          language,
          selection: editor.getSelection(),
          scrollTop: editor.getScrollTop(),
          scrollLeft: editor.getScrollLeft(),
        }
      }
      incomingChangeRef.current = { language, content }
      setCode((current) => ({ ...current, [language]: content }))
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId])

  useEffect(() => {
    const pendingSelection = pendingSelectionRef.current
    if (!pendingSelection || pendingSelection.language !== selectedLanguage || !editorRef.current) return

    editorRef.current.setSelection(pendingSelection.selection)
    editorRef.current.setScrollTop(pendingSelection.scrollTop)
    editorRef.current.setScrollLeft(pendingSelection.scrollLeft)
    pendingSelectionRef.current = null
  }, [code, selectedLanguage])

  function handleEditorMount(editor) {
    editorRef.current = editor
  }

  function handleCodeChange(value) {
    const content = value ?? ''
    const incomingChange = incomingChangeRef.current
    if (incomingChange?.language === selectedLanguage && incomingChange.content === content) {
      incomingChangeRef.current = null
      return
    }

    setCode((current) => ({ ...current, [selectedLanguage]: content }))
    socketRef.current?.emit('code-change', { roomId, language: selectedLanguage, content })
  }

  function copyRoomId() {
    navigator.clipboard?.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function createRoom() {
    setCode(emptyCode)
    setRoomId(createRoomId())
    setPreviewVersion((version) => version + 1)
    setToastMessage('New room created — share its ID to invite collaborators.')
  }

  function runPreview() {
    setRunning(true)
    setPreviewVersion((version) => version + 1)
    setTimeout(() => setRunning(false), 700)
  }

  function showFeatureNotice() {
    setToastMessage('Feature coming soon!')
  }

  useEffect(() => {
    const handlePreviewMessage = (event) => {
      if (event.data?.source === 'collab-code-preview' && event.data.type === 'run-preview') {
        runPreview()
      }
    }

    window.addEventListener('message', handlePreviewMessage)
    return () => window.removeEventListener('message', handlePreviewMessage)
  }, [])

  useEffect(() => {
    if (!toastMessage) return undefined
    const timeout = setTimeout(() => setToastMessage(''), 2600)
    return () => clearTimeout(timeout)
  }, [toastMessage])

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand-row">
          <a className="brand" href="#top" aria-label="CollabCode home"><span className="brand-mark">&lt;/&gt;</span>Collab<span>Code</span></a>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">×</button>
        </div>

        <section className="room-card" aria-labelledby="room-heading">
          <div className="section-label" id="room-heading">CURRENT ROOM</div>
          <div className="room-id">{roomId} <span className={`room-live ${isConnected ? '' : 'offline'}`}><i /> {isConnected ? 'Live' : 'Offline'}</span></div>
          <button className="copy-room" onClick={copyRoomId}>
            <Icon size={15}><rect x="9" y="9" width="10" height="10" rx="1"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></Icon>
            {copied ? 'Copied!' : 'Copy room ID'}
          </button>
        </section>

        <button className="create-room" onClick={createRoom}>
          <Icon><path d="M12 5v14M5 12h14"/></Icon> Create new room
        </button>

        <section className="people-section">
          <div className="people-heading"><span>IN THIS ROOM</span><span className="count">{team.filter((person) => person.active).length}</span></div>
          <div className="people-list">
            {team.map((person) => (
              <div className={`person ${!person.active ? 'away' : ''}`} key={person.name}>
                <div className={`avatar ${person.color}`}>{person.initials}<i /></div>
                <div><strong>{person.name}</strong>{person.you && <small>You</small>}</div>
                {!person.active && <span className="away-label">Away</span>}
              </div>
            ))}
          </div>
        </section>

        <div className="sidebar-footer">
          <button onClick={showFeatureNotice}><Icon><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 1 1 5.4 1.8c-.9 1.2-2.5 1.5-2.5 3.2M12 17h.01"/></Icon> Help & resources</button>
          <button onClick={showFeatureNotice}><Icon><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v9h9"/></Icon> Room activity</button>
        </div>
      </aside>
      {isSidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}

      <main className="workspace" id="top">
        <header className="topbar">
          <div className="topbar-title">
            <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Icon><path d="M4 7h16M4 12h16M4 17h16"/></Icon></button>
            <div><h1>Untitled project</h1><p><span className="saved-dot" /> All changes saved</p></div>
          </div>
          <div className="topbar-actions">
            <div className="collaborators">{team.slice(0, 3).map((person) => <span className={`avatar tiny ${person.color}`} key={person.name}>{person.initials}</span>)}<span className="more-people">+1</span></div>
            <button className="invite" onClick={showFeatureNotice}><Icon size={16}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6"/></Icon><span>Invite</span></button>
            <button className="icon-button" onClick={showFeatureNotice} aria-label="More project options"><Icon><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></Icon></button>
          </div>
        </header>

        <div className="content-grid">
          <section className="editor-panel">
            <div className="panel-toolbar">
              <div className="editor-tab"><span className="language-dot" style={{ background: activeLanguage.color }} />{selectedLanguage.toLowerCase() === 'javascript' ? 'script.js' : `index.${selectedLanguage.toLowerCase()}`}</div>
              <label className="language-select"><span className="select-dot" style={{ background: activeLanguage.color }} />
                <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)} aria-label="Editor language">
                  {languages.map((language) => <option value={language.label} key={language.label}>{language.label}</option>)}
                </select>
                <Icon size={14}><path d="m6 9 6 6 6-6"/></Icon>
              </label>
            </div>
            <div className="editor-wrap">
              <Editor
                height="100%"
                theme="vs-dark"
                language={activeLanguage.monaco}
                value={code[selectedLanguage]}
                onMount={handleEditorMount}
                onChange={handleCodeChange}
                options={{ fontSize: 14, fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace", minimap: { enabled: false }, padding: { top: 18 }, lineNumbersMinChars: 3, scrollBeyondLastLine: false, automaticLayout: true, renderLineHighlight: 'line', cursorBlinking: 'smooth' }}
              />
            </div>
            <div className="editor-status"><span><i className="branch-icon">⌘</i> main</span><span>Ln 1, Col 1</span><span>Spaces: 2</span><span>UTF-8</span></div>
          </section>

          <section className="preview-panel">
            <div className="preview-toolbar">
              <div className="preview-title"><span className="eye"><Icon size={16}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></Icon></span>Output</div>
              <button className={`run-button ${isRunning ? 'running' : ''}`} onClick={runPreview}><span className="play">▶</span>{isRunning ? 'Running…' : 'Run'}</button>
            </div>
            <div className="preview-frame-wrap">
              <iframe key={previewVersion} title="Live HTML preview" sandbox="allow-scripts" srcDoc={previewDocument} />
            </div>
          </section>
        </div>
      </main>
      {toastMessage && <div className="toast" role="status">{toastMessage}</div>}
    </div>
  )
}

export default App
