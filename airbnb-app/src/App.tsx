import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AddListing from './pages/AddListing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import GuestDashboard from './pages/GuestDashboard'
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

function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="/guest/bookings" element={<GuestDashboard />} />

          {/* Host Dashboard Routes */}
          <Route
            path="/dashboard/add-listing"
            element={
              <DashboardLayout>
                <AddListing />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/overview"
            element={
              <DashboardLayout>
                <OverviewPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/listings"
            element={
              <DashboardLayout>
                <MyListingsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/add-listing-new"
            element={
              <DashboardLayout>
                <AddListingPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/messages"
            element={
              <DashboardLayout>
                <MessagesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/bookings"
            element={
              <DashboardLayout>
                <BookingsPage />
              </DashboardLayout>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App



