import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle2, Clock, Briefcase, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { projects, tasks, alerts, professionalInvoices } = useData();
  const { user } = useAuth();

  const activeProjects = projects.filter(p => p.status !== 'TERMINE').length;
  const pendingTasks = tasks.filter(t => t.status === 'A_FAIRE' || t.status === 'EN_COURS').length;
  const tasksToValidate = tasks.filter(t => t.status === 'A_VALIDER').length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const financialStats = React.useMemo(() => {
    if (!professionalInvoices) return { totalInvoiced: 0, totalPaid: 0, totalRemaining: 0 };
    const totalInvoiced = professionalInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = professionalInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalRemaining = totalInvoiced - totalPaid;
    return { totalInvoiced, totalPaid, totalRemaining };
  }, [professionalInvoices]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
        <p className="text-slate-500 mt-2 text-lg">Bienvenue, <span className="font-semibold text-slate-700">{user?.name}</span>. Voici le résumé de vos activités.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Facturé</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{financialStats.totalInvoiced.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-inner">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Encaissé</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{financialStats.totalPaid.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">À Percevoir</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{financialStats.totalRemaining.toLocaleString()} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shadow-inner">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Projets Actifs</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{activeProjects}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tâches en cours</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{pendingTasks}</p>
            </div>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Clock className="w-7 h-7 text-indigo-600" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">À Valider</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{tasksToValidate}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Alertes</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{unreadAlerts}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Alertes Récentes</h2>
            <Link to="/alerts" className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full transition-colors">Voir tout</Link>
          </div>
          <div className="space-y-4 flex-1">
            {alerts.slice(0, 5).map((alert, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
                key={alert.id} className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 shadow-sm ${getAlertColorClass(alert.colorCode)}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{alert.message}</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
            {alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400 opacity-50" />
                <p className="text-sm font-medium">Aucune alerte pour le moment.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Projets Récents</h2>
            <Link to="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full transition-colors">Voir tout</Link>
          </div>
          <div className="space-y-4 flex-1">
            {projects.slice(0, 5).map((project, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                key={project.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div>
                  <Link to={`/projects/${project.id}`} className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">
                    {project.name}
                  </Link>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{project.type}</span>
                    <span className="text-xs font-medium text-slate-400">Échéance: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    project.status === 'TERMINE' ? 'bg-emerald-100 text-emerald-800' :
                    project.status === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                <Briefcase className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-sm font-medium">Aucun projet trouvé.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
