import './App.css'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import { ListingsPage } from './features/listings'
import ListingDetail from './features/listings/pages/ListingDetail'

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
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App



