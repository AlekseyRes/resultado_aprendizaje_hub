import { Button, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import SpeedrunWidget from '../../components/SpeedrunWidget'

const STATS = [
  {
    icon: 'trophy',
    value: 'Live',
    label: 'Récords en vivo',
  },
  {
    icon: 'cloud',
    value: 'API',
    label: 'Speedrun.com',
  },
  {
    icon: 'shield alternate',
    value: 'JWT',
    label: 'Auth JWT',
  },
  {
    icon: 'code',
    value: 'Full stack',
    label: 'Django + React',
  },
]

export default function HomePage() {
  const { auth } = useAuth()

  return (
    <div className="app-home">
      <section className="app-hero">
        <div className="app-hero-inner">
          <span className="app-pill app-live-pill">
            <span className="app-live-dot" aria-hidden="true" />
            LIVE · SPEEDRUN.COM API
          </span>

          <h1 className="app-hero-title">SPEEDRUN HUB</h1>

          <p className="app-hero-kicker">
            El pulso de la escena speedrun, en un solo lugar
          </p>

          <p className="app-hero-text">
            Seguí los récords más recientes de Speedrun.com, gestioná tu cuenta
            y viví cada run como si estuvieras en la cabina. Un leaderboard
            oscuro, rápido y hecho para jugadores que no se conforman.
          </p>

          <div className="app-hero-actions">
            {auth ? (
              <Button as={Link} to="/dashboard" primary size="large">
                Ir al dashboard
                <Icon name="arrow right" />
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" primary size="large">
                  Ingresar
                  <Icon name="sign-in" />
                </Button>
                <Button as={Link} to="/register" size="large" basic>
                  Crear cuenta
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="app-stats" aria-label="Características de la plataforma">
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

      <section className="app-section" aria-labelledby="latest-records">
        <div className="app-section-head">
          <div>
            <p className="app-eyebrow">Leaderboard global</p>
            <h2 className="app-section-title" id="latest-records">
              ÚLTIMOS RÉCORDS
            </h2>
          </div>
          <span className="app-section-note">
            Datos públicos de Speedrun.com
          </span>
        </div>

        <SpeedrunWidget limit={6} />
      </section>
    </div>
  )
}
