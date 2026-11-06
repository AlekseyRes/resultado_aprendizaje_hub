import { Card, Icon, Label } from 'semantic-ui-react'
import { formatDate } from '../utils/format'

function getInitials(value) {
  const text = String(value || '').trim()
  if (!text) return '?'
  if (text.includes('@')) return text.slice(0, 2).toUpperCase()

  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function UserSummaryCard({ user }) {
  if (!user) return null

  const displayName = user.full_name || user.email || 'Usuario'
  const email = user.email || ''
  const role = user.is_staff ? 'Administrador' : 'Usuario'
  const isActive = Boolean(user.is_active)
  const initials = getInitials(displayName)

  return (
    <Card fluid className="app-card app-user-card">
      <Card.Content>
        <div className="app-player-card">
          <div className="app-player-avatar" aria-hidden="true">
            {initials}
          </div>

          <div className="app-player-identity">
            <Card.Header className="app-player-name">
              {displayName}
            </Card.Header>
            <Card.Meta className="app-player-email">{email}</Card.Meta>

            <div className="app-player-pills">
              <Label className="app-role-pill">{role}</Label>
              <Label
                className={`app-status-label ${isActive ? 'is-active' : 'is-inactive'}`}
              >
                {isActive ? 'Activo' : 'Inactivo'}
              </Label>
            </div>
          </div>
        </div>

        <div className="app-player-divider" />

        <div className="app-user-row">
          <Icon name="calendar alternate outline" />
          <span>Miembro desde {formatDate(user.date_joined)}</span>
        </div>
        <div className="app-user-row">
          <Icon name={isActive ? 'check circle' : 'times circle'} />
          <span>{isActive ? 'Cuenta habilitada' : 'Cuenta deshabilitada'}</span>
        </div>
      </Card.Content>
    </Card>
  )
}
