'use client'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Users, CreditCard, Package, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const CSS = `
  .adm-ov { padding:24px; overflow-y:auto; height:100%; }
  .adm-ov::-webkit-scrollbar { width:4px; }
  .adm-ov::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
  .adm-ov-title { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:22px; color:var(--tx); margin-bottom:4px; }
  .adm-ov-sub   { font-size:13px; color:var(--tx-3); margin-bottom:24px; }

  .adm-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  @media(max-width:900px){ .adm-kpi-grid { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:600px){ .adm-kpi-grid { grid-template-columns:1fr; } }

  .adm-kpi-card { background:rgba(13,17,32,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px; backdrop-filter:blur(12px); transition:border-color 200ms; }
  .adm-kpi-card:hover { border-color:rgba(99,102,241,0.2); }
  .adm-kpi-head  { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .adm-kpi-icon  { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .adm-kpi-val   { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:28px; margin-bottom:4px; line-height:1; }
  .adm-kpi-label { font-size:12px; color:var(--tx-2); margin-bottom:4px; }
  .adm-kpi-trend { font-size:11px; color:var(--tx-3); }

  /* Color variants via data-color */
  [data-color="indigo"] .adm-kpi-icon { background:rgba(99,102,241,.15); }
  [data-color="amber"]  .adm-kpi-icon { background:rgba(245,158,11,.15); }
  [data-color="green"]  .adm-kpi-icon { background:rgba(16,185,129,.15); }
  [data-color="cyan"]   .adm-kpi-icon { background:rgba(34,211,238,.15); }
  [data-color="purple"] .adm-kpi-icon { background:rgba(139,92,246,.15); }
  [data-color="red"]    .adm-kpi-icon { background:rgba(248,113,113,.15); }
  [data-color="indigo"] .adm-kpi-icon svg { color:#6366F1; }
  [data-color="amber"]  .adm-kpi-icon svg { color:#F59E0B; }
  [data-color="green"]  .adm-kpi-icon svg { color:#10B981; }
  [data-color="cyan"]   .adm-kpi-icon svg { color:#22D3EE; }
  [data-color="purple"] .adm-kpi-icon svg { color:#8B5CF6; }
  [data-color="red"]    .adm-kpi-icon svg { color:#F87171; }
  [data-color="indigo"] .adm-kpi-val { color:#6366F1; }
  [data-color="amber"]  .adm-kpi-val { color:#F59E0B; }
  [data-color="green"]  .adm-kpi-val { color:#10B981; }
  [data-color="cyan"]   .adm-kpi-val { color:#22D3EE; }
  [data-color="purple"] .adm-kpi-val { color:#8B5CF6; }
  [data-color="red"]    .adm-kpi-val { color:#F87171; }

  .adm-charts { display:flex; gap:14px; margin-bottom:20px; }
  @media(max-width:700px){ .adm-charts { flex-direction:column; } }
  .adm-chart-card   { flex:1; background:rgba(13,17,32,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px; backdrop-filter:blur(12px); }
  .adm-chart-card-2 { flex:2; }
  .adm-chart-title  { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:var(--tx); margin-bottom:16px; }

  .adm-bars      { display:flex; align-items:flex-end; gap:8px; height:100px; }
  .adm-bar-col   { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
  .adm-bar-stack { width:100%; display:flex; flex-direction:column-reverse; gap:2px; flex:1; justify-content:flex-end; }
  .adm-bar-seg   { border-radius:3px; width:100%; min-height:2px; }
  .adm-bar-annual  { background:linear-gradient(180deg,#6366F1,#4f46e5); }
  .adm-bar-monthly { background:linear-gradient(180deg,#F59E0B,#d97706); }
  .adm-bar-month   { font-size:10px; color:var(--tx-3); }

  .adm-pack-row    { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .adm-pack-dot    { width:8px; height:8px; border-radius:2px; flex-shrink:0; }
  .adm-pack-bar-bg { flex:1; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
  .adm-pack-bar    { height:100%; border-radius:3px; transition:width 1s cubic-bezier(0.16,1,0.3,1); }
  .adm-pack-count  { font-size:11px; color:var(--tx-3); min-width:20px; text-align:right; }
  .adm-pack-label  { font-size:11px; color:var(--tx-2); min-width:100px; }
  [data-pack="pro"]       .adm-pack-dot, [data-pack="pro"]       .adm-pack-bar { background:#6366F1; }
  [data-pack="essentiel"] .adm-pack-dot, [data-pack="essentiel"] .adm-pack-bar { background:#10B981; }
  [data-pack="partenaire"].adm-pack-dot, [data-pack="partenaire"].adm-pack-bar { background:#F59E0B; }

  .adm-bottom   { display:flex; gap:14px; }
  @media(max-width:700px){ .adm-bottom { flex-direction:column; } }
  .adm-activity { flex:1; background:rgba(13,17,32,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px; backdrop-filter:blur(12px); }
  .adm-activity-title { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:var(--tx); margin-bottom:14px; }
  .adm-act-item  { display:flex; gap:12px; align-items:flex-start; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .adm-act-item:last-child { border-bottom:none; }
  .adm-act-dot   { width:8px; height:8px; border-radius:50%; margin-top:4px; flex-shrink:0; }
  .adm-act-text  { font-size:12px; color:var(--tx-2); flex:1; line-height:1.5; }
  .adm-act-time  { font-size:10px; color:var(--tx-3); white-space:nowrap; }
  [data-act="lead"]    .adm-act-dot { background:#6366F1; }
  [data-act="payment"] .adm-act-dot { background:#10B981; }
  [data-act="cancel"]  .adm-act-dot { background:#F87171; }

  .adm-loading { display:flex; align-items:center; justify-content:center; height:200px; color:var(--tx-3); font-size:14px; }
  .adm-empty   { font-size:12px; color:var(--tx-3); text-align:center; padding:20px; }
`

