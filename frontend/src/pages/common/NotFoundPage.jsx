import { Button, Container, Header, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container text textAlign="center" className="app-notfound">
      <p className="app-notfound-code">404</p>

      <div className="app-notfound-signal" aria-hidden="true">
        <Icon name="bolt" />
      </div>

      <Header as="h1" className="app-notfound-title">
        SIGNAL LOST
      </Header>
      <p className="app-notfound-text">
        La ruta que buscás no existe o fue movida. Página no encontrada.
      </p>

      <Button as={Link} to="/" primary size="large">
        <Icon name="arrow left" />
        Volver al inicio
      </Button>
    </Container>
  )
}
