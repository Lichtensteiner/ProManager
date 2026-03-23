import React from 'react';
import { useData } from '../context/DataContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function Alerts() {
  const { alerts, markAlertRead } = useData();

  const getAlertColorClass = (color: string) => {
    switch (color) {
      case 'noir': return 'bg-slate-900 text-white';
      case 'vert': return 'bg-emerald-500 text-white';
      case 'bleu': return 'bg-blue-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'jaune': return 'bg-yellow-400 text-slate-900';
      case 'rouge': return 'bg-red-600 text-white';
      default: return 'bg-slate-100 text-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alertes & Notifications</h1>
        <p className="text-slate-500">Système d'aide à la décision et suivi des échéances.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-0">
          <ul className="divide-y divide-slate-100">
            {alerts.map(alert => (
              <li key={alert.id} className={`p-4 flex items-start justify-between ${alert.read ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 w-4 h-4 rounded-full shrink-0 ${getAlertColorClass(alert.colorCode)}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{alert.type}</span>
                      <span className="text-xs text-slate-400">• {new Date(alert.date).toLocaleString()}</span>
                    </div>
                    <p className={`mt-1 ${alert.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>{alert.message}</p>
                  </div>
                </div>
                {!alert.read && (
                  <button 
                    onClick={() => markAlertRead(alert.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Marquer lu</span>
                  </button>
                )}
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="p-8 text-center text-slate-500">
                Aucune alerte pour le moment.
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Légende des codes couleurs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-slate-900"></div><span className="text-sm text-slate-600">Délai tâche proche</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm text-slate-600">Délai tâche dépassé</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm text-slate-600">Délai lot proche</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-sm text-slate-600">Délai lot dépassé</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div><span className="text-sm text-slate-600">Délai projet proche</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-600"></div><span className="text-sm text-slate-600">Délai projet dépassé</span></div>
        </div>
      </div>
    </div>
  );
}
