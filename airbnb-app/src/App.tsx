import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AddListing from './pages/AddListing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import GuestDashboard from './pages/GuestDashboard'
import AdminPanel from './pages/AdminPanel'
import ProtectedRoute from './components/ProtectedRoute'
import { ListingsPage } from './features/listings'
import ListingDetail from './features/listings/pages/ListingDetail'
import {
  DashboardLayout,
  OverviewPage,
  MyListingsPage,
  AddListingPage,
  BookingsPage,
  MessagesPage
} from './pages/HostDashboard'
import ChatWidget from './components/ChatWidget'

function App() {
  const location = useLocation()
  const showFooter = ['/', '/listings', '/signup'].includes(location.pathname)
  const hideShellForAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />

          {/* Guest only */}
          <Route path="/guest/bookings" element={<ProtectedRoute allowedRole="guest"><GuestDashboard /></ProtectedRoute>} />

          {/* Host only */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="/dashboard/overview" element={<ProtectedRoute allowedRole="host"><DashboardLayout><OverviewPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/listings" element={<ProtectedRoute allowedRole="host"><DashboardLayout><MyListingsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/add-listing" element={<ProtectedRoute allowedRole="host"><DashboardLayout><AddListing /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/add-listing-new" element={<ProtectedRoute allowedRole="host"><DashboardLayout><AddListingPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/messages" element={<ProtectedRoute allowedRole="host"><DashboardLayout><MessagesPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute allowedRole="host"><DashboardLayout><BookingsPage /></DashboardLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminPanel /></ProtectedRoute>} />
        </Routes>
      </main>
      {!hideShellForAdmin && showFooter && <Footer />}
      <ChatWidget />
    </div>
  )
}

export default App



