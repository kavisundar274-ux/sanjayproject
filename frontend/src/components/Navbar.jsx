import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/products', icon: '🛍️', label: 'Products' },
  { to: '/bill', icon: '🧾', label: 'Bill' }
];

export default function Navbar({ billItemsCount }) {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Electrical Shop</h1>
        <div className="flex space-x-4">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center space-x-1 ${isActive ? 'font-bold' : ''}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <div className="text-sm">Bill Items: {billItemsCount}</div>
      </div>
    </nav>
  );
}
      <div className="flex items-center gap-4">
        <img src="/ganesh.png.webp" alt="Logo" className="w-8 h-8 rounded-full" />
      </div>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-slate-100">
          <span className="text-lg">👤</span>
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
    </nav>
  );
}
