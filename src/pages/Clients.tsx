import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, Eye, MapPin, Briefcase, FileText, Receipt, User } from 'lucide-react';
import { Client, Project, Quote, ProfessionalInvoice } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { projects, quotes, professionalInvoices } = useData();

  const canManageClient = user?.role === 'SECRETARY' || user?.role === 'ADMIN';

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({ name: '', contact: '', email: '', address: '', isAccountClient: false });

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name, contact: client.contact, email: client.email, address: client.address || '', isAccountClient: client.isAccountClient || false });
    } else {
      setEditingClient(null);
      setFormData({ name: '', contact: '', email: '', address: '', isAccountClient: false });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">Gérez votre base de données clients.</p>
        </div>
        {canManageClient && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Client</span>
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher un client..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Nom de l'entreprise</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Contact Principal</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Email</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Adresse</th>
                <th className="px-6 py-3 font-medium text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {client.name}
                    {client.isAccountClient && (
                      <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">En Compte</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{client.contact}</td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{client.email}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={client.address}>
                    {client.address || '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => {
                        setSelectedClientForDetails(client);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canManageClient && (
                      <>
                        <button 
                          onClick={() => handleOpenModal(client)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(client.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={canManageClient ? 5 : 4} className="px-6 py-8 text-center text-slate-500">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingClient ? 'Modifier le Client' : 'Nouveau Client'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact principal</label>
                <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" rows={2} />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isAccountClient"
                  checked={formData.isAccountClient} 
                  onChange={e => setFormData({...formData, isAccountClient: e.target.checked})} 
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
                />
                <label htmlFor="isAccountClient" className="text-sm font-medium text-slate-700">Client en compte (Paiement par échéancier autorisé)</label>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  {editingClient ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
              <p className="text-slate-500 text-sm">Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera également tous les projets associés.</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDetailsModal && selectedClientForDetails && (
          <ClientDetailsModal 
            client={selectedClientForDetails} 
            onClose={() => setShowDetailsModal(false)} 
            projects={projects.filter(p => p.clientId === selectedClientForDetails.id)}
            quotes={quotes.filter(q => q.clientId === selectedClientForDetails.id)}
            invoices={professionalInvoices.filter(i => i.clientId === selectedClientForDetails.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface DetailsModalProps {
  client: Client;
  onClose: () => void;
  projects: Project[];
  quotes: Quote[];
  invoices: ProfessionalInvoice[];
}

function ClientDetailsModal({ client, onClose, projects, quotes, invoices }: DetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'quotes' | 'invoices'>('projects');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
              <div className="flex items-center space-x-3 text-sm text-slate-500 mt-0.5">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{client.address || 'Aucune adresse'}</span>
                </span>
                <span>•</span>
                <span>{client.email}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
            <button 
              onClick={() => setActiveTab('projects')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2",
                activeTab === 'projects' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Briefcase className="w-4 h-4" />
              <span>Projets ({projects.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('quotes')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2",
                activeTab === 'quotes' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Devis ({quotes.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2",
                activeTab === 'invoices' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Receipt className="w-4 h-4" />
              <span>Factures ({invoices.length})</span>
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 gap-4">
                {projects.length > 0 ? projects.map(project => (
                  <div key={project.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{project.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Type: {project.type} • Créé le {format(new Date(project.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        project.status === 'TERMINE' ? "bg-emerald-100 text-emerald-700" : 
                        project.status === 'EN_COURS' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {project.status}
                      </span>
                      <div className="mt-2 w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-slate-500 italic">Aucun projet pour ce client.</p>
                )}
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="grid grid-cols-1 gap-4">
                {quotes.length > 0 ? quotes.map(quote => (
                  <div key={quote.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{quote.number}</h4>
                      <p className="text-xs text-slate-500 mt-1">Émis le {format(new Date(quote.issueDate), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{quote.totalAmount.toLocaleString()} FCFA</p>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 inline-block",
                        quote.status === 'ACCEPTED' ? "bg-emerald-100 text-emerald-700" : 
                        quote.status === 'SENT' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-slate-500 italic">Aucun devis pour ce client.</p>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="grid grid-cols-1 gap-4">
                {invoices.length > 0 ? invoices.map(invoice => (
                  <div key={invoice.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{invoice.number}</h4>
                      <p className="text-xs text-slate-500 mt-1">Due le {format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{invoice.totalAmount.toLocaleString()} FCFA</p>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 inline-block",
                        invoice.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : 
                        invoice.status === 'UNPAID' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-slate-500 italic">Aucune facture pour ce client.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
