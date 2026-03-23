import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  LayoutDashboard, Briefcase, FileText, Receipt, 
  MessageSquare, Bell, ExternalLink, Download,
  CheckCircle2, Clock, AlertCircle, User,
  ArrowRight, ShieldCheck, Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function ClientPortal() {
  const { clients, projects, invoices, quotes } = useData();
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

  const client = clients.find(c => c.id === selectedClientId);
  const clientProjects = projects.filter(p => p.clientId === selectedClientId);
  const clientInvoices = invoices.filter(i => i.clientId === selectedClientId);
  const clientQuotes = quotes.filter(q => q.clientId === selectedClientId);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Globe className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Sélectionnez un client pour voir son portail</p>
        <select 
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="mt-4 bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900"
        >
          <option value="">Choisir un client...</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Portal Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Espace Client Sécurisé</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Bienvenue, {client.name}</h1>
              <p className="text-slate-400 max-w-xl">
                Suivez l'avancement de vos chantiers, consultez vos documents et gérez vos factures en temps réel.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Dernière connexion</p>
                <p className="text-sm font-medium">Aujourd'hui, 14:30</p>
              </div>
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <User className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Projets Actifs</p>
          <p className="text-2xl font-bold text-slate-900">{clientProjects.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Devis à valider</p>
          <p className="text-2xl font-bold text-amber-600">{clientQuotes.filter(q => q.status === 'SENT').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Factures en attente</p>
          <p className="text-2xl font-bold text-red-500">{clientInvoices.filter(i => i.status === 'UNPAID').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Facturé</p>
          <p className="text-2xl font-bold text-slate-900">{clientInvoices.reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()} FCFA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Vos Chantiers en cours
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {clientProjects.map(project => (
              <div key={project.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.location}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {project.status === 'IN_PROGRESS' ? 'En cours' : project.status}
                  </span>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500 uppercase tracking-wider">Progression globale</span>
                    <span className="text-blue-600">65%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      +2
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all">
                    Voir les détails <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Documents & Invoices */}
        <div className="space-y-8">
          {/* Recent Documents */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Documents Récents
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Plan_Etage_{i}.pdf</p>
                      <p className="text-[10px] text-slate-500">Ajouté le 12 Mars 2024</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
              Voir tous les documents
            </button>
          </div>

          {/* Pending Invoices */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Facturation
            </h2>
            <div className="space-y-4">
              {clientInvoices.slice(0, 3).map(invoice => (
                <div key={invoice.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-slate-900">Facture #{invoice.number}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase",
                      invoice.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {invoice.status === 'PAID' ? 'Payée' : 'En attente'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-bold text-slate-900">{invoice.totalAmount.toLocaleString()} FCFA</p>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Détails</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
              Accéder à l'historique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
