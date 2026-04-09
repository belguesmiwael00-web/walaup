'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, Send, CheckCircle2, X, Monitor, Smartphone, ExternalLink, Lock, AlertTriangle, CreditCard, Rocket, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STATUS_CONFIG = {
  new:                { label: 'Nouveau',           color: '#22D3EE', bg: 'rgba(34,211,238,0.1)'   },
  demo:               { label: 'D\u00e9mo pr\u00eate',        color: '#6366F1', bg: 'rgba(99,102,241,0.1)'   },
  dev:                { label: 'En d\u00e9veloppement', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  payment_requested:  { label: 'Paiement demand\u00e9',  color: '#FB923C', bg: 'rgba(251,146,60,0.1)'   },
  payment_confirmed:  { label: 'Paiement confirm\u00e9', color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  delivered:          { label: 'Livr\u00e9',            color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  cancelled:          { label: 'Annul\u00e9',           color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
}

const PACK_COLOR = {
  Essentiel:  { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  Pro:        { color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
  Partenaire: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
}

const PAYMENT_METHODS = [
  { id: 'flouci',   label: 'Flouci',   emoji: '\ud83d\udcf1' },
  { id: 'konnect',  label: 'Konnect',  emoji: '\ud83d\udcb3' },
  { id: 'd17',      label: 'D17',      emoji: '\ud83d\udcf2' },
  { id: 'virement', label: 'Virement', emoji: '\ud83c\udfe6' },
  { id: 'especes',  label: 'Esp\u00e8ces',  emoji: '\ud83d\udcb5' },
  { id: 'cheque',   label: 'Ch\u00e8que',   emoji: '\ud83d\udcc4' },
]

const STATUS_FLOW = ['new','demo','dev','payment_requested','payment_confirmed','delivered']

const CSS = `
  .adm-cl { display:flex; height:100%; overflow:hidden; }
  .adm-cl-list { width:272px; flex-shrink:0; border-right:1px solid rgba(255,255,255,0.07); display:flex; flex-direction:column; }
  .adm-cl-search { padding:10px; border-bottom:1px solid rgba(255,255,255,0.06); position:relative; }
  .adm-cl-sinp { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:10px; padding:8px 10px 8px 32px; color:var(--tx); font-size:12px; outline:none; box-sizing:border-box; }
  .adm-cl-sinp:focus { border-color:rgba(99,102,241,0.4); }
  .adm-cl-sico { position:absolute; left:20px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--tx-3); }
  .adm-cl-items { flex:1; overflow-y:auto; }
  .adm-cl-items::-webkit-scrollbar { width:3px; }
  .adm-cl-items::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:2px; }
  .adm-cl-item { padding:11px 13px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:background 150ms; }
  .adm-cl-item:hover { background:rgba(255,255,255,0.03); }
  .adm-cl-item--active { background:rgba(99,102,241,0.08); }
  .adm-cl-row1 { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .adm-cl-iname { font-size:13px; font-weight:600; color:var(--tx); }
  .adm-cl-itime { font-size:10px; color:var(--tx-3); }
  .adm-cl-row2 { display:flex; justify-content:space-between; align-items:center; }
  .adm-cl-imsg { font-size:11px; color:var(--tx-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
  .adm-cl-ibadge { width:16px; height:16px; border-radius:8px; background:var(--red); font-size:9px; color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .adm-cl-empty { padding:30px 16px; text-align:center; color:var(--tx-3); font-size:12px; }
  .adm-cl-detail { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .adm-cl-info { padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; gap:10px; flex-shrink:0; flex-wrap:wrap; }
  .adm-cl-avatar { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#6366F1,#8B5CF6); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:#fff; font-family:'Space Grotesk',sans-serif; }
  .adm-cl-meta { flex:1; min-width:0; }
  .adm-cl-meta-name { font-weight:700; font-size:14px; color:var(--tx); }
  .adm-cl-meta-app  { font-size:11px; color:var(--tx-3); margin-top:2px; }
  .adm-badge { padding:2px 9px; border-radius:20px; font-size:10px; font-weight:700; }
  .adm-status-bar { padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; gap:5px; flex-wrap:wrap; align-items:center; flex-shrink:0; }
  .adm-status-btn { padding:4px 9px; border-radius:7px; font-size:10px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:transparent; color:var(--tx-2); transition:all 150ms; }
  .adm-status-btn:hover { background:rgba(99,102,241,0.1); color:var(--tx); }
  .adm-status-btn--active { background:rgba(99,102,241,0.15); border-color:rgba(99,102,241,0.4); color:var(--ac); }
  .adm-panel-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
  .adm-ptab { flex:1; padding:9px; text-align:center; font-size:12px; font-weight:600; color:var(--tx-3); cursor:pointer; transition:all 150ms; border-bottom:2px solid transparent; }
  .adm-ptab:hover { color:var(--tx-2); background:rgba(255,255,255,0.02); }
  .adm-ptab--active { color:var(--ac); border-bottom-color:var(--ac); }
  .adm-chat { flex:1; overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:7px; }
  .adm-chat::-webkit-scrollbar { width:3px; }
  .adm-chat::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:2px; }
  .adm-bubble { max-width:72%; padding:8px 12px; border-radius:14px; font-size:13px; line-height:1.5; }
  .adm-bubble--admin  { align-self:flex-end; background:linear-gradient(135deg,#6366F1,#8B5CF6); color:#fff; border-bottom-right-radius:4px; }
  .adm-bubble--client { align-self:flex-start; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); color:var(--tx); border-bottom-left-radius:4px; }
  .adm-bubble-ts { font-size:10px; opacity:.6; margin-top:3px; text-align:right; }
  .adm-chat-inp { padding:10px 12px; border-top:1px solid rgba(255,255,255,0.07); display:flex; gap:8px; align-items:center; flex-shrink:0; }
  .adm-chat-field { flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:10px; padding:8px 12px; color:var(--tx); font-size:13px; outline:none; resize:none; font-family:'Inter',sans-serif; }
  .adm-chat-field:focus { border-color:rgba(99,102,241,0.4); }
  .adm-chat-send { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,#6366F1,#8B5CF6); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; transition:transform 150ms; flex-shrink:0; }
  .adm-chat-send:hover  { transform:scale(1.08); }
  .adm-chat-send:active { transform:scale(0.92); }
  .adm-no-select { flex:1; display:flex; align-items:center; justify-content:center; color:var(--tx-3); font-size:13px; }
  .dp-root { flex:1; overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
  .dp-slot { background:rgba(13,17,32,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px; }
  .dp-slot--disabled { opacity:.4; pointer-events:none; }
  .dp-slot-head { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .dp-slot-num  { font-size:12px; font-weight:700; color:var(--tx); }
  .dp-slot-badge { padding:2px 8px; border-radius:20px; font-size:10px; font-weight:600; }
  .dp-slot-date { font-size:10px; color:var(--tx-3); margin-left:auto; }
  .dp-url-row { display:flex; gap:6px; }
  .dp-url-inp { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:7px 10px; color:var(--tx); font-size:11px; outline:none; font-family:'JetBrains Mono',monospace; }
  .dp-url-inp:focus { border-color:rgba(99,102,241,0.4); }
  .dp-send-btn { align-self:flex-start; display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; border:none; background:linear-gradient(135deg,#6366F1,#8B5CF6); color:#fff; font-size:11px; font-weight:700; cursor:pointer; transition:transform 150ms; font-family:'Space Grotesk',sans-serif; }
  .dp-send-btn:hover  { transform:scale(1.04); }
  .dp-send-btn:active { transform:scale(0.96); }
  .dp-client-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .dp-client-label { font-size:10px; color:var(--tx-3); }
  .dp-confirm-sim { display:flex; align-items:center; gap:4px; padding:4px 10px; border-radius:7px; border:1px solid rgba(16,185,129,0.4); background:rgba(16,185,129,0.1); color:#10B981; font-size:10px; font-weight:600; cursor:pointer; }
  .dp-reject-sim  { display:flex; align-items:center; gap:4px; padding:4px 10px; border-radius:7px; border:1px solid rgba(251,146,60,0.4); background:rgba(251,146,60,0.1); color:#FB923C; font-size:10px; font-weight:600; cursor:pointer; }
  .dp-pay-section { background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:12px; padding:14px; }
  .dp-pay-title { font-size:13px; font-weight:700; color:#F59E0B; margin-bottom:8px; }
  .dp-pay-sub { font-size:11px; color:var(--tx-3); margin-bottom:12px; }
  .dp-pay-methods { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
  .dp-pay-method { padding:5px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:transparent; font-size:11px; color:var(--tx-2); cursor:pointer; transition:all 150ms; }
  .dp-pay-method--active { border-color:rgba(245,158,11,0.5); background:rgba(245,158,11,0.1); color:#F59E0B; }
  .dp-final-section { background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:14px; }
  .dp-limit-warn { display:flex; align-items:center; gap:7px; padding:10px 12px; border-radius:9px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); font-size:11px; color:#F87171; }
  .adm-chat-empty { text-align:center; color:var(--tx-3); font-size:12px; margin-top:20px; }
  .dp-final-title-green { font-size:13px; font-weight:700; color:#10B981; margin-bottom:8px; }
  .dp-final-url { font-size:11px; color:var(--tx-3); }
  .dp-url-inp-block { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:7px 10px; color:var(--tx); font-size:11px; outline:none; font-family:'JetBrains Mono',monospace; width:100%; box-sizing:border-box; margin-bottom:10px; }
`

const DEMO_STATUS_UI = {
  locked:   { label: '\ud83d\udd12 Verrouill\u00e9e',       color: '#525878', bg: 'rgba(82,88,120,0.1)'   },
  ready:    { label: '\u270f\ufe0f Pr\u00eate \u00e0 envoyer', color: '#22D3EE', bg: 'rgba(34,211,238,0.08)'  },
  sent:     { label: '\ud83d\udce8 Envoy\u00e9e',           color: '#6366F1', bg: 'rgba(99,102,241,0.1)'   },
  confirmed:{ label: '\u2705 Confirm\u00e9e',           color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  rejected: { label: '\u21a9\ufe0f Modif. demand\u00e9e',   color: '#FB923C', bg: 'rgba(251,146,60,0.1)'   },
  disabled: { label: '\ud83d\udeab D\u00e9sactiv\u00e9e',         color: '#374151', bg: 'rgba(55,65,81,0.1)'    },
}

function initDemos() {
  return [
    { slot:1, url:'', status:'ready',  sentAt:null },
    { slot:2, url:'', status:'locked', sentAt:null },
    { slot:3, url:'', status:'locked', sentAt:null },
  ]
}

export default function TabClients() {
  const [leads,       setLeads]       = useState([])
  const [selected,    setSelected]    = useState(null)
  const [search,      setSearch]      = useState('')
  const [msg,         setMsg]         = useState('')
  const [activePanel, setActivePanel] = useState('chat')
  const [payMethod,   setPayMethod]   = useState('flouci')
  const [loading,     setLoading]     = useState(true)
  const chatRef = useRef(null)

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    try {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      const normalized = (data || []).map(l => ({
        ...l,
        messages: l.messages || [],
        demos:    l.demos    || initDemos(),
        pay_status: l.pay_status  || 'none',
        final_url:  l.final_url   || '',
        final_sent: l.final_sent  || false,
        pack:   l.pack   || 'Pro',
        app:    l.app    || '',
        unread: l.unread || 0,
      }))

      setLeads(normalized)
      if (normalized.length > 0 && !selected) setSelected(normalized[0])
    } catch(e) {
      console.error('TabClients fetch:', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateLead(id, updater) {
    setLeads(prev => prev.map(l => l.id === id ? updater(l) : l))
    setSelected(prev => prev?.id === id ? updater(prev) : prev)

    // Sauvegarder dans Supabase
    const updated = updater(leads.find(l => l.id === id))
    if (!updated) return
    await supabase.from('leads').update({
      status:     updated.status,
      messages:   updated.messages,
      demos:      updated.demos,
      pay_status: updated.pay_status,
      final_url:  updated.final_url,
      final_sent: updated.final_sent,
      unread:     updated.unread,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
  }

  async function sendMsg() {
    if (!msg.trim() || !selected) return
    const newMsg = {
      id: Date.now().toString(), sender: 'admin', text: msg,
      ts: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    }
    await updateLead(selected.id, l => ({ ...l, messages: [...(l.messages||[]), newMsg] }))
    setMsg('')
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
  }

  async function changeStatus(s) {
    if (!selected) return
    await updateLead(selected.id, l => ({ ...l, status: s }))
  }

  async function sendDemo(slot) {
    if (!selected) return
    const d = selected.demos[slot - 1]
    if (!d?.url?.trim()) return alert('Entre l\'URL de la d\u00e9mo.')
    await updateLead(selected.id, l => ({
      ...l,
      status: 'demo',
      demos: l.demos.map(dm => dm.slot === slot
        ? { ...dm, status:'sent', sentAt: new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}) }
        : dm.slot === slot+1 && dm.status==='locked' ? { ...dm, status:'ready' } : dm
      )
    }))
  }

  async function confirmDemo(slot) {
    await updateLead(selected.id, l => ({
      ...l, status:'payment_requested', pay_status:'requested',
      demos: l.demos.map(dm => dm.slot===slot ? {...dm,status:'confirmed'} : dm.status!=='rejected' ? {...dm,status:'disabled'} : dm)
    }))
  }

  async function rejectDemo(slot) {
    await updateLead(selected.id, l => ({
      ...l,
      demos: l.demos.map(dm => dm.slot===slot ? {...dm,status:'rejected'} : dm.slot===slot+1 ? {...dm,status:'ready'} : dm)
    }))
  }

  async function confirmPayment() {
    await updateLead(selected.id, l => ({ ...l, pay_status:'confirmed', status:'payment_confirmed' }))
    // Cr\u00e9er une entr\u00e9e dans payments
    await supabase.from('payments').insert({ lead_id: selected.id, amount: 0, method: payMethod, status:'completed', confirmed_at: new Date().toISOString() })
  }

  async function sendFinal() {
    if (!selected?.final_url?.trim()) return alert('Entre l\'URL finale.')
    await updateLead(selected.id, l => ({
      ...l, final_sent:true, status:'delivered',
      demos: l.demos.map(dm => ({ ...dm, status:'disabled' }))
    }))
  }

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search) ||
    l.app?.toLowerCase().includes(search.toLowerCase())
  )

  const sel = selected
  const confirmedDemo = sel?.demos?.find(d => d.status==='confirmed')
  const sentCount = sel?.demos?.filter(d => ['sent','confirmed','rejected'].includes(d.status)).length || 0

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-cl">

        {/* Liste leads */}
        <div className="adm-cl-list">
          <div className="adm-cl-search">
            <Search size={13} className="adm-cl-sico" />
            <input className="adm-cl-sinp" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="adm-cl-items">
            {loading && <div className="adm-cl-empty">Chargement...</div>}
            {!loading && filtered.length === 0 && <div className="adm-cl-empty">Aucun lead trouv\u00e9</div>}
            {filtered.map(l => {
              const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.new
              const lastMsg = l.messages?.[l.messages.length-1]?.text || l.phone || ''
              return (
                <div key={l.id} className={`adm-cl-item${sel?.id===l.id?' adm-cl-item--active':''}`} onClick={() => setSelected(l)}>
                  <div className="adm-cl-row1">
                    <span className="adm-cl-iname">{l.name}</span>
                    <span className="adm-cl-itime">{new Date(l.created_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</span>
                  </div>
                  <div className="adm-cl-row2">
                    <span className="adm-cl-imsg">{lastMsg}</span>
                    {l.unread>0 && <span className="adm-cl-ibadge">{l.unread}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* D\u00e9tail */}
        {!sel ? (
          <div className="adm-no-select">S\u00e9lectionnez un lead</div>
        ) : (
          <div className="adm-cl-detail">

            {/* Info bar */}
            <div className="adm-cl-info">
              <div className="adm-cl-avatar">{sel.name?.charAt(0)?.toUpperCase()}</div>
              <div className="adm-cl-meta">
                <div className="adm-cl-meta-name">{sel.name}</div>
                <div className="adm-cl-meta-app">{sel.app || sel.phone}</div>
              </div>
              {sel.pack && (() => { const pc = PACK_COLOR[sel.pack]||PACK_COLOR.Pro; return <span className="adm-badge">{sel.pack}</span> })()}
              {(() => { const sc = STATUS_CONFIG[sel.status]||STATUS_CONFIG.new; return <span className="adm-badge">{sc.label}</span> })()}
            </div>

            {/* Status bar */}
            <div className="adm-status-bar">
              {STATUS_FLOW.map(s => {
                const sc = STATUS_CONFIG[s]
                return (
                  <button key={s} className={`adm-status-btn${sel.status===s?' adm-status-btn--active':''}`} onClick={() => changeStatus(s)}>
                    {sc.label}
                  </button>
                )
              })}
            </div>

            {/* Panel tabs */}
            <div className="adm-panel-tabs">
              <div className={`adm-ptab${activePanel==='chat'?' adm-ptab--active':''}`} onClick={() => setActivePanel('chat')}>\ud83d\udcac Chat</div>
              <div className={`adm-ptab${activePanel==='demos'?' adm-ptab--active':''}`} onClick={() => setActivePanel('demos')}>\ud83c\udfa8 D\u00e9mos & Paiement</div>
            </div>

            {/* Chat */}
            {activePanel==='chat' && (
              <>
                <div className="adm-chat" ref={chatRef}>
                  {(sel.messages||[]).map(m => (
                    <div key={m.id} className={`adm-bubble adm-bubble--${m.sender}`}>
                      {m.text}
                      <div className="adm-bubble-ts">{m.ts}</div>
                    </div>
                  ))}
                  {(sel.messages||[]).length===0 && <div className="adm-chat-empty">Aucun message — écrivez le premier message</div>
                </div>
                <div className="adm-chat-inp">
                  <textarea className="adm-chat-field" rows={1} placeholder="Message..." value={msg}
                    onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg()} }}
                  />
                  <button className="adm-chat-send" onClick={sendMsg}><Send size={14}/></button>
                </div>
              </>
            )}

            {/* D\u00e9mos panel */}
            {activePanel==='demos' && (
              <div className="dp-root">
                {(sel.demos||[]).map(d => {
                  const sui = DEMO_STATUS_UI[d.status] || DEMO_STATUS_UI.locked
                  const canSend = d.status==='ready' && !confirmedDemo
                  return (
                    <div key={d.slot} className={`dp-slot${d.status==='disabled'?' dp-slot--disabled':''}`}>
                      <div className="dp-slot-head">
                        <span className="dp-slot-num">D\u00e9mo {d.slot}</span>
                        <span className="dp-slot-badge">{sui.label}</span>
                        {d.sentAt && <span className="dp-slot-date">{d.sentAt}</span>}
                      </div>
                      {['ready','sent','confirmed','rejected'].includes(d.status) && (
                        <div className="dp-url-row">
                          <input className="dp-url-inp" placeholder="https://demo.walaup.tn/..." value={d.url}
                            readOnly={d.status!=='ready'}
                            onChange={e => updateLead(sel.id, l => ({ ...l, demos: l.demos.map(dm => dm.slot===d.slot?{...dm,url:e.target.value}:dm) }))}
                          />
                        </div>
                      )}
                      {canSend && <button className="dp-send-btn" onClick={() => sendDemo(d.slot)}><Send size={11}/> Envoyer au client</button>}
                      {d.status==='sent' && !confirmedDemo && (
                        <div className="dp-client-actions">
                          <span className="dp-client-label">R\u00e9ponse client :</span>
                          <span className="dp-confirm-sim" onClick={() => confirmDemo(d.slot)}><CheckCircle2 size={10}/> Confirm\u00e9e</span>
                          {d.slot < 3 && <span className="dp-reject-sim" onClick={() => rejectDemo(d.slot)}><X size={10}/> Modif. demand\u00e9e</span>}
                        </div>
                      )}
                    </div>
                  )
                })}

                {sentCount>=3 && !confirmedDemo && (
                  <div className="dp-limit-warn"><AlertTriangle size={13}/> 3 modifications atteintes.</div>
                )}

                {confirmedDemo && sel.pay_status!=='confirmed' && (
                  <div className="dp-pay-section">
                    <div className="dp-pay-title"><CreditCard size={13}/> Paiement</div>
                    <div className="dp-pay-sub">D\u00e9mo {confirmedDemo.slot} confirm\u00e9e — paiement requis avant la version finale.</div>
                    {sel.pay_status==='none' && (
                      <>
                        <div className="dp-pay-methods">
                          {PAYMENT_METHODS.map(pm => (
                            <button key={pm.id} className={`dp-pay-method${payMethod===pm.id?' dp-pay-method--active':''}`} onClick={() => setPayMethod(pm.id)}>
                              {pm.emoji} {pm.label}
                            </button>
                          ))}
                        </div>
                        <button className="dp-send-btn" onClick={() => updateLead(sel.id, l => ({...l, pay_status:'requested', status:'payment_requested'}))}>
                          Demander le paiement
                        </button>
                      </>
                    )}
                    {sel.pay_status==='requested' && (
                      <button className="dp-send-btn" onClick={confirmPayment}><CheckCircle2 size={11}/> Confirmer paiement re\u00e7u</button>
                    )}
                  </div>
                )}

                {sel.pay_status==='confirmed' && !sel.final_sent && (
                  <div className="dp-final-section">
                    <div className="dp-final-title-green"><Rocket size={13}/> Version finale</div>
                    <input className="dp-url-inp-block" placeholder="https://app.walaup.tn/..." value={sel.final_url||''}
                      onChange={e => updateLead(sel.id, l => ({...l, final_url:e.target.value}))}
                    />
                    <button className="dp-send-btn" onClick={sendFinal}><Rocket size={11}/> Envoyer la version finale</button>
                  </div>
                )}

                {sel.final_sent && (
                  <div className="dp-final-section">
                    <div className="dp-final-title-green">✅ App livrée</div>
                    <div className="dp-final-url">{sel.final_url}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
