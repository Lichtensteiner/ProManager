import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Users, Plus, Search, Filter, UserPlus, 
  Calendar, Clock, CheckCircle2, XCircle, 
  MoreVertical, Phone, Briefcase, DollarSign,
  ClipboardCheck, UserCheck, UserX
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { AppWorker, Attendance } from '../types';

export default function HR() {
  const { workers, attendances, projects, addWorker, updateWorker, addAttendance } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<AppWorker | null>(null);

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeWorkers = workers.filter(w => w.status === 'ACTIVE').length;
  const todayAttendances = attendances.filter(a => isSameDay(new Date(a.date), new Date())).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RH & Pointage</h1>
          <p className="text-slate-500">Gestion du personnel de chantier et suivi des présences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddWorkerModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nouveau Travailleur</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Effectif</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{workers.length}</p>
          <p className="text-sm text-slate-500 mt-1">Ouvriers enregistrés</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Actifs</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeWorkers}</p>
          <p className="text-sm text-slate-500 mt-1">Ouvriers en activité</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Aujourd'hui</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{todayAttendances}</p>
          <p className="text-sm text-slate-500 mt-1">Présences pointées</p>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher un ouvrier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
          </select>
        </div>
      </div>

      {/* Workers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWorkers.map(worker => (
          <div key={worker.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{worker.name}</h3>
                  <p className="text-xs text-slate-500">{worker.specialty}</p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                worker.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
              )}>
                {worker.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-slate-600">
                <Phone className="w-4 h-4 mr-2 opacity-50" />
                {worker.phone}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <DollarSign className="w-4 h-4 mr-2 opacity-50" />
                {worker.dailyRate.toLocaleString()} FCFA / jour
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setSelectedWorker(worker); setShowAttendanceModal(true); }}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Pointer</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals Stubs */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Nouveau Travailleur</h2>
              <button onClick={() => setShowAddWorkerModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addWorker({
                name: formData.get('name') as string,
                specialty: formData.get('specialty') as string,
                phone: formData.get('phone') as string,
                dailyRate: Number(formData.get('dailyRate')),
                status: 'ACTIVE'
              });
              setShowAddWorkerModal(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                <input name="name" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Spécialité / Poste</label>
                <input name="specialty" required placeholder="ex: Maçon, Électricien" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input name="phone" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Taux Journalier (FCFA)</label>
                  <input name="dailyRate" type="number" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddWorkerModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttendanceModal && selectedWorker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Pointage Journalier</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addAttendance({
                workerId: selectedWorker.id,
                projectId: formData.get('projectId') as string,
                date: formData.get('date') as string,
                status: formData.get('status') as any,
                hoursWorked: Number(formData.get('hoursWorked'))
              });
              setShowAttendanceModal(false);
            }}>
              <p className="text-sm text-slate-500">Ouvrier : <span className="font-bold text-slate-900">{selectedWorker.name}</span></p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select name="status" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="PRESENT">Présent</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">En retard</option>
                    <option value="SICK">Malade</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Projet</label>
                <select name="projectId" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionner un projet</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Heures travaillées</label>
                <input name="hoursWorked" type="number" step="0.5" defaultValue="8" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAttendanceModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
