import { useEffect, useRef, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div className={`${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} shadow rounded-2xl px-4 py-3 max-w-[80%]`}>        
        {msg.type === 'html' ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.html }} />
        ) : msg.type === 'chart' ? (
          <ChartBubble data={msg.chart} />
        ) : msg.type === 'json' ? (
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(msg.json, null, 2)}</pre>
        ) : (
          <p className="whitespace-pre-wrap">{msg.content || msg.message}</p>
        )}
        <div className="mt-2 flex gap-2">
          {msg.buttons?.includes('chart') && (
            <span className="text-xs bg-black/10 px-2 py-1 rounded">Grafico</span>
          )}
          {msg.buttons?.includes('table') && (
            <span className="text-xs bg-black/10 px-2 py-1 rounded">Tabella</span>
          )}
          {msg.buttons?.includes('excel') && (
            <span className="text-xs bg-black/10 px-2 py-1 rounded">Excel</span>
          )}
        </div>
        <div className="text-[10px] opacity-60 mt-1">{new Date(msg.ts || Date.now()).toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

function ChartBubble({ data }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    import('chart.js/auto').then(({ default: Chart }) => {
      const ctx = canvasRef.current.getContext('2d')
      const c = new Chart(ctx, {
        type: data.chart || 'bar',
        data: { labels: data.labels || [], datasets: data.datasets || [] },
        options: { responsive: true, plugins: { legend: { display: true } } }
      })
      return () => c.destroy()
    })
  }, [data])
  return <canvas ref={canvasRef} className="max-w-full" />
}

function App() {
  const [messages, setMessages] = useState([
    { id: 'w', role: 'assistant', type: 'text', content: 'Ciao! Fai una domanda sui tuoi dati. Triggers: "fammi tabella", "fammi grafico", "fammi excel", "fammi json"' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { id: crypto.randomUUID(), role: 'user', type: 'text', content: input, ts: Date.now() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, session_id: 'web' })
      })
      const data = await res.json()
      const assistant = { id: data.id || crypto.randomUUID(), role: 'assistant', ts: Date.now(), ...data }
      setMessages(m => [...m, assistant])
    } catch (e) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', type: 'text', content: 'Errore di rete: ' + e.message }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="min-h-screen bg-[#e5ddd5] flex flex-col">
      <div className="sticky top-0 z-10 bg-[#075E54] text-white px-4 py-3 shadow flex items-center gap-3">
        <div className="font-semibold">AI DB Chat</div>
        <div className="text-xs opacity-80">WhatsApp-like</div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map(m => (
          <MessageBubble key={m.id} msg={m} />
        ))}
      </div>

      <div className="p-3 bg-[#f0f0f0]">
        <div className="flex items-end gap-2 bg-white rounded-full px-3 py-2 shadow">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Scrivi un messaggio..."
            className="flex-1 resize-none outline-none text-sm px-2 py-2"
          />
          <button onClick={send} disabled={loading} className="bg-[#25D366] hover:opacity-90 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-full">
            {loading ? '...' : 'Invia'}
          </button>
        </div>
        <div className="text-[11px] text-center mt-2 opacity-70">Suggerimenti: "Mostrami quanto ho speso per fornitore negli ultimi 3 mesi". Poi prova "fammi tabella" o "fammi grafico".</div>
      </div>
    </div>
  )
}

export default App
