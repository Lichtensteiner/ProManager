import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Filter, FileText, Download, CheckCircle, AlertCircle, 
  Clock, Trash2, Eye, X, Receipt, ArrowRight, CreditCard, History, 
  FileSpreadsheet, FileDown, Send, Printer, Edit2, PlusCircle, MinusCircle
} from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Quote, ProfessionalInvoice, QuoteStatus, ProfessionalInvoiceStatus, 
  LineItem, Payment, Client, Project 
} from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Billing() {
  const { 
    quotes, professionalInvoices, payments, clients, projects, companyInfo,
    addQuote, updateQuote, deleteQuote, convertQuoteToInvoice,
    addProfessionalInvoice, updateProfessionalInvoice, deleteProfessionalInvoice, addPayment 
  } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'QUOTES'>('INVOICES');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [showDocModal, setShowDocModal] = useState(false);
  const [docType, setDocType] = useState<'QUOTE' | 'INVOICE'>('INVOICE');
  const [editingDoc, setEditingDoc] = useState<Quote | ProfessionalInvoice | null>(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ProfessionalInvoice | null>(null);

  // Stats
  const stats = useMemo(() => {
    const totalInvoiced = professionalInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = professionalInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalRemaining = totalInvoiced - totalPaid;
    return { totalInvoiced, totalPaid, totalRemaining };
  }, [professionalInvoices]);

  // Filtered Data
  const filteredData = useMemo(() => {
    const data = activeTab === 'INVOICES' ? professionalInvoices : quotes;
    return data.filter(doc => {
      const client = clients.find(c => c.id === doc.clientId);
      const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           client?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, quotes, professionalInvoices, searchTerm, statusFilter, clients]);

  // --- Export Functions ---
  const exportToExcel = () => {
    const data = filteredData.map(doc => {
      const client = clients.find(c => c.id === doc.clientId);
      return {
        'Numéro': doc.number,
        'Client': client?.name || 'Inconnu',
        'Date': format(new Date(doc.issueDate), 'dd/MM/yyyy'),
        'Montant Total': doc.totalAmount,
        'Statut': doc.status,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'INVOICES' ? 'Factures' : 'Devis');
    XLSX.writeFile(wb, `${activeTab.toLowerCase()}_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = (doc: Quote | ProfessionalInvoice) => {
    const docPdf = new jsPDF();
    const client = clients.find(c => c.id === doc.clientId);
    
    // Header
    docPdf.setFontSize(20);
    docPdf.text(companyInfo.name, 14, 22);
    docPdf.setFontSize(10);
    docPdf.text(companyInfo.address, 14, 30);
    docPdf.text(`Email: ${companyInfo.email} | Tél: ${companyInfo.phone}`, 14, 35);
    
    // Title
    docPdf.setFontSize(16);
    const title = activeTab === 'INVOICES' ? 'FACTURE' : 'DEVIS';
    docPdf.text(`${title} N° ${doc.number}`, 14, 50);
    
    // Client Info
    docPdf.setFontSize(12);
    docPdf.text('Client:', 14, 65);
    docPdf.setFontSize(10);
    docPdf.text(client?.name || 'Inconnu', 14, 70);
    docPdf.text(client?.address || '', 14, 75);
    
    // Dates
    docPdf.text(`Date d'émission: ${format(new Date(doc.issueDate), 'dd/MM/yyyy')}`, 140, 65);
    if ('dueDate' in doc) {
      docPdf.text(`Date d'échéance: ${format(new Date(doc.dueDate), 'dd/MM/yyyy')}`, 140, 70);
    } else if ('expiryDate' in doc) {
      docPdf.text(`Date d'expiration: ${format(new Date(doc.expiryDate), 'dd/MM/yyyy')}`, 140, 70);
    }

    // Table
    const tableData = (doc.lineItems || []).map(item => [
      item.description,
      item.quantity,
      `${item.unitPrice.toLocaleString()} FCFA`,
      `${item.taxRate}%`,
      `${(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toLocaleString()} FCFA`
    ]);

    (docPdf as any).autoTable({
      startY: 85,
      head: [['Description', 'Qté', 'Prix Unitaire', 'TVA', 'Total']],
      body: tableData,
    });

    // Totals
    const finalY = (docPdf as any).lastAutoTable.finalY + 10;
    docPdf.text(`Sous-total: ${doc.subtotal.toLocaleString()} FCFA`, 140, finalY);
    docPdf.text(`TVA: ${doc.taxTotal.toLocaleString()} FCFA`, 140, finalY + 5);
    docPdf.setFontSize(12);
    docPdf.text(`TOTAL TTC: ${doc.totalAmount.toLocaleString()} FCFA`, 140, finalY + 12);

    docPdf.save(`${doc.number}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion Financière</h1>
          <p className="text-slate-500">Gérez vos devis, factures et encaissements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button 
            onClick={() => {
              setDocType(activeTab === 'INVOICES' ? 'INVOICE' : 'QUOTE');
              setEditingDoc(null);
              setShowDocModal(true);
            }}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau {activeTab === 'INVOICES' ? 'Facture' : 'Devis'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Total Facturé</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalInvoiced.toLocaleString()} FCFA</p>
          <p className="text-sm text-slate-500 mt-1">Montant total des factures</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Encaissé</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalPaid.toLocaleString()} FCFA</p>
          <p className="text-sm text-slate-500 mt-1">Total des paiements reçus</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase">Reste à percevoir</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalRemaining.toLocaleString()} FCFA</p>
          <p className="text-sm text-slate-500 mt-1">Montant restant à payer</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setActiveTab('INVOICES'); setStatusFilter('ALL'); }}
            className={cn(
              "flex-1 py-4 font-bold text-sm transition-colors",
              activeTab === 'INVOICES' ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Factures
          </button>
          <button 
            onClick={() => { setActiveTab('QUOTES'); setStatusFilter('ALL'); }}
            className={cn(
              "flex-1 py-4 font-bold text-sm transition-colors",
              activeTab === 'QUOTES' ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Devis
          </button>
        </div>

        <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par numéro ou client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="ALL">Tous les statuts</option>
              {activeTab === 'INVOICES' ? (
                <>
                  <option value="UNPAID">Non payé</option>
                  <option value="PARTIALLY_PAID">Partiellement payé</option>
                  <option value="PAID">Payé</option>
                  <option value="OVERDUE">En retard</option>
                </>
              ) : (
                <>
                  <option value="DRAFT">Brouillon</option>
                  <option value="SENT">Envoyé</option>
                  <option value="ACCEPTED">Accepté</option>
                  <option value="REFUSED">Refusé</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Numéro</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Client</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Date</th>
                <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Montant Total</th>
                {activeTab === 'INVOICES' && <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Payé</th>}
                <th className="px-6 py-4 font-bold text-center whitespace-nowrap">Statut</th>
                <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(doc => {
                const client = clients.find(c => c.id === doc.clientId);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{doc.number}</span>
                        {activeTab === 'INVOICES' && (doc as ProfessionalInvoice).quoteId && (
                          <span className="text-[10px] text-slate-400">Depuis {quotes.find(q => q.id === (doc as ProfessionalInvoice).quoteId)?.number}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{client?.name || 'Inconnu'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                      {format(new Date(doc.issueDate), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {doc.totalAmount.toLocaleString()} FCFA
                    </td>
                    {activeTab === 'INVOICES' && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-emerald-600">{(doc as ProfessionalInvoice).amountPaid.toLocaleString()} FCFA</span>
                          <span className="text-[10px] text-slate-400">Reste: {(doc as ProfessionalInvoice).amountRemaining.toLocaleString()}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => exportToPDF(doc)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Exporter PDF"
                        >
                          <FileDown className="w-5 h-5" />
                        </button>
                        {activeTab === 'QUOTES' && doc.status === 'SENT' && (
                          <button 
                            onClick={() => convertQuoteToInvoice(doc.id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Convertir en Facture"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        )}
                        {activeTab === 'INVOICES' && doc.status !== 'PAID' && (
                          <button 
                            onClick={() => { setSelectedInvoice(doc as ProfessionalInvoice); setShowPaymentModal(true); }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Ajouter un paiement"
                          >
                            <CreditCard className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setDocType(activeTab === 'INVOICES' ? 'INVOICE' : 'QUOTE');
                            setEditingDoc(doc);
                            setShowDocModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => activeTab === 'INVOICES' ? deleteProfessionalInvoice(doc.id) : deleteQuote(doc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Aucun document trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDocModal && (
        <DocumentModal 
          type={docType} 
          doc={editingDoc} 
          onClose={() => setShowDocModal(false)} 
        />
      )}

      {showPaymentModal && selectedInvoice && (
        <PaymentModal 
          invoice={selectedInvoice} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
    SENT: "bg-blue-100 text-blue-600 border-blue-200",
    ACCEPTED: "bg-emerald-100 text-emerald-600 border-emerald-200",
    REFUSED: "bg-red-100 text-red-600 border-red-200",
    UNPAID: "bg-red-100 text-red-600 border-red-200",
    PARTIALLY_PAID: "bg-orange-100 text-orange-600 border-orange-200",
    PAID: "bg-emerald-100 text-emerald-600 border-emerald-200",
    OVERDUE: "bg-red-100 text-red-600 border-red-200 animate-pulse",
  };

  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    SENT: "Envoyé",
    ACCEPTED: "Accepté",
    REFUSED: "Refusé",
    UNPAID: "Non payé",
    PARTIALLY_PAID: "Partiel",
    PAID: "Payé",
    OVERDUE: "En retard",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
      styles[status] || styles.DRAFT
    )}>
      {labels[status] || status}
    </span>
  );
}

// --- Document Modal (Create/Edit Quote or Invoice) ---
function DocumentModal({ type, doc, onClose }: { type: 'QUOTE' | 'INVOICE', doc: any, onClose: () => void }) {
  const { clients, projects, addQuote, updateQuote, addProfessionalInvoice, updateProfessionalInvoice } = useData();
  
  const [formData, setFormData] = useState({
    clientId: doc?.clientId || '',
    projectId: doc?.projectId || '',
    status: doc?.status || (type === 'QUOTE' ? 'DRAFT' : 'UNPAID'),
    issueDate: doc?.issueDate || format(new Date(), 'yyyy-MM-dd'),
    dueDate: doc?.dueDate || doc?.expiryDate || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: doc?.notes || '',
  });

  const [items, setItems] = useState<Omit<LineItem, 'id' | 'documentId'>[]>(
    doc?.lineItems?.map((li: any) => ({
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      taxRate: li.taxRate
    })) || [{ description: '', quantity: 1, unitPrice: 0, taxRate: 18 }]
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const totalAmount = subtotal + taxTotal;
    return { subtotal, taxTotal, totalAmount };
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docData = { ...formData, ...totals };
    
    try {
      if (doc) {
        if (type === 'QUOTE') await updateQuote(doc.id, docData, items as any);
        else await updateProfessionalInvoice(doc.id, docData, items as any);
      } else {
        if (type === 'QUOTE') await addQuote(docData as any, items);
        else await addProfessionalInvoice(docData as any, items);
      }
      onClose();
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {doc ? 'Modifier' : 'Nouveau'} {type === 'QUOTE' ? 'Devis' : 'Facture'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Remplissez les détails du document ci-dessous.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Client</label>
                <select 
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Projet (Optionnel)</label>
                <select 
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Aucun projet</option>
                  {projects.filter(p => p.clientId === formData.clientId).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Date d'émission</label>
                  <input 
                    required
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{type === 'QUOTE' ? 'Expiration' : 'Échéance'}</label>
                  <input 
                    required
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Statut</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {type === 'QUOTE' ? (
                    <>
                      <option value="DRAFT">Brouillon</option>
                      <option value="SENT">Envoyé</option>
                      <option value="ACCEPTED">Accepté</option>
                      <option value="REFUSED">Refusé</option>
                    </>
                  ) : (
                    <>
                      <option value="UNPAID">Non payé</option>
                      <option value="PARTIALLY_PAID">Partiellement payé</option>
                      <option value="PAID">Payé</option>
                      <option value="OVERDUE">En retard</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Prestations</h3>
              <button 
                type="button"
                onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 18 }])}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-bold text-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Ajouter une ligne</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex-1">
                    <input 
                      required
                      placeholder="Description de la prestation"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].description = e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-20">
                      <input 
                        required
                        type="number"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantity = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        required
                        type="number"
                        placeholder="Prix Unitaire"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-24">
                      <select 
                        value={item.taxRate}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].taxRate = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">0%</option>
                        <option value="5.5">5.5%</option>
                        <option value="18">18%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notes & Conditions</label>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Conditions de paiement, validité du devis..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4">
              <div className="flex justify-between text-slate-400">
                <span>Sous-total</span>
                <span className="font-bold">{totals.subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes</span>
                <span className="font-bold">{totals.taxTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">TOTAL TTC</span>
                <span className="text-2xl font-black text-blue-400">{totals.totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-xl shadow-blue-600/20"
            >
              {doc ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Payment Modal ---
function PaymentModal({ invoice, onClose }: { invoice: ProfessionalInvoice, onClose: () => void }) {
  const { addPayment } = useData();
  const [formData, setFormData] = useState({
    amount: invoice.amountRemaining,
    date: format(new Date(), 'yyyy-MM-dd'),
    method: 'TRANSFER' as any,
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPayment({
        invoiceId: invoice.id,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Encaisser un paiement</h2>
            <p className="text-xs text-slate-500 mt-1">Facture N° {invoice.number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Reste à payer</span>
              <span className="font-bold text-slate-900">{invoice.amountRemaining.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Montant du versement</label>
              <input 
                required
                type="number"
                max={invoice.amountRemaining}
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Date du paiement</label>
              <input 
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mode de paiement</label>
              <select 
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="TRANSFER">Virement Bancaire</option>
                <option value="CASH">Espèces</option>
                <option value="CHECK">Chèque</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Note (Optionnel)</label>
              <textarea 
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                placeholder="Référence virement, numéro chèque..."
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button 
              type="submit" 
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Confirmer l'encaissement</span>
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-3 text-slate-500 hover:bg-slate-100 rounded-2xl font-bold transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
