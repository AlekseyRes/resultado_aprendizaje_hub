import { Button, Container, Dimmer, Icon, Loader, Menu } from 'semantic-ui-react'
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const CURRENT_YEAR = new Date().getFullYear()

function getInitials(value) {
  const text = String(value || '').trim()
  if (!text) return 'SH'
  if (text.includes('@')) return text.slice(0, 2).toUpperCase()

  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function AdminLayout() {
  const { auth, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <Dimmer active inverted page>
        <Loader size="large">Cargando sesión...</Loader>
      </Dimmer>
    )
  }

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = getInitials(auth.full_name || auth.email)

  return (
    <div className="app-shell">
      <Menu borderless fixed="top" className="app-menu">
        <Container className="app-menu-inner">
          <Menu.Item as={Link} to="/dashboard" header className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">
              <Icon name="gamepad" />
            </span>
            <span className="app-brand-text">
              <span className="app-brand-name">
                SPEEDRUN <span className="app-brand-accent">HUB</span>
              </span>
              <span className="app-brand-tagline">by Proyecto Integrador</span>
            </span>
          </Menu.Item>

          <Menu.Item as={NavLink} to="/dashboard" end>
            Dashboard
          </Menu.Item>

          {auth.is_staff && (
            <Menu.Item as={NavLink} to="/admin/users">
              <Icon name="users" />
              Usuarios
            </Menu.Item>
          )}

          <Menu.Menu position="right" className="app-nav">
            <Menu.Item className="app-nav-user" title={auth.email}>
              <span className="app-user-chip">
                <span className="app-user-chip-avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="app-user-email">{auth.email}</span>
              </span>
            </Menu.Item>
            <Menu.Item className="app-nav-logout">
              <Button basic size="small" onClick={handleLogout}>
                <Icon name="sign-out" />
                Salir
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>

      <main className="app-main app-main-admin">
        <Container className="app-container">
          <Outlet />
        </Container>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <p className="app-footer-tagline">
            Every run is a new personal best.
          </p>
          <p className="app-footer-meta">
            Proyecto Integrador · Django + React · {CURRENT_YEAR}
          </p>
        </div>
      </footer>
    </div>
  )
}
