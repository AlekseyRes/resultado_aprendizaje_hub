import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Dimmer,
  Form,
  Header,
  Icon,
  Input,
  Label,
  Loader,
  Message,
  Modal,
  Table,
} from 'semantic-ui-react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'
import { getErrorMessage } from '../../api/client'
import { createUser, deleteUser, listUsers, updateUser } from '../../api/users'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const EMPTY_FORM = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: '',
  is_active: true,
  is_staff: false,
}

const FORM_FIELDS = [
  'email',
  'first_name',
  'last_name',
  'password',
  'password_confirm',
  'is_active',
  'is_staff',
]

function getInitialValues(user) {
  if (!user) return { ...EMPTY_FORM }

  return {
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    password: '',
    password_confirm: '',
    is_active: Boolean(user.is_active),
    is_staff: Boolean(user.is_staff),
  }
}

function buildValidationSchema(isEdit) {
  const passwordField = isEdit
    ? Yup.string()
        .test(
          'password-min',
          'Debe tener al menos 8 caracteres',
          (value) => !value || value.length >= 8,
        )
        .test(
          'password-strength',
          'Debe incluir mayúscula, minúscula, número y carácter especial',
          (value) => !value || PASSWORD_REGEX.test(value),
        )
    : Yup.string()
        .required('La contraseña es obligatoria')
        .min(8, 'Debe tener al menos 8 caracteres')
        .matches(PASSWORD_REGEX, {
          message:
            'Debe incluir mayúscula, minúscula, número y carácter especial',
        })

  const confirmField = isEdit
    ? Yup.string().test(
        'password-confirm',
        'Las contraseñas no coinciden',
        function (value) {
          const { password } = this.parent
          if (!value && !password) return true
          return value === password
        },
      )
    : Yup.string()
        .required('Confirmá la contraseña')
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')

  return Yup.object({
    email: Yup.string()
      .trim()
      .email('Ingresá un correo válido')
      .required('El correo es obligatorio'),
    first_name: Yup.string().trim().required('El nombre es obligatorio'),
    last_name: Yup.string().trim().required('El apellido es obligatorio'),
    password: passwordField,
    password_confirm: confirmField,
    is_active: Yup.boolean(),
    is_staff: Yup.boolean(),
  })
}

function mapServerErrors(data) {
  if (!data || typeof data !== 'object') return null

  const fieldErrors = {}
  FORM_FIELDS.forEach((field) => {
    const value = data[field]
    if (Array.isArray(value) && value.length) {
      fieldErrors[field] = String(value[0])
    } else if (typeof value === 'string' && value) {
      fieldErrors[field] = value
    }
  })

  return Object.keys(fieldErrors).length ? fieldErrors : null
}

