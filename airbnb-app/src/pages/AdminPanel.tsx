import { useEffect, useMemo, useState } from 'react'
import { FiActivity, FiAlertTriangle, FiDatabase, FiHome, FiRefreshCw, FiShield, FiTrash2, FiToggleLeft, FiUsers } from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { deleteAdminUser, getAdminMonthlyStats, getAdminOverview, getAdminUsers, setAdminUserStatus } from '../services/api'
import { useStore } from '../store/StoreContext'
import './AdminPanel.css'
import { useNavigate } from 'react-router-dom'

type AdminPage = 'overview' | 'users'

type AdminSummary = {
  totalUsers: number
  activeUsers: number
  disabledUsers: number
  totalHosts: number
  totalGuests: number
  totalListings: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  totalRevenue: number
}

type AdminUser = {
  id: string
  name: string
  email: string
  username: string
  phone?: string
  role: string
  isActive: boolean
  createdAt?: string
  _count?: { listings?: number; bookings?: number; reviews?: number }
}

type MonthlyData = {
  month: string
  users: number
  listings: number
  bookings: number
}

const initialSummary: AdminSummary = {
  totalUsers: 0,
  activeUsers: 0,
  disabledUsers: 0,
  totalHosts: 0,
  totalGuests: 0,
  totalListings: 0,
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0)

