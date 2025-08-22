import './stats.css'

function StatCard({ color, label, value }) {
  return (
    <div className={`stat-card ${color}`}>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )
}

function StatsGrid({ stats }) {
  return (
    <div className="grid-4">
      {stats.map((s) => (
        <StatCard key={s.label} color={s.color} label={s.label} value={s.value} />
      ))}
    </div>
  )
}

export default StatsGrid


