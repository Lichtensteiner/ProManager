import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  CreditCard, Plus, Search, Filter, TrendingUp, 
  Calendar, Building2, Receipt, MoreVertical, 
  ExternalLink, CheckCircle2, Clock, AlertCircle,
  FileText, DollarSign, PieChart, Truck, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { Expense } from '../types';

export default function Expenses() {
  const { expenses, suppliers, projects, addExpense, updateExpense, addSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = expenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dépenses & Fournisseurs</h1>
          <p className="text-slate-500">Suivi des coûts et gestion des relations fournisseurs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Dépense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalAmount.toLocaleString()} FCFA</p>
          <p className="text-sm text-slate-500 mt-1">Dépenses cumulées</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">En attente</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{pendingAmount.toLocaleString()} FCFA</p>
          <p className="text-sm text-slate-500 mt-1">Factures non payées</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Payé</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{paidAmount.toLocaleString()} FCFA</p>
          <p className="text-sm text-slate-500 mt-1">Règlements effectués</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher une dépense..."
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
            <option value="PAID">Payé</option>
            <option value="PENDING">En attente</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Description</th>
                <th className="px-6 py-4 font-bold">Projet / Fournisseur</th>
                <th className="px-6 py-4 font-bold">Catégorie</th>
                <th className="px-6 py-4 font-bold">Montant</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => {
                const project = projects.find(p => p.id === expense.projectId);
                const supplier = suppliers.find(s => s.id === expense.supplierId);
                return (
                  <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{expense.description}</p>
                        <p className="text-xs text-slate-500">{format(new Date(expense.date), 'dd MMMM yyyy', { locale: fr })}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600">
                          <Building2 className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                          {project?.name || 'Frais Généraux'}
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                          <Truck className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                          {supplier?.name || 'Inconnu'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {expense.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        expense.status === 'PAID' ? "bg-emerald-50 text-emerald-600" :
                        expense.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {expense.status === 'PAID' ? 'Payé' : expense.status === 'PENDING' ? 'En attente' : 'Annulé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {expense.receiptUrl && (
                          <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Receipt className="w-5 h-5" />
                          </a>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <PieChart className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Aucune dépense enregistrée</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal Stub */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Nouvelle Dépense</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addExpense({
                projectId: formData.get('projectId') as string || undefined,
                supplierId: formData.get('supplierId') as string || undefined,
                description: formData.get('description') as string,
                amount: Number(formData.get('amount')),
                category: formData.get('category') as any,
                status: 'PENDING',
                receiptUrl: ''
              });
              setShowAddModal(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input name="description" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant (FCFA)</label>
                  <input name="amount" type="number" required className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select name="category" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="MATERIAL">Matériaux</option>
                    <option value="EQUIPMENT">Équipement</option>
                    <option value="LABOR">Main d'œuvre</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Projet</label>
                <select name="projectId" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Frais Généraux</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur</label>
                <select name="supplierId" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Inconnu / Particulier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
