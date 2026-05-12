import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBarChart, FiList, FiPlus, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import './DashboardLayout.css';

interface SidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: SidebarItem[] = [
    { label: 'Overview', path: '/dashboard/overview', icon: <FiBarChart /> },
    { label: 'My Listings', path: '/dashboard/listings', icon: <FiList /> },
    { label: 'Add Listing', path: '/dashboard/add-listing', icon: <FiPlus /> },
    { label: 'Messages', path: '/dashboard/messages', icon: <FiMessageSquare /> },
    { label: 'Bookings', path: '/dashboard/bookings', icon: <FiCheckCircle /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Host Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}
