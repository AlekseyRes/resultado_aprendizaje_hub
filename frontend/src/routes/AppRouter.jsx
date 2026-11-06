import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CommonLayout from '../layouts/CommonLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/common/HomePage'
import NotFoundPage from '../pages/common/NotFoundPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import DashboardPage from '../pages/client/DashboardPage'
import UsersPage from '../pages/admin/UsersPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CommonLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