const KPIS_DEF = [
  { key: 'leads',     label: 'Leads ce mois',     unit: '',    color: 'indigo', icon: Users },
  { key: 'revenus',   label: 'Revenus (DT)',       unit: ' DT', color: 'amber',  icon: CreditCard },
  { key: 'clients',   label: 'Clients actifs',     unit: '',    color: 'green',  icon: TrendingUp },
  { key: 'apps',      label: 'Apps en cours',      unit: '',    color: 'cyan',   icon: Package },
  { key: 'abos',      label: 'Abonnements actifs', unit: '',    color: 'purple', icon: TrendingUp },
  { key: 'resil',     label: 'Résiliations',       unit: '',    color: 'red',    icon: AlertTriangle },
]

const PACK_KEYS = [
  { key: 'pro',        label: 'Pack Pro' },
  { key: 'essentiel',  label: 'Pack Essentiel' },
  { key: 'partenaire', label: 'Pack Partenaire' },
]

function timeAgo(date) {
  if (!date) return ''
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

function KpiCard({ def, value, idx }) {
  const valRef = useRef(null)
  useEffect(() => {
    const el = valRef.current
    if (!el) return
    const target = value || 0
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / 1200, 1)
      el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target).toLocaleString('fr-TN') + def.unit
      if (t < 1) requestAnimationFrame(step)
    }
    const timer = setTimeout(() => requestAnimationFrame(step), idx * 80)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="adm-kpi-card" data-color={def.color}>
      <div className="adm-kpi-head">
        <div className="adm-kpi-icon"><def.icon size={16} /></div>
      </div>
      <div className="adm-kpi-val" ref={valRef}>0{def.unit}</div>
      <div className="adm-kpi-label">{def.label}</div>
    </div>
  )
}