export default function UsersPage() {
  const { auth } = useAuth()
  const isStaff = Boolean(auth?.is_staff)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isStaff) return undefined

    let cancelled = false

    async function loadUsers() {
      try {
        const data = await listUsers()
        if (cancelled) return
        setUsers(Array.isArray(data) ? data : [])
        setError('')
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [isStaff])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) =>
      [user.email, user.first_name, user.last_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [users, search])

  const isEditing = Boolean(editingUser)
  const validationSchema = useMemo(
    () => buildValidationSchema(isEditing),
    [isEditing],
  )
  const initialValues = useMemo(
    () => getInitialValues(editingUser),
    [editingUser],
  )

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const closeFormModal = () => {
    setFormOpen(false)
    setEditingUser(null)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setDeleteTarget(null)
  }

  const handleSubmit = async (values, { setErrors, setSubmitting }) => {
    const isEdit = Boolean(editingUser)
    const payload = {
      email: values.email.trim(),
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      is_active: Boolean(values.is_active),
      is_staff: Boolean(values.is_staff),
    }

    if (values.password) {
      payload.password = values.password
    }

    try {
      if (isEdit) {
        await updateUser(editingUser.id, payload)
        toast.success('Usuario actualizado correctamente.')
      } else {
        await createUser(payload)
        toast.success('Usuario creado correctamente.')
      }
      closeFormModal()
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
      const fieldErrors = mapServerErrors(err.data)
      if (fieldErrors) {
        setErrors(fieldErrors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      toast.success('Usuario eliminado correctamente.')
      setDeleteTarget(null)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const totalLabel = `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}`

  return (
    <div className="app-users">
      <div className="app-users-header">
        <div>
          <Header as="h1" className="app-users-title">
            Gestión de usuarios
            <span className="app-users-count">{totalLabel}</span>
          </Header>
          <p className="app-users-subtitle">
            Administrá las cuentas registradas, sus roles y su estado.
          </p>
        </div>
        <Button primary onClick={openCreateModal}>
          <Icon name="user plus" />
          Nuevo usuario
        </Button>
      </div>

      <div className="app-users-toolbar">
        <Input
          icon="search"
          placeholder="Buscar por correo, nombre o apellido"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="app-users-search"
        />
      </div>

      {error && (
        <Message negative className="app-users-message">
          <Message.Header>No se pudieron cargar los usuarios</Message.Header>
          <p>{error}</p>
          <Button color="red" onClick={reload}>
            <Icon name="redo" />
            Reintentar
          </Button>
        </Message>
      )}

      {!error && (
        <div className="app-table-wrapper">
          <Dimmer.Dimmable dimmed={loading}>
            <Dimmer active={loading} inverted>
              <Loader>Cargando usuarios...</Loader>
            </Dimmer>

            <Table celled striped selectable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Nombre</Table.HeaderCell>
                  <Table.HeaderCell>Apellido</Table.HeaderCell>
                  <Table.HeaderCell>Rol</Table.HeaderCell>
                  <Table.HeaderCell>Estado</Table.HeaderCell>
                  <Table.HeaderCell>Acciones</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {filteredUsers.map((user) => {
                  const isSelf = user.id === auth.id
                  return (
                    <Table.Row key={user.id}>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{user.first_name}</Table.Cell>
                      <Table.Cell>{user.last_name}</Table.Cell>
                      <Table.Cell>
                        <Label color={user.is_staff ? 'blue' : 'grey'}>
                          {user.is_staff ? 'Administrador' : 'Usuario'}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>
                        <Label color={user.is_active ? 'green' : 'grey'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="app-users-actions">
                          <Button
                            icon
                            basic
                            color="blue"
                            title="Editar usuario"
                            onClick={() => openEditModal(user)}
                          >
                            <Icon name="edit" />
                          </Button>
                          {isSelf ? (
                            <span
                              className="app-users-action-disabled"
                              title="No podés eliminar tu propia cuenta"
                            >
                              <Button icon basic color="red" disabled>
                                <Icon name="trash" />
                              </Button>
                            </span>
                          ) : (
                            <Button
                              icon
                              basic
                              color="red"
                              title="Eliminar usuario"
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Icon name="trash" />
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>

            {!loading && filteredUsers.length === 0 && (
              <Message info className="app-users-message">
                <Icon name="users" />
                {users.length === 0
                  ? 'Todavía no hay usuarios registrados.'
                  : 'No se encontraron usuarios que coincidan con la búsqueda.'}
              </Message>
            )}
          </Dimmer.Dimmable>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeFormModal}
        size="small"
        closeIcon
        className="app-users-modal"
      >
        <Formik
          key={editingUser ? `edit-${editingUser.id}` : 'create'}
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            handleChange,
            handleBlur,
            handleSubmit: onSubmit,
            setFieldValue,
            isSubmitting,
          }) => (
            <>
              <Modal.Header>
                {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
              </Modal.Header>
              <Modal.Content>
                <Form id="app-user-form" onSubmit={onSubmit} noValidate>
                  <Form.Input
                    id="email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    placeholder="usuario@email.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <div className="app-field-error">{errors.email}</div>
                  )}

                  <Form.Group widths="equal">
                    <Form.Input
                      id="first_name"
                      name="first_name"
                      label="Nombre"
                      placeholder="Nombre"
                      value={values.first_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.first_name)}
                    />
                    <Form.Input
                      id="last_name"
                      name="last_name"
                      label="Apellido"
                      placeholder="Apellido"
                      value={values.last_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.last_name)}
                    />
                  </Form.Group>
                  {errors.first_name && (
                    <div className="app-field-error">{errors.first_name}</div>
                  )}
                  {errors.last_name && (
                    <div className="app-field-error">{errors.last_name}</div>
                  )}

                  <Form.Group widths="equal">
                    <Form.Input
                      id="password"
                      name="password"
                      type="password"
                      label="Contraseña"
                      placeholder={
                        isEditing
                          ? 'Dejar en blanco para conservar'
                          : 'Mínimo 8 caracteres'
                      }
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.password)}
                    />
                    <Form.Input
                      id="password_confirm"
                      name="password_confirm"
                      type="password"
                      label="Confirmar contraseña"
                      placeholder="Repetí la contraseña"
                      value={values.password_confirm}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.password_confirm)}
                    />
                  </Form.Group>
                  {errors.password && (
                    <div className="app-field-error">{errors.password}</div>
                  )}
                  {errors.password_confirm && (
                    <div className="app-field-error">
                      {errors.password_confirm}
                    </div>
                  )}

                  <Form.Field>
                    <Checkbox
                      name="is_active"
                      label="Cuenta activa"
                      checked={values.is_active}
                      onChange={(event, data) =>
                        setFieldValue('is_active', data.checked)
                      }
                    />
                  </Form.Field>

                  <Form.Field>
                    <Checkbox
                      name="is_staff"
                      label="Administrador (acceso al panel de staff)"
                      checked={values.is_staff}
                      onChange={(event, data) =>
                        setFieldValue('is_staff', data.checked)
                      }
                    />
                  </Form.Field>
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="app-user-form"
                  primary
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isEditing ? 'Guardar cambios' : 'Crear usuario'}
                </Button>
              </Modal.Actions>
            </>
          )}
        </Formik>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        size="tiny"
        className="app-users-modal"
      >
        <Modal.Header>Eliminar usuario</Modal.Header>
        <Modal.Content>
          <p>
            ¿Confirmás que querés eliminar la cuenta{' '}
            <strong>{deleteTarget?.email}</strong>? Esta acción no se puede
            deshacer.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={closeDeleteModal} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            negative
            loading={deleting}
            disabled={deleting}
            onClick={handleDelete}
          >
            <Icon name="trash" />
            Eliminar
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  )
}
