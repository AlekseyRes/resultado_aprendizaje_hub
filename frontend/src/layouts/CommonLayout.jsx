import { Container, Icon, Menu } from 'semantic-ui-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
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

export default function CommonLayout() {
  const { auth } = useAuth()
  const initials = auth ? getInitials(auth.full_name || auth.email) : ''

  return (
    <div className="app-shell">
      <Menu borderless fixed="top" className="app-menu">
        <Container className="app-menu-inner">
          <Menu.Item as={Link} to="/" header className="app-brand">
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

          <Menu.Menu position="right" className="app-nav">
            <Menu.Item as={NavLink} to="/" end>
              Inicio
            </Menu.Item>
            {auth ? (
              <>
                <Menu.Item as={NavLink} to="/dashboard">
                  Dashboard
                </Menu.Item>
                <Menu.Item className="app-nav-user" title={auth.email}>
                  <span className="app-user-chip">
                    <span className="app-user-chip-avatar" aria-hidden="true">
                      {initials}
                    </span>
                    <span className="app-user-email">{auth.email}</span>
                  </span>
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item as={NavLink} to="/login">
                  Ingresar
                </Menu.Item>
                <Menu.Item as={NavLink} to="/register">
                  Registrarse
                </Menu.Item>
              </>
            )}
          </Menu.Menu>
        </Container>
      </Menu>

      <main className="app-main">
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
