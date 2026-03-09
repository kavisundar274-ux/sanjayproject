import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/products', icon: '🛍️', label: 'Products' },
  { to: '/bill', icon: '🧾', label: 'Bill' },
  { to: '/daily-report', icon: '📊', label: 'Daily Report' },
  { to: '/reports', icon: '📈', label: 'Monthly Report' }
];

export default function Navbar({ billItemsCount, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4">
      <div className="flex justify-around items-center">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex flex-col items-center space-y-1 text-xs ${isActive ? 'font-bold' : ''}`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="text-xs">Items: {billItemsCount}</div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="flex flex-col items-center space-y-1 text-xs">
            <span className="text-lg">👤</span>
            <span>User</span>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b text-sm">
                  <div className="font-medium truncate">{user?.name || user?.email}</div>
                  <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                </div>
                <button onClick={() => { onLogout(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
