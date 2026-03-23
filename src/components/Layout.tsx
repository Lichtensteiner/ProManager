import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LayoutDashboard, Briefcase, Users, Bell, LogOut, HardHat, DatabaseZap, User, Sparkles, Receipt, Menu, X, Mail, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './Auth';

export default function Layout() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { alerts, dbError, isLoading: dataLoading } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const unreadAlerts = alerts.filter(a => !a.read).length;

  const isPublicRoute = location.pathname === '/ai-architect';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    return <Auth />;
  }

  const navItems = [
    { name: 'Tableau de bord', path: '/', icon: LayoutDashboard, hidden: !user },
    { name: 'Architecte IA', path: '/ai-architect', icon: Sparkles },
    { name: 'Projets', path: '/projects', icon: Briefcase, hidden: !user },
    { name: 'Clients', path: '/clients', icon: Users, hidden: !user },
    { name: 'Facturation', path: '/billing', icon: Receipt, hidden: !user },
    { name: 'Alertes', path: '/alerts', icon: Bell, badge: unreadAlerts, hidden: !user },
    { name: 'Mon Profil', path: '/profile', icon: User, hidden: !user },
  ];

  const filteredNavItems = navItems.filter(item => !item.hidden);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProManager</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {user && (
          <div className="px-6 py-5 border-b border-slate-800/50 bg-slate-800/20">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Connecté en tant que</p>
            <p className="font-medium truncate text-slate-100">{user.name}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-blue-400 font-medium">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200",
                  isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="flex items-center space-x-3 text-slate-400 hover:text-white w-full px-3 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ProManager</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto relative flex flex-col">
          {dbError && (
            <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
              <div className="flex items-center space-x-3">
                <DatabaseZap className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">{dbError}</span>
              </div>
              <a href="/supabase-schema.sql" target="_blank" className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors whitespace-nowrap ml-2">
                Voir SQL
              </a>
            </div>
          )}
          
          <div className="flex-1">
            {dataLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-8 mt-auto">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <HardHat className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900">ProManager</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Solution complète de gestion de chantiers BTP au Gabon. Optimisez vos ressources et suivez vos projets avec précision.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Partenaire Technique</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-blue-600">Ludo_consulting</p>
                    <p className="text-sm text-slate-600">Dev_Web Ludovic</p>
                    <p className="text-xs text-slate-500 italic">Spécialiste en programmation informatique & Ingénieur en technologies innovantes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact & Support</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>ludo.consulting3@gmail.com</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>062641120</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <DatabaseZap className="w-4 h-4 text-slate-400" />
                      <span>Libreville, Gabon</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400">
                  © {new Date().getFullYear()} ProManager. Tous droits réservés.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-medium text-slate-400">Propulsé par Ludo_consulting</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
