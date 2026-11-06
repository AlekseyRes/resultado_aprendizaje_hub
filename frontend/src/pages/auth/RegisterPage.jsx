import { Form, Button, Card, Icon } from 'semantic-ui-react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'
import { registerApi } from '../../api/auth'
import { getErrorMessage } from '../../api/client'

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const initialValues = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
}

const validationSchema = Yup.object({
  first_name: Yup.string().trim().required('El nombre es obligatorio'),
  last_name: Yup.string().trim().required('El apellido es obligatorio'),
  email: Yup.string()
    .trim()
    .email('Ingresá un correo válido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
    .min(8, 'Debe tener al menos 8 caracteres')
    .matches(PASSWORD_REGEX, {
      message:
        'Debe incluir mayúscula, minúscula, número y carácter especial',
    }),
  password_confirm: Yup.string()
    .required('Confirmá la contraseña')
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
})

function mapServerErrors(data) {
  if (!data || typeof data !== 'object') return null

  const fieldErrors = {}
  Object.keys(initialValues).forEach((field) => {
    const value = data[field]
    if (Array.isArray(value) && value.length) {
      fieldErrors[field] = String(value[0])
    } else if (typeof value === 'string' && value) {
      fieldErrors[field] = value
    }
  })

  return Object.keys(fieldErrors).length ? fieldErrors : null
}

export default function RegisterPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()

  if (auth) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await registerApi(values)
      toast.success('Usuario registrado. Ya podés iniciar sesión.')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error))
      const fieldErrors = mapServerErrors(error.data)
      if (fieldErrors) {
        setErrors(fieldErrors)
      }
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
            <span className="app-terminal-chrome-label">register.terminal</span>
          </div>

          <div className="app-auth-body">
            <p className="app-auth-eyebrow">
              <span className="app-live-dot" aria-hidden="true" />
              NUEVO JUGADOR
            </p>
            <h2 className="ui header app-auth-title">
              <Icon name="user plus" />
              Crear cuenta
            </h2>
            <p className="app-auth-subtitle">
              Completá tus datos para registrarte y desbloquear tu player hub.
            </p>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              enableReinitialize={false}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                handleChange,
                handleBlur,
                handleSubmit: onSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={onSubmit} noValidate>
                  <Form.Input
                    id="first_name"
                    name="first_name"
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={values.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.first_name)}
                  />
                  {errors.first_name && (
                    <div className="app-field-error">{errors.first_name}</div>
                  )}

                  <Form.Input
                    id="last_name"
                    name="last_name"
                    label="Apellido"
                    placeholder="Tu apellido"
                    value={values.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.last_name)}
                  />
                  {errors.last_name && (
                    <div className="app-field-error">{errors.last_name}</div>
                  )}

                  <Form.Input
                    id="email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    placeholder="tu@email.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <div className="app-field-error">{errors.email}</div>
                  )}

                  <Form.Input
                    id="password"
                    name="password"
                    type="password"
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.password)}
                  />
                  {errors.password && (
                    <div className="app-field-error">{errors.password}</div>
                  )}

                  <Form.Input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    label="Confirmar contraseña"
                    placeholder="Repetí tu contraseña"
                    value={values.password_confirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.password_confirm)}
                  />
                  {errors.password_confirm && (
                    <div className="app-field-error">
                      {errors.password_confirm}
                    </div>
                  )}

                  <Button
                    type="submit"
                    primary
                    fluid
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    <Icon name="user plus" />
                    Registrarme
                  </Button>
                </Form>
              )}
            </Formik>

            <p className="app-auth-footer">
              ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
