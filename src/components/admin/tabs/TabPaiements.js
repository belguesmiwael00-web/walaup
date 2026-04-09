'use client'
import { useState, useEffect } from 'react'
import { Download, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const METHODS = {
  flouci:   { emoji: '\ud83d\udcf1', label: 'Flouci',   color: '#6366F1' },
  konnect:  { emoji: '\ud83d\udcb3', label: 'Konnect',  color: '#22D3EE' },
  d17:      { emoji: '\ud83d\udcf2', label: 'D17',      color: '#10B981' },
  virement: { emoji: '\ud83c\udfe6', label: 'Virement', color: '#F59E0B' },
  especes:  { emoji: '\ud83d\udcb5', label: 'Esp\u00e8ces',  color: '#8B5CF6' },
  cheque:   { emoji: '\ud83d\udcc4', label: 'Ch\u00e8que',   color: '#FB923C' },
  subscription: { emoji: '\ud83d\udd04', label: 'Abonnement', color: '#10B981' },
}

const STATUS_UI = {
  completed: { label: 'Pay\u00e9',     color: '#10B981', bg: 'rgba(16,185,129,0.1)',  Icon: CheckCircle2 },
  pending:   { label: 'En cours', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  Icon: Clock },
  failed:    { label: '\u00c9chou\u00e9',   color: '#F87171', bg: 'rgba(248,113,113,0.1)', Icon: XCircle },
}

const CSS = `
  .adm-pay { padding:24px; overflow-y:auto; height:100%; }
  .adm-pay::-webkit-scrollbar { width:4px; }
  .adm-pay::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
  .adm-pay-title { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:20px; color:var(--tx); margin-bottom:16px; }

  .adm-pay-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
  @media(max-width:900px){ .adm-pay-kpis { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:500px){ .adm-pay-kpis { grid-template-columns:1fr; } }
  .adm-pay-kpi { padding:16px; border-radius:12px; background:rgba(13,17,32,0.7); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(10px); }
  .adm-pay-kpi-val   { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:20px; margin-bottom:4px; }
  .adm-pay-kpi-label { font-size:11px; color:var(--tx-2); margin-bottom:3px; }
  .adm-pay-kpi-sub   { font-size:10px; color:var(--tx-3); }

  .adm-pay-toolbar { display:flex; gap:8px; align-items:center; margin-bottom:14px; flex-wrap:wrap; }
  .adm-pay-filter { padding:5px 12px; border-radius:20px; font-size:11px; font-weight:600; border:1px solid rgba(255,255,255,0.1); background:transparent; color:var(--tx-2); cursor:pointer; transition:all 150ms; }
  .adm-pay-filter:hover { background:rgba(99,102,241,0.1); color:var(--tx); }
  .adm-pay-filter--active { background:rgba(99,102,241,0.15); border-color:rgba(99,102,241,0.4); color:var(--ac); }
  .adm-pay-export { margin-left:auto; display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:9px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:var(--tx-2); font-size:11px; font-weight:600; cursor:pointer; transition:all 150ms; }
  .adm-pay-export:hover { background:rgba(99,102,241,0.1); color:var(--tx); }

  .adm-pay-table { background:rgba(13,17,32,0.7); border:1px solid rgba(255,255,255,0.07); border-radius:14px; overflow:hidden; backdrop-filter:blur(10px); }
  .adm-pay-table-head { display:grid; grid-template-columns:100px 1fr 1fr 110px 110px 100px; padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.07); font-size:10px; font-weight:700; color:var(--tx-3); letter-spacing:.06em; text-transform:uppercase; }
  .adm-pay-row { display:grid; grid-template-columns:100px 1fr 1fr 110px 110px 100px; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.04); align-items:center; transition:background 150ms; }
  .adm-pay-row:last-child { border-bottom:none; }
  .adm-pay-row:hover { background:rgba(255,255,255,0.03); }
  .adm-pay-date   { font-size:11px; color:var(--tx-3); font-family:'JetBrains Mono',monospace; }
  .adm-pay-client { font-size:12px; font-weight:600; color:var(--tx); }
  .adm-pay-desc   { font-size:11px; color:var(--tx-3); margin-top:2px; }
  .adm-pay-method { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--tx-2); }
  .adm-pay-amount { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--gold, #F59E0B); }
  .adm-pay-status { display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:700; }
  .adm-pay-empty  { padding:40px; text-align:center; color:var(--tx-3); font-size:13px; }
  .adm-pay-loading { padding:40px; text-align:center; color:var(--tx-3); font-size:13px; }

  @media(max-width:768px) {
    .adm-pay-table-head { display:none; }
    .adm-pay-row { grid-template-columns:1fr auto; grid-template-rows:auto auto; gap:4px; }
  }
`

const FILTERS = [
  { id: 'all',       label: 'Tous' },
  { id: 'completed', label: '\u2713 Pay\u00e9' },
  { id: 'pending',   label: '\u23f3 En cours' },
  { id: 'failed',    label: '\u2717 \u00c9chou\u00e9' },
]

export default function TabPaiements() {
  const [payments, setPayments] = useState([])
  const [kpis,     setKpis]     = useState({ month: 0, total: 0, count: 0, topMethod: '—' })
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      // Tous les paiements avec nom du lead
      const { data: pays } = await supabase
        .from('payments')
        .select('id, amount, method, status, confirmed_at, created_at, leads(name)')
        .order('created_at', { ascending: false })
        .limit(100)

      setPayments(pays || [])

      // KPIs
      const now   = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const completed = (pays || []).filter(p => p.status === 'completed')
      const monthPays = completed.filter(p => (p.confirmed_at || p.created_at) >= start)

      const monthTotal = monthPays.reduce((s, p) => s + (p.amount || 0), 0)
      const yearTotal  = completed.reduce((s, p) => s + (p.amount || 0), 0)

      // M\u00e9thode la plus utilis\u00e9e
      const methodCount = {}
      completed.forEach(p => { if (p.method) methodCount[p.method] = (methodCount[p.method] || 0) + 1 })
      const topMethod = Object.entries(methodCount).sort((a, b) => b[1] - a[1])[0]
      const topPct    = topMethod && completed.length > 0 ? Math.round(topMethod[1] / completed.length * 100) : 0
      const topLabel  = topMethod ? (METHODS[topMethod[0]]?.label || topMethod[0]) : '\u2014'

      setKpis({
        month:     monthTotal,
        total:     yearTotal,
        count:     monthPays.length,
        topMethod: topMethod ? `${topLabel} ${topPct}%` : '\u2014',
      })
    } catch(e) {
      console.error('TabPaiements:', e)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(d) {
    if (!d) return '\u2014'
    return new Date(d).toLocaleDateString('fr-FR')
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  const KPIS_DATA = [
    { label: 'Total ce mois',  value: `${kpis.month.toLocaleString('fr-TN')} DT`, color: '#F59E0B', sub: 'Paiements confirm\u00e9s' },
    { label: 'Total cumul\u00e9',   value: `${kpis.total.toLocaleString('fr-TN')} DT`, color: '#6366F1', sub: 'Depuis le d\u00e9but' },
    { label: 'Transactions',   value: String(kpis.count),                          color: '#10B981', sub: 'Ce mois' },
    { label: 'M\u00e9thode cl\u00e9',   value: kpis.topMethod,                              color: '#22D3EE', sub: 'La plus utilis\u00e9e' },
  ]

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-pay">
        <div className="adm-pay-title">Paiements</div>

        <div className="adm-pay-kpis">
          {KPIS_DATA.map((k, i) => (
            <div className="adm-pay-kpi" key={i}>
              <div className="adm-pay-kpi-val" data-color={i}>{k.value}</div>
              <div className="adm-pay-kpi-label">{k.label}</div>
              <div className="adm-pay-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="adm-pay-toolbar">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`adm-pay-filter${filter === f.id ? ' adm-pay-filter--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <button className="adm-pay-export">
            <Download size={12} />
            Exporter CSV
          </button>
        </div>

        <div className="adm-pay-table">
          <div className="adm-pay-table-head">
            <span>Date</span>
            <span>Client</span>
            <span>Description</span>
            <span>M\u00e9thode</span>
            <span>Montant</span>
            <span>Statut</span>
          </div>

          {loading && <div className="adm-pay-loading">Chargement...</div>}

          {!loading && filtered.length === 0 && (
            <div className="adm-pay-empty">Aucun paiement trouv\u00e9</div>
          )}

          {!loading && filtered.map(p => {
            const m = p.method ? METHODS[p.method] : null
            const s = STATUS_UI[p.status] || STATUS_UI.pending
            const SIcon = s.Icon
            const clientName = p.leads?.name || 'Client'
            return (
              <div className="adm-pay-row" key={p.id}>
                <div className="adm-pay-date">{formatDate(p.confirmed_at || p.created_at)}</div>
                <div>
                  <div className="adm-pay-client">{clientName}</div>
                </div>
                <div className="adm-pay-desc">{m?.label || p.method || '\u2014'}</div>
                <div className="adm-pay-method">
                  {m ? <>{m.emoji} {m.label}</> : '\u2014'}
                </div>
                <div className="adm-pay-amount">{(p.amount || 0).toLocaleString('fr-TN')} DT</div>
                <div>
                  <span className="adm-pay-status" data-status={p.status}>
                    <SIcon size={10} />
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
