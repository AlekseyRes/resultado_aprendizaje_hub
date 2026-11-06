import { Form, Button, Card, Icon } from 'semantic-ui-react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'
import { getErrorMessage } from '../../api/client'

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Ingresá un correo válido')
    .required('El correo es obligatorio'),
  password: Yup.string().required('La contraseña es obligatoria'),
})

export default function LoginPage() {
  const { auth, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (auth) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values)
      toast.success('Sesión iniciada')
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-auth-wrapper">
      <Card className="app-auth-card" fluid>
        <Card.Content>
          <div className="app-terminal-chrome" aria-hidden="true">
            <span />
            <span />
            <span />
            <span className="app-terminal-chrome-label">auth.terminal</span>
          </div>

          <div className="app-auth-body">
            <p className="app-auth-eyebrow">
              <span className="app-live-dot" aria-hidden="true" />
              ACCESO DE JUGADOR
            </p>
            <h2 className="ui header app-auth-title">
              <Icon name="sign-in" />
              Iniciar sesión
            </h2>
            <p className="app-auth-subtitle">
              Autenticá tu sesión y entrá al player hub para seguir tus récords.
            </p>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit: onSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={onSubmit} noValidate>
                  <Form.Input
                    id="email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    placeholder="tu@email.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.email && errors.email)}
                  />
                  {touched.email && errors.email && (
                    <div className="app-field-error">{errors.email}</div>
                  )}

                  <Form.Input
                    id="password"
                    name="password"
                    type="password"
                    label="Contraseña"
                    placeholder="Tu contraseña"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.password && errors.password)}
                  />
                  {touched.password && errors.password && (
                    <div className="app-field-error">{errors.password}</div>
                  )}

                  <Button
                    type="submit"
                    primary
                    fluid
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    <Icon name="sign-in" />
                    Ingresar
                  </Button>
                </Form>
              )}
            </Formik>

            <p className="app-auth-footer">
              ¿No tenés cuenta? <Link to="/register">Registrate</Link>
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