export default function AdminPanel() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<AdminPage>('overview')
  const [summary, setSummary] = useState<AdminSummary>(initialSummary)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= 2020; i--) {
      years.push(i)
    }
    return years
  }, [])

  const loadData = async (year?: number) => {
    setLoading(true)
    setError('')
    try {
      const yearToFetch = year ?? selectedYear
      const [overview, monthlyStats] = await Promise.all([
        getAdminOverview(),
        getAdminMonthlyStats(yearToFetch),
      ])

      setSummary({ ...initialSummary, ...(overview?.summary || {}) })
      setMonthlyData(Array.isArray(monthlyStats) ? monthlyStats : [])
      const adminUsers = await getAdminUsers()
      setUsers(Array.isArray(adminUsers) ? adminUsers : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (String(state.user?.role || '').toLowerCase() !== 'admin') {
      navigate('/login')
      return
    }

    void loadData()
  }, [navigate, state.user?.role])

  const handleToggleUser = async (user: AdminUser) => {
    setActionId(user.id)
    try {
      await setAdminUserStatus(user.id, !user.isActive)
      await loadData()
    } catch (err: any) {
      setError(err?.message || 'Unable to update user status')
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete ${user.name || user.email}? This cannot be undone.`)) {
      return
    }

    setActionId(user.id)
    try {
      await deleteAdminUser(user.id)
      await loadData()
    } catch (err: any) {
      setError(err?.message || 'Unable to delete user')
    } finally {
      setActionId(null)
    }
  }

  const statusBreakdown = useMemo(() => [
    { label: 'Users', value: summary.totalUsers, icon: <FiUsers /> },
    { label: 'Active users', value: summary.activeUsers, icon: <FiShield /> },
    { label: 'Listings', value: summary.totalListings, icon: <FiHome /> },
    { label: 'Bookings', value: summary.totalBookings, icon: <FiDatabase /> },
    { label: 'Confirmed', value: summary.confirmedBookings, icon: <FiActivity /> },
    { label: 'Revenue', value: formatCurrency(summary.totalRevenue), icon: <FiRefreshCw /> },
  ], [summary])

  const renderOverviewPage = () => (
    <>
      <header className="admin-hero">
        <div>
          <p className="admin-hero__eyebrow">System Overview</p>
          <h1 className="admin-hero__title">Dashboard</h1>
          <p className="admin-hero__text">
            Monitor the overall health of the platform at a glance.
          </p>
        </div>

        <div className="admin-hero__meta">
          <button type="button" className="admin-refresh" onClick={() => void loadData()} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </header>

      {error ? <div className="admin-alert"><FiAlertTriangle /> {error}</div> : null}

      <div className="admin-stats">
        {statusBreakdown.map((item) => (
          <article key={item.label} className="admin-stat-card">
            <div className="admin-stat-card__icon">{item.icon}</div>
            <div>
              <p className="admin-stat-card__label">{item.label}</p>
              <strong className="admin-stat-card__value">{item.value}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="admin-insights">
        <article className="admin-insight-card">
          <span>Total hosts</span>
          <strong>{summary.totalHosts}</strong>
        </article>
        <article className="admin-insight-card">
          <span>Total guests</span>
          <strong>{summary.totalGuests}</strong>
        </article>
        <article className="admin-insight-card">
          <span>Pending bookings</span>
          <strong>{summary.pendingBookings}</strong>
        </article>
        <article className="admin-insight-card">
          <span>Cancelled bookings</span>
          <strong>{summary.cancelledBookings}</strong>
        </article>
      </div>

      <section className="admin-panel admin-panel--full">
        <div className="admin-panel__head">
          <div>
            <p className="admin-panel__kicker">Monthly Trends</p>
            <h2>Activity over time</h2>
          </div>
          <div className="admin-year-selector">
            <label htmlFor="year-select" style={{ fontSize: '0.9rem', color: '#6b7280', marginRight: '8px' }}>Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => {
                const year = parseInt(e.target.value, 10)
                setSelectedYear(year)
                void loadData(year)
              }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(31, 41, 55, 0.1)',
                backgroundColor: '#fff',
                color: '#111827',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading chart...</div>
        ) : monthlyData.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No data available</div>
        ) : (
          <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31, 41, 55, 0.1)" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(31, 41, 55, 0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#ff5a5f" 
                  strokeWidth={2}
                  dot={{ fill: '#ff5a5f', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="New Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="listings" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  dot={{ fill: '#0d9488', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="New Listings"
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="New Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </>
  )

  const renderUserManagementPage = () => (
    <>
      <header className="admin-hero">
        <div>
          <p className="admin-hero__eyebrow">User Management</p>
          <h1 className="admin-hero__title">Manage Accounts</h1>
          <p className="admin-hero__text">
            Control user access, disable or delete accounts, and monitor user activity.
          </p>
        </div>

        <div className="admin-hero__meta">
          <span className="admin-pill"><FiUsers /> {users.length} accounts</span>
          <button type="button" className="admin-refresh" onClick={() => void loadData()} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </header>

      {error ? <div className="admin-alert"><FiAlertTriangle /> {error}</div> : null}

      <section className="admin-panel admin-panel--full">
        <div className="admin-panel__head">
          <div>
            <p className="admin-panel__kicker">Users</p>
            <h2>Platform accounts</h2>
          </div>
          <span className="admin-panel__count">{users.length} accounts</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}>Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5}>No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <div className="admin-table__sub">{user.email}</div>
                  </td>
                  <td>{String(user.role).toUpperCase()}</td>
                  <td>
                    <span className={`admin-badge ${user.isActive ? 'is-active' : 'is-disabled'}`}>
                      {user.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    Listings {user._count?.listings || 0} · Bookings {user._count?.bookings || 0}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" onClick={() => void handleToggleUser(user)} disabled={actionId === user.id}>
                        <FiToggleLeft /> {user.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button type="button" className="is-danger" onClick={() => void handleDeleteUser(user)} disabled={actionId === user.id}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )

  return (
    <section className="admin-page" aria-label="Admin dashboard">
      <div className="admin-layout">
        {/* Side Navigation */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__header">
            <div className="admin-sidebar__branding">
              <span className="admin-sidebar__brand-main">Admin</span>
              <span className="admin-sidebar__brand-accent">Control</span>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            <button
              type="button"
              className={`admin-nav-item ${currentPage === 'overview' ? 'is-active' : ''}`}
              onClick={() => setCurrentPage('overview')}
            >
              <FiActivity /> Overview
            </button>
            <button
              type="button"
              className={`admin-nav-item ${currentPage === 'users' ? 'is-active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              <FiUsers /> User Management
            </button>
          </nav>

          <div className="admin-sidebar__footer">
            <div className="admin-sidebar__user">
              <div className="admin-sidebar__avatar">
                <FiShield />
              </div>
              <div>
                <p className="admin-sidebar__name">{state.user?.name || 'Admin'}</p>
                <p className="admin-sidebar__email">{state.user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {currentPage === 'overview' ? renderOverviewPage() : renderUserManagementPage()}
        </main>
      </div>
    </section>
  )
}
