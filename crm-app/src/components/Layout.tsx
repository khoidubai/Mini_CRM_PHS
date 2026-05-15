import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Users, Headphones, UserCircle, LayoutDashboard, Settings, UsersRound, Target, BarChart3, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = getNavItems(user?.role || 'sa')

  function isActive(path: string) {
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-52 lg:w-60'} bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 transition-all duration-200`}>
        {/* Header */}
        <div className={`border-b border-gray-200 flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between p-4'}`}>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-blue-700 truncate">PHS Mini CRM</h1>
              {user?.full_name && <p className="text-xs font-medium text-gray-800 truncate mt-0.5">{user.full_name}</p>}
              <p className="text-[11px] text-gray-500 truncate">
                <span className="uppercase font-semibold text-blue-600">{user?.role}</span>
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className={`flex-1 py-3 space-y-0.5 ${collapsed ? 'px-1.5' : 'px-3'} overflow-y-auto`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className={`border-t border-gray-200 ${collapsed ? 'p-1.5' : 'p-3'}`}>
          <button
            onClick={signOut}
            title={collapsed ? 'Đăng xuất' : undefined}
            className={`flex items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors ${
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut size={18} />
            {!collapsed && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${collapsed ? 'ml-14' : 'ml-52 lg:ml-60'} p-4 lg:p-6 min-w-0 transition-all duration-200`}>
        <Outlet />
      </main>
    </div>
  )
}

function getNavItems(role: string) {
  const items = []

  if (role === 'sa' || role === 'sup' || role === 'admin') {
    items.push({
      path: '/sa',
      label: 'Sale System',
      icon: <Users size={18} />,
    })
  }

  if (role === 'sa' || role === 'sup') {
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
