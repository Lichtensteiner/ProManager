import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  AlertTriangle, CheckCircle2, Clock, Briefcase, Receipt, 
  TrendingUp, TrendingDown, Users, Package, Calendar as CalendarIcon,
  ArrowUpRight, ArrowDownRight, DollarSign, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  RadialBarChart, RadialBar
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { 
    projects, tasks, alerts, professionalInvoices, 
    expenses, stockItems, workers, clients 
  } = useData();
  const { user } = useAuth();

  // --- KPI Calculations ---
  const activeProjects = projects.filter(p => p.status !== 'TERMINE').length;
  const pendingTasks = tasks.filter(t => t.status === 'A_FAIRE' || t.status === 'EN_COURS').length;
  const tasksToValidate = tasks.filter(t => t.status === 'A_VALIDER').length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const financialStats = useMemo(() => {
    const totalInvoiced = professionalInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = professionalInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalRemaining = totalInvoiced - totalPaid;
    const netProfit = totalPaid - totalExpenses;
    return { totalInvoiced, totalPaid, totalRemaining, totalExpenses, netProfit };
  }, [professionalInvoices, expenses]);

  // --- Chart Data Preparation ---
  
  // 1 & 2 & 4 & 9: Monthly Revenue vs Expenses (Last 6 months)
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'MMM', { locale: fr });

      const revenue = professionalInvoices
        .filter(inv => {
          const d = parseISO(inv.issueDate);
          return isWithinInterval(d, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      const exp = expenses
        .filter(e => {
          const d = parseISO(e.date);
          return isWithinInterval(d, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const tasksDone = tasks.filter(t => {
        if (!t.updatedAt) return false;
        const d = parseISO(t.updatedAt);
        return t.status === 'TERMINE' && isWithinInterval(d, { start: monthStart, end: monthEnd });
      }).length;

      data.push({
        name: monthLabel,
        revenue: revenue / 1000, // in kFCFA
        expenses: exp / 1000,
        profit: (revenue - exp) / 1000,
        tasks: tasksDone
      });
    }
    return data;
  }, [professionalInvoices, expenses, tasks]);

  // 3: Project Status Distribution
  const projectStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.replace('_', ' '), 
      value 
    }));
  }, [projects]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  // 8: Overall Progress (Donut)
  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'TERMINE').length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const progressData = [
    { name: 'Progression', value: overallProgress, fill: '#3b82f6' }
  ];

  // 6: Dynamic Table (Recent Transactions)
  const recentTransactions = useMemo(() => {
    const combined = [
      ...professionalInvoices.map(inv => ({
        id: inv.id,
        type: 'Revenu',
        label: `Facture ${inv.number}`,
        amount: inv.totalAmount,
        date: inv.issueDate,
        status: inv.status
      })),
      ...expenses.map(exp => ({
        id: exp.id,
        type: 'Dépense',
        label: exp.description,
        amount: -exp.amount,
        date: exp.date,
        status: exp.status
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined.slice(0, 6);
  }, [professionalInvoices, expenses]);

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
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
            <p className="text-slate-500 mt-1 text-lg">Bienvenue, <span className="font-semibold text-slate-700">{user?.name}</span>. Voici l'état de votre entreprise.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5: KPI Cards (Enhanced) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trésorerie Nette</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{financialStats.netProfit.toLocaleString()} FCFA</p>
              <div className="flex items-center mt-2 text-emerald-600 text-xs font-bold">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+12.5% vs mois dernier</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shadow-inner">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full opacity-20" />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projets Actifs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeProjects}</p>
              <div className="flex items-center mt-2 text-blue-600 text-xs font-bold">
                <Activity className="w-4 h-4 mr-1" />
                <span>{projects.length} projets au total</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full opacity-20" />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main d'œuvre</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{workers.length}</p>
              <div className="flex items-center mt-2 text-indigo-600 text-xs font-bold">
                <Users className="w-4 h-4 mr-1" />
                <span>{workers.filter(w => w.status === 'ACTIVE').length} actifs aujourd'hui</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full opacity-20" />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Alertes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stockItems.filter(i => i.quantity <= i.minQuantity).length}</p>
              <div className="flex items-center mt-2 text-red-600 text-xs font-bold">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span>Besoin de réapprovisionnement</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-red-500 w-full opacity-20" />
        </motion.div>
      </motion.div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1 & 4: Bar + Area Chart (Financial Overview) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Financière</h2>
              <p className="text-sm text-slate-500">Revenus vs Dépenses (kFCFA)</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-600">Revenus</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs font-bold text-slate-600">Dépenses</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 8: Progress Donut (Overall Completion) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Progression Globale</h2>
          <p className="text-sm text-slate-500 mb-8">Tâches terminées sur l'ensemble des projets</p>
          <div className="relative w-full aspect-square max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" 
                barSize={20} data={progressData} startAngle={90} endAngle={450}
              >
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900">{overallProgress}%</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Terminé</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Tâches</p>
              <p className="text-xl font-bold text-slate-900">{tasks.length}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <p className="text-xs font-bold text-emerald-600 uppercase">Réussies</p>
              <p className="text-xl font-bold text-emerald-700">{tasks.filter(t => t.status === 'TERMINE').length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2 & 9: Composed Chart (Tasks vs Revenue) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Activité & Productivité</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenu (kFCFA)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="tasks" name="Tâches Terminées" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3: Pie Chart (Project Distribution) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Répartition des Projets</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 6: Dynamic Table (Recent Transactions) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-bottom border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transactions Récentes</h2>
            <Link to="/expenses" className="text-sm font-bold text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Désignation</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tx.type === 'Revenu' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{tx.label}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{format(parseISO(tx.date), 'dd MMM yyyy', { locale: fr })}</td>
                    <td className={`px-6 py-4 text-right font-black ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.amount.toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 7: Calendar / Timeline Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Échéances à venir</h2>
          <div className="space-y-6">
            {projects.filter(p => p.status !== 'TERMINE').slice(0, 4).map((p) => (
              <div key={p.id} className="relative pl-6 border-l-2 border-slate-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                  {format(parseISO(p.deadline), 'dd MMMM', { locale: fr })}
                </p>
                <p className="font-bold text-slate-800">{p.name}</p>
                <div className="flex items-center mt-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.random() * 60 + 20}%` }} // Mock progress for visual
                    />
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucune échéance prévue.</p>
              </div>
            )}
          </div>
          <Link to="/planning" className="mt-8 block text-center py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
            Ouvrir le planning complet
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
