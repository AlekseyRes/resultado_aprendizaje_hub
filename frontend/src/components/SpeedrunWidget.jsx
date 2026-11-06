import {
  Button,
  Card,
  Icon,
  List,
  Loader,
  Message,
  Segment,
} from 'semantic-ui-react'
import useSpeedrun from '../hooks/useSpeedrun'
import { formatDate, formatDuration } from '../utils/format'

const RANK_CLASSES = ['app-rank-gold', 'app-rank-silver', 'app-rank-bronze']

function getInitials(value) {
  const text = String(value || '').trim()
  if (!text) return '?'
  if (text.includes('@')) return text.slice(0, 2).toUpperCase()

  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function getHue(value) {
  const text = String(value || 'speedrun')
  let hash = 0

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 360
  }

  return hash
}

export default function SpeedrunWidget({ limit = 6 }) {
  const { data, loading, error, reload } = useSpeedrun()
  const runs = Array.isArray(data) ? data.slice(0, limit) : []

  return (
    <Card fluid className="app-card app-speedrun-card">
      <Card.Content>
        <div className="app-card-header app-leaderboard-header">
          <div>
            <p className="app-eyebrow">Leaderboard</p>
            <Card.Header className="app-card-title">
              Récords recientes
            </Card.Header>
            <span className="app-source-label">
              <Icon name="dot circle outline" aria-hidden="true" />
              Speedrun.com
            </span>
          </div>

          <div className="app-leaderboard-tools">
            <span className="app-live-badge">
              <span className="app-live-dot" aria-hidden="true" />
              LIVE
            </span>
            <Button basic size="small" onClick={reload} loading={loading}>
              <Icon name="refresh" />
              Actualizar
            </Button>
          </div>
        </div>

        {loading && (
          <Segment basic className="app-center">
            <Loader active inline="centered" />
            <p>Cargando récords...</p>
          </Segment>
        )}

        {!loading && error && (
          <Message negative>
            <Message.Header>No pudimos cargar los récords</Message.Header>
            <p>{error.message}</p>
            <Button color="red" size="small" onClick={reload}>
              Reintentar
            </Button>
          </Message>
        )}

        {!loading && !error && runs.length === 0 && (
          <Message info>No hay récords disponibles por el momento.</Message>
        )}

        {!loading && !error && runs.length > 0 && (
          <List divided relaxed className="app-speedrun-list">
            {runs.map((run, index) => {
              const rank = index + 1
              const runners =
                Array.isArray(run.runners) && run.runners.length
                  ? run.runners.join(', ')
                  : 'Invitado'
              const rankModifier = RANK_CLASSES[index] || ''
              const hue = getHue(run.gameId || run.game)

              return (
                <List.Item
                  key={run.id || `${run.game}-${run.date}-${index}`}
                  className={`app-run-row ${rankModifier}`}
                >
                  <span className={`app-rank-badge ${rankModifier}`}>
                    {rank}
                  </span>

                  <span
                    className="app-run-cover"
                    style={{ borderColor: `hsla(${hue}, 75%, 60%, 0.28)` }}
                  >
                    <span
                      className="app-run-cover-fallback"
                      style={{
                        background: `radial-gradient(circle at 30% 20%, hsla(${hue}, 85%, 62%, 0.34), rgba(7, 7, 13, 0.92))`,
                        color: `hsl(${hue}, 90%, 74%)`,
                      }}
                    >
                      {getInitials(run.game)}
                    </span>
                  </span>

                  <div className="app-run-main">
                    <div className="app-run-game">
                      {run.game || 'Juego desconocido'}
                    </div>
                    <div className="app-run-meta-row">
                      <span className="app-run-meta">
                        <Icon name="users" />
                        {runners}
                      </span>
                      <span className="app-run-meta">
                        <Icon name="calendar outline" />
                        {formatDate(run.date)}
                      </span>
                    </div>
                  </div>

                  <div className="app-run-time">
                    {formatDuration(run.timeSeconds)}
                  </div>

                  {run.webLink && (
                    <a
                      href={run.webLink}
                      target="_blank"
                      rel="noreferrer"
                      className="app-run-link"
                    >
                      Ver run
                      <Icon name="external alternate" />
                    </a>
                  )}
                </List.Item>
              )
            })}
          </List>
        )}
      </Card.Content>
    </Card>
  )
}