export default function TabOverview() {
  const [values,   setValues]   = useState({})
  const [revenue,  setRevenue]  = useState([])
  const [activity, setActivity] = useState([])
  const [packs,    setPacks]    = useState({})
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const now   = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        { count: leads },
        { data: pays },
        { count: clients },
        { count: apps },
        { count: abos },
        { count: resil },
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', start),
        supabase.from('payments').select('amount').eq('status', 'completed').gte('confirmed_at', start),
        supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', ['demo', 'payment_requested', 'payment_confirmed']),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'cancelled').gte('cancelled_at', start),
      ])

      setValues({
        leads:   leads   || 0,
        revenus: pays?.reduce((s, p) => s + (p.amount || 0), 0) || 0,
        clients: clients || 0,
        apps:    apps    || 0,
        abos:    abos    || 0,
        resil:   resil   || 0,
      })

      // Revenus 6 mois
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const { data: mp } = await supabase.from('payments').select('amount,method').eq('status','completed')
          .gte('confirmed_at', d.toISOString()).lte('confirmed_at', end.toISOString())
        months.push({
          month:   d.toLocaleDateString('fr-FR', { month: 'short' }),
          annual:  mp?.filter(p => p.method !== 'subscription').reduce((s,p) => s+(p.amount||0), 0) || 0,
          monthly: mp?.filter(p => p.method === 'subscription').reduce((s,p) => s+(p.amount||0), 0) || 0,
        })
      }
      setRevenue(months)

      // Packs
      const { data: subs } = await supabase.from('subscriptions').select('plan').eq('status','active')
      const cnt = { pro:0, essentiel:0, partenaire:0 }
      subs?.forEach(s => { if (cnt[s.plan] !== undefined) cnt[s.plan]++ })
      setPacks(cnt)

      // Activité
      const { data: rLeads } = await supabase.from('leads').select('name,status,created_at').order('created_at',{ascending:false}).limit(5)
      const { data: rPays  } = await supabase.from('payments').select('amount,method,confirmed_at').eq('status','completed').order('confirmed_at',{ascending:false}).limit(3)
      setActivity([
        ...(rLeads?.map(l => ({ type:'lead',    time: timeAgo(l.created_at),  text: `Nouveau lead — ${l.name}` })) || []),
        ...(rPays?.map(p  => ({ type:'payment', time: timeAgo(p.confirmed_at), text: `Paiement ${p.amount} DT (${p.method||'N/A'})` })) || []),
      ].slice(0, 8))
    } catch(e) {
      console.error('TabOverview:', e)
    } finally {
      setLoading(false)
    }
  }

  const maxRev = Math.max(...revenue.map(r => r.annual + r.monthly), 1)
  const packTotal = Object.values(packs).reduce((a,b) => a+b, 0) || 1

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-ov">
        <div className="adm-ov-title">Vue d'ensemble</div>
        <div className="adm-ov-sub">Données en temps réel · Walaup Platform</div>

        {loading ? (
          <div className="adm-loading">Chargement des données...</div>
        ) : (
          <>
            <div className="adm-kpi-grid">
              {KPIS_DEF.map((def, i) => (
                <KpiCard key={def.key} def={def} value={values[def.key]} idx={i} />
              ))}
            </div>

            <div className="adm-charts">
              <div className="adm-chart-card adm-chart-card-2">
                <div className="adm-chart-title">Revenus — 6 derniers mois (DT)</div>
                {revenue.some(r => r.annual + r.monthly > 0) ? (
                  <div className="adm-bars">
                    {revenue.map((r, i) => (
                      <div className="adm-bar-col" key={i}>
                        <div className="adm-bar-stack">
                          <div className="adm-bar-seg adm-bar-monthly" style={{ height: `${Math.round(r.monthly/maxRev*80)}px` }} />
                          <div className="adm-bar-seg adm-bar-annual"  style={{ height: `${Math.round(r.annual/maxRev*80)}px`  }} />
                        </div>
                        <div className="adm-bar-month">{r.month}</div>
                      </div>
                    ))}
                  </div>
                ) : <div className="adm-empty">Aucun paiement enregistré</div>}
              </div>

              <div className="adm-chart-card">
                <div className="adm-chart-title">Répartition packs</div>
                {PACK_KEYS.map(p => (
                  <div className="adm-pack-row" key={p.key} data-pack={p.key}>
                    <div className="adm-pack-dot" />
                    <span className="adm-pack-label">{p.label}</span>
                    <div className="adm-pack-bar-bg">
                      <div className="adm-pack-bar" style={{ width: `${Math.round((packs[p.key]||0)/packTotal*100)}%` }} />
                    </div>
                    <div className="adm-pack-count">{packs[p.key]||0}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-bottom">
              <div className="adm-activity">
                <div className="adm-activity-title">Activité récente</div>
                {activity.length === 0
                  ? <div className="adm-empty">Aucune activité pour l'instant</div>
                  : activity.map((a, i) => (
                    <div className="adm-act-item" key={i} data-act={a.type}>
                      <div className="adm-act-dot" />
                      <span className="adm-act-text">{a.text}</span>
                      <span className="adm-act-time">{a.time}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
