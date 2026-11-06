import { Grid, Header, Icon } from 'semantic-ui-react'
import useAuth from '../../hooks/useAuth'
import UserSummaryCard from '../../components/UserSummaryCard'
import SpeedrunWidget from '../../components/SpeedrunWidget'

const STATS = [
  { icon: 'trophy', value: 'Live', label: 'Récords en vivo' },
  { icon: 'cloud', value: 'REST', label: 'Fuente Speedrun.com' },
  { icon: 'shield alternate', value: 'JWT', label: 'Sesión segura' },
]

export default function DashboardPage() {
  const { auth } = useAuth()
  const displayName = auth?.full_name || auth?.email || 'jugador'

  return (
    <div className="app-dashboard">
      <header className="app-dashboard-header">
        <div>
          <p className="app-eyebrow">Centro de jugador</p>
          <Header as="h1" className="app-page-title">
            PLAYER HUB
          </Header>
          <p className="app-dashboard-welcome">
            Bienvenido de nuevo, <strong>{displayName}</strong>. Tu próxima run
            empieza acá.
          </p>
        </div>
        <span className="app-pill app-session-pill">
          <span className="app-live-dot" aria-hidden="true" />
          Sesión activa
        </span>
      </header>

      <section className="app-stats app-stats-compact" aria-label="Resumen de sesión">
        {STATS.map((stat) => (
          <article className="app-stat-card" key={stat.label}>
            <span className="app-stat-top">
              <Icon name={stat.icon} aria-hidden="true" />
              {stat.value}
            </span>
            <span className="app-stat-label">{stat.label}</span>
          </article>
        ))}
      </section>

      <Grid stackable columns={2} className="app-dashboard-grid">
        <Grid.Column width={6}>
          <UserSummaryCard user={auth} />
        </Grid.Column>
        <Grid.Column width={10}>
          <SpeedrunWidget />
        </Grid.Column>
      </Grid>
    </div>
  )
}
