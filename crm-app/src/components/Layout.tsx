import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Users, Headphones, UserCircle, LayoutDashboard, Settings, UsersRound, Target, BarChart3, AlertTriangle } from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navItems = getNavItems(user?.role || 'sa')

  function isActive(path: string) {
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-700">PHS Mini CRM</h1>
          {user?.full_name && <p className="text-sm font-medium text-gray-800 mt-1">{user.full_name}</p>}
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.email} — <span className="uppercase font-semibold text-blue-600">{user?.role}</span>
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  )
}

function getNavItems(role: string) {
  const items = []

  if (role === 'sa' || role === 'admin') {
    items.push({
      path: '/sa',
      label: 'Sale System',
      icon: <Users size={18} />,
    })
  }

  if (role === 'sa') {
    items.push({
      path: '/kpi',
      label: 'KPI cá nhân',
      icon: <Target size={18} />,
    })
  }

  if (role === 'ccc' || role === 'admin') {
    items.push({
      path: '/crm',
      label: 'CRM Tickets',
      icon: <Headphones size={18} />,
    })
  }

  if (role === 'admin') {
    items.push({
      path: '/customer360',
      label: 'Customer 360',
      icon: <UserCircle size={18} />,
    })
    items.push({
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    })
    items.push({
      path: '/users',
      label: 'Quản lý NV',
      icon: <UsersRound size={18} />,
    })
    items.push({
      path: '/kpi-admin',
      label: 'KPI Admin',
      icon: <BarChart3 size={18} />,
    })
    items.push({
      path: '/error-report',
      label: 'Báo cáo Lỗi',
      icon: <AlertTriangle size={18} />,
    })
  }

  // Profile accessible by all
  items.push({
    path: '/profile',
    label: 'Hồ sơ cá nhân',
    icon: <Settings size={18} />,
  })

  return items
}
