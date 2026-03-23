import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Project, Client, Lot, Task, Alert, User, AlertColor, Invoice, Installment, 
  Quote, ProfessionalInvoice, LineItem, Payment, CompanyInfo, ProfessionalInvoiceStatus,
  StockItem, StockMovement, Supplier, Expense, AppWorker, Attendance, AppDocument
} from '../types';
import { addDays, differenceInDays, format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface DataContextType {
  projects: Project[];
  clients: Client[];
  lots: Lot[];
  tasks: Task[];
  alerts: Alert[];
  users: User[];
  invoices: Invoice[]; // Legacy
  installments: Installment[]; // Legacy
  quotes: Quote[];
  professionalInvoices: ProfessionalInvoice[];
  payments: Payment[];
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  expenses: Expense[];
  workers: AppWorker[];
  attendances: Attendance[];
  documents: AppDocument[];
  companyInfo: CompanyInfo;
  dbError: string | null;
  isLoading: boolean;
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'progress' | 'status'>) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addClient: (c: Omit<Client, 'id'>) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addLot: (l: Omit<Lot, 'id' | 'status'>) => void;
  updateLot: (id: string, l: Partial<Lot>) => void;
  deleteLot: (id: string) => void;
  addTask: (t: Omit<Task, 'id' | 'status' | 'progress' | 'validatedByDT'>) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  validateTask: (id: string) => void;
  closeLot: (id: string) => void;
  closeTask: (id: string) => void;
  markAlertRead: (id: string) => void;
  // Professional Billing
  addQuote: (q: Omit<Quote, 'id' | 'number'>, items: Omit<LineItem, 'id' | 'documentId'>[]) => Promise<void>;
  updateQuote: (id: string, q: Partial<Quote>, items?: LineItem[]) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  convertQuoteToInvoice: (quoteId: string) => Promise<void>;
  addProfessionalInvoice: (i: Omit<ProfessionalInvoice, 'id' | 'number' | 'amountPaid' | 'amountRemaining' | 'status'>, items: Omit<LineItem, 'id' | 'documentId'>[]) => Promise<void>;
  updateProfessionalInvoice: (id: string, i: Partial<ProfessionalInvoice>, items?: LineItem[]) => Promise<void>;
  deleteProfessionalInvoice: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, 'id'>) => Promise<void>;
  // New Management
  addStockItem: (item: Omit<StockItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateStockItem: (id: string, item: Partial<StockItem>) => Promise<void>;
  addStockMovement: (m: Omit<StockMovement, 'id' | 'date'>) => Promise<void>;
  addSupplier: (s: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, s: Partial<Supplier>) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>;
  addWorker: (w: Omit<AppWorker, 'id'>) => Promise<void>;
  updateWorker: (id: string, w: Partial<AppWorker>) => Promise<void>;
  addAttendance: (a: Omit<Attendance, 'id'>) => Promise<void>;
  addDocument: (d: Omit<AppDocument, 'id' | 'uploadedAt'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  // Legacy
  addInvoice: (i: Omit<Invoice, 'id' | 'number' | 'status'>, installments?: Omit<Installment, 'id' | 'invoiceId' | 'status'>[]) => Promise<void>;
  updateInvoice: (id: string, i: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInstallment: (id: string, status: 'PENDING' | 'PAID') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [professionalInvoices, setProfessionalInvoices] = useState<ProfessionalInvoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workers, setWorkers] = useState<AppWorker[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'ProManager',
    address: 'Libreville, Gabon',
    email: 'ludo.consulting3@gmail.com',
    phone: '062641120',
    taxId: 'Ludo_consulting'
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        { data: profilesData, error: uErr },
        { data: clientsData, error: cErr },
        { data: projectsData, error: pErr },
        { data: lotsData, error: lErr },
        { data: tasksData, error: tErr },
        { data: invoicesData, error: iErr },
        { data: installmentsData, error: instErr },
        { data: quotesData, error: qErr },
        { data: profInvoicesData, error: piErr },
        { data: paymentsData, error: payErr },
        { data: lineItemsData, error: liErr },
        { data: stockItemsData, error: siErr },
        { data: stockMovementsData, error: smErr },
        { data: suppliersData, error: sErr },
        { data: expensesData, error: eErr },
        { data: workersData, error: wErr },
        { data: attendancesData, error: aErr },
        { data: documentsData, error: dErr }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('lots').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('installments').select('*'),
        supabase.from('quotes').select('*'),
        supabase.from('professional_invoices').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('line_items').select('*'),
        supabase.from('stock_items').select('*'),
        supabase.from('stock_movements').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('workers').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('documents').select('*')
      ]);

      if (uErr) throw uErr;
      if (cErr) throw cErr;
      
      setUsers(profilesData?.map(u => ({
        ...u,
        role: u.role || 'ENGINEER' // Fallback role
      })) || []);
      setClients(clientsData?.map(c => ({...c, isAccountClient: c.is_account_client})) || []);
      setProjects(projectsData?.map(p => ({...p, clientId: p.client_id, billingType: p.billing_type, createdAt: p.created_at})) || []);
      setLots(lotsData?.map(l => ({...l, projectId: l.project_id, engineerIds: l.engineer_ids})) || []);
      setTasks(tasksData?.map(t => ({...t, lotId: t.lot_id, engineerIds: t.engineer_ids, validatedByDT: t.validated_by_dt})) || []);
      setInvoices(invoicesData?.map(i => ({...i, clientId: i.client_id, projectId: i.project_id, totalAmount: i.total_amount, issueDate: i.issue_date, dueDate: i.due_date, isAccountClient: i.is_account_client, installmentsCount: i.installments_count})) || []);
      setInstallments(installmentsData?.map(inst => ({...inst, invoiceId: inst.invoice_id, dueDate: inst.due_date})) || []);

      // New Management Data
      setStockItems(stockItemsData?.map(si => ({...si, minQuantity: si.min_quantity, lastUpdated: si.last_updated})) || []);
      setStockMovements(stockMovementsData?.map(sm => ({...sm, itemId: sm.item_id, projectId: sm.project_id, performedBy: sm.performed_by})) || []);
      setSuppliers(suppliersData || []);
      setExpenses(expensesData?.map(e => ({...e, projectId: e.project_id, supplierId: e.supplier_id, receiptUrl: e.receipt_url})) || []);
      setWorkers(workersData?.map(w => ({...w, dailyRate: w.daily_rate})) || []);
      setAttendances(attendancesData?.map(a => ({...a, workerId: a.worker_id, projectId: a.project_id, hoursWorked: a.hours_worked})) || []);
      setDocuments(documentsData?.map(d => ({...d, projectId: d.project_id, uploadedAt: d.uploaded_at, uploadedBy: d.uploaded_by})) || []);

      // Professional Billing Data Mapping
      const mappedLineItems = lineItemsData?.map(li => ({
        ...li,
        documentId: li.document_id,
        unitPrice: li.unit_price,
        taxRate: li.tax_rate
      })) || [];

      const mappedPayments = paymentsData?.map(pay => ({
        ...pay,
        invoiceId: pay.invoice_id
      })) || [];

      const mappedQuotes = quotesData?.map(q => ({
        ...q,
        clientId: q.client_id,
        projectId: q.project_id,
        issueDate: q.issue_date,
        expiryDate: q.expiry_date,
        taxTotal: q.tax_total,
        totalAmount: q.total_amount,
        lineItems: mappedLineItems.filter(li => li.documentId === q.id)
      })) || [];
      setQuotes(mappedQuotes);

      const mappedProfInvoices = profInvoicesData?.map(pi => ({
        ...pi,
        clientId: pi.client_id,
        projectId: pi.project_id,
        quoteId: pi.quote_id,
        issueDate: pi.issue_date,
        dueDate: pi.due_date,
        taxTotal: pi.tax_total,
        totalAmount: pi.total_amount,
        amountPaid: pi.amount_paid,
        amountRemaining: pi.amount_remaining,
        lineItems: mappedLineItems.filter(li => li.documentId === pi.id),
        payments: mappedPayments.filter(pay => pay.invoiceId === pi.id)
      })) || [];
      setProfessionalInvoices(mappedProfInvoices);
      setPayments(mappedPayments);
      setDbError(null);
    } catch (error: any) {
      console.error("Supabase fetch error:", error);
      if (error.code === '42P01') {
        setDbError("Les tables n'existent pas dans Supabase. Veuillez exécuter le script SQL fourni.");
      } else {
        setDbError(error.message || "Erreur de connexion à Supabase");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Changement en temps réel détecté!', payload);
        fetchData(); // On recharge les données pour garder l'interface synchronisée
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    const now = new Date();

    tasks.forEach(t => {
      if (t.status === 'TERMINE') return;
      const daysLeft = differenceInDays(new Date(t.deadline), now);
      if (daysLeft < 0) {
        newAlerts.push({ id: `a-t-vert-${t.id}`, type: 'Tâche', message: `Délai dépassé pour la tâche: ${t.name}`, colorCode: 'vert', date: now.toISOString(), read: false });
      } else if (daysLeft <= 3) {
        newAlerts.push({ id: `a-t-noir-${t.id}`, type: 'Tâche', message: `Délai proche pour la tâche: ${t.name}`, colorCode: 'noir', date: now.toISOString(), read: false });
      }
    });

    lots.forEach(l => {
      if (l.status === 'TERMINE') return;
      const daysLeft = differenceInDays(new Date(l.deadline), now);
      if (daysLeft < 0) {
        newAlerts.push({ id: `a-l-orange-${l.id}`, type: 'Lot', message: `Délai dépassé pour le lot: ${l.name}`, colorCode: 'orange', date: now.toISOString(), read: false });
      } else if (daysLeft <= 7) {
        newAlerts.push({ id: `a-l-bleu-${l.id}`, type: 'Lot', message: `Délai proche pour le lot: ${l.name}`, colorCode: 'bleu', date: now.toISOString(), read: false });
      }
    });

    projects.forEach(p => {
      if (p.status === 'TERMINE') return;
      const daysLeft = differenceInDays(new Date(p.deadline), now);
      if (daysLeft < 0) {
        newAlerts.push({ id: `a-p-rouge-${p.id}`, type: 'Projet', message: `Délai dépassé pour le projet: ${p.name}`, colorCode: 'rouge', date: now.toISOString(), read: false });
      } else if (daysLeft <= 14) {
        newAlerts.push({ id: `a-p-jaune-${p.id}`, type: 'Projet', message: `Délai proche pour le projet: ${p.name}`, colorCode: 'jaune', date: now.toISOString(), read: false });
      }
    });

    installments.forEach(inst => {
      if (inst.status === 'PAID') return;
      const daysLeft = differenceInDays(new Date(inst.dueDate), now);
      const invoice = invoices.find(i => i.id === inst.invoiceId);
      const invNum = invoice?.number || inst.invoiceId;
      if (daysLeft < 0) {
        newAlerts.push({ id: `a-inst-rouge-${inst.id}`, type: 'Facturation', message: `Échéance dépassée pour la facture: ${invNum}`, colorCode: 'rouge', date: now.toISOString(), read: false });
      } else if (daysLeft <= 3) {
        newAlerts.push({ id: `a-inst-vert-${inst.id}`, type: 'Facturation', message: `Échéance proche pour la facture: ${invNum}`, colorCode: 'vert', date: now.toISOString(), read: false });
      }
    });

    setAlerts(newAlerts);
  }, [projects, lots, tasks, invoices, installments]);

  const addProject = async (p: Omit<Project, 'id' | 'createdAt' | 'progress' | 'status'>) => {
    await supabase.from('projects').insert([{
      name: p.name, type: p.type, client_id: p.clientId, billing_type: p.billingType, deadline: p.deadline, status: 'NOUVEAU', progress: 0
    }]);
  };

  const updateProject = async (id: string, p: Partial<Project>) => {
    const updates: any = {};
    if (p.name !== undefined) updates.name = p.name;
    if (p.type !== undefined) updates.type = p.type;
    if (p.clientId !== undefined) updates.client_id = p.clientId;
    if (p.billingType !== undefined) updates.billing_type = p.billingType;
    if (p.deadline !== undefined) updates.deadline = p.deadline;
    if (p.status !== undefined) updates.status = p.status;
    if (p.progress !== undefined) updates.progress = p.progress;
    
    await supabase.from('projects').update(updates).eq('id', id);
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
  };

  const addClient = async (c: Omit<Client, 'id'>) => {
    await supabase.from('clients').insert([{
      name: c.name,
      contact: c.contact,
      email: c.email,
      address: c.address,
      is_account_client: c.isAccountClient
    }]);
  };

  const updateClient = async (id: string, c: Partial<Client>) => {
    const updates: any = {};
    if (c.name !== undefined) updates.name = c.name;
    if (c.contact !== undefined) updates.contact = c.contact;
    if (c.email !== undefined) updates.email = c.email;
    if (c.address !== undefined) updates.address = c.address;
    if (c.isAccountClient !== undefined) updates.is_account_client = c.isAccountClient;

    await supabase.from('clients').update(updates).eq('id', id);
  };

  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
  };

  const addLot = async (l: Omit<Lot, 'id' | 'status'>) => {
    await supabase.from('lots').insert([{
      project_id: l.projectId, name: l.name, deadline: l.deadline, engineer_ids: l.engineerIds, status: 'A_FAIRE'
    }]);
  };

  const updateLot = async (id: string, l: Partial<Lot>) => {
    const updates: any = {};
    if (l.name !== undefined) updates.name = l.name;
    if (l.deadline !== undefined) updates.deadline = l.deadline;
    if (l.engineerIds !== undefined) updates.engineer_ids = l.engineerIds;
    if (l.status !== undefined) updates.status = l.status;

    await supabase.from('lots').update(updates).eq('id', id);
  };

  const deleteLot = async (id: string) => {
    await supabase.from('lots').delete().eq('id', id);
  };

  const addTask = async (t: Omit<Task, 'id' | 'status' | 'progress' | 'validatedByDT'>) => {
    await supabase.from('tasks').insert([{
      lot_id: t.lotId, name: t.name, deadline: t.deadline, engineer_ids: t.engineerIds, status: 'A_FAIRE', progress: 0, validated_by_dt: false
    }]);
  };

  const updateTaskProgress = async (id: string, progress: number) => {
    const status = progress === 100 ? 'A_VALIDER' : (progress > 0 ? 'EN_COURS' : 'A_FAIRE');
    await supabase.from('tasks').update({ progress, status }).eq('id', id);
  };

  const validateTask = async (id: string) => {
    await supabase.from('tasks').update({ validated_by_dt: true }).eq('id', id);
  };

  const closeTask = async (id: string) => {
    await supabase.from('tasks').update({ status: 'TERMINE', progress: 100 }).eq('id', id);
  };

  const closeLot = async (id: string) => {
    await supabase.from('lots').update({ status: 'TERMINE' }).eq('id', id);
  };

  const markAlertRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const addInvoice = async (i: Omit<Invoice, 'id' | 'number' | 'status'>, insts?: Omit<Installment, 'id' | 'invoiceId' | 'status'>[]) => {
    const prefix = i.type === 'QUOTE' ? 'D' : 'F';
    const year = new Date().getFullYear();
    const count = invoices.filter(inv => inv.type === i.type).length + 1;
    const number = `${prefix}-${year}-${count.toString().padStart(3, '0')}`;

    const { data: invData, error: invErr } = await supabase.from('invoices').insert([{
      type: i.type,
      number,
      client_id: i.clientId,
      project_id: i.projectId,
      total_amount: i.totalAmount,
      status: 'PENDING',
      issue_date: i.issueDate,
      due_date: i.dueDate,
      is_account_client: i.isAccountClient,
      installments_count: i.installmentsCount
    }]).select().single();

    if (invErr) throw invErr;

    if (insts && insts.length > 0) {
      const installmentsToInsert = insts.map(inst => ({
        invoice_id: invData.id,
        amount: inst.amount,
        due_date: inst.dueDate,
        status: 'PENDING'
      }));
      await supabase.from('installments').insert(installmentsToInsert);
    }
  };

  const updateInvoice = async (id: string, i: Partial<Invoice>) => {
    const updates: any = {};
    if (i.status !== undefined) updates.status = i.status;
    if (i.totalAmount !== undefined) updates.total_amount = i.totalAmount;
    
    await supabase.from('invoices').update(updates).eq('id', id);
  };

  const deleteInvoice = async (id: string) => {
    await supabase.from('invoices').delete().eq('id', id);
  };

  const updateInstallment = async (id: string, status: 'PENDING' | 'PAID') => {
    await supabase.from('installments').update({ status }).eq('id', id);
  };

  // Professional Billing Implementation
  const addQuote = async (q: Omit<Quote, 'id' | 'number'>, items: Omit<LineItem, 'id' | 'documentId'>[]) => {
    const year = new Date().getFullYear();
    const count = quotes.length + 1;
    const number = `DEV-${year}-${count.toString().padStart(3, '0')}`;

    const { data: quoteData, error: qErr } = await supabase.from('quotes').insert([{
      number,
      client_id: q.clientId,
      project_id: q.projectId,
      status: q.status,
      issue_date: q.issueDate,
      expiry_date: q.expiryDate,
      subtotal: q.subtotal,
      tax_total: q.taxTotal,
      total_amount: q.totalAmount,
      notes: q.notes
    }]).select().single();

    if (qErr) throw qErr;

    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        document_id: quoteData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate
      }));
      await supabase.from('line_items').insert(itemsToInsert);
    }
  };

  const updateQuote = async (id: string, q: Partial<Quote>, items?: LineItem[]) => {
    const updates: any = {};
    if (q.status) updates.status = q.status;
    if (q.subtotal !== undefined) updates.subtotal = q.subtotal;
    if (q.taxTotal !== undefined) updates.tax_total = q.taxTotal;
    if (q.totalAmount !== undefined) updates.total_amount = q.totalAmount;
    if (q.notes !== undefined) updates.notes = q.notes;

    if (Object.keys(updates).length > 0) {
      await supabase.from('quotes').update(updates).eq('id', id);
    }

    if (items) {
      await supabase.from('line_items').delete().eq('document_id', id);
      const itemsToInsert = items.map(item => ({
        document_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate
      }));
      await supabase.from('line_items').insert(itemsToInsert);
    }
  };

  const deleteQuote = async (id: string) => {
    await supabase.from('line_items').delete().eq('document_id', id);
    await supabase.from('quotes').delete().eq('id', id);
  };

  const addProfessionalInvoice = async (i: Omit<ProfessionalInvoice, 'id' | 'number' | 'amountPaid' | 'amountRemaining' | 'status'>, items: Omit<LineItem, 'id' | 'documentId'>[]) => {
    const year = new Date().getFullYear();
    const count = professionalInvoices.length + 1;
    const number = `FAC-${year}-${count.toString().padStart(3, '0')}`;

    const { data: invData, error: iErr } = await supabase.from('professional_invoices').insert([{
      number,
      client_id: i.clientId,
      project_id: i.projectId,
      quote_id: i.quoteId,
      status: 'UNPAID',
      issue_date: i.issueDate,
      due_date: i.dueDate,
      subtotal: i.subtotal,
      tax_total: i.taxTotal,
      total_amount: i.totalAmount,
      amount_paid: 0,
      amount_remaining: i.totalAmount,
      notes: i.notes
    }]).select().single();

    if (iErr) throw iErr;

    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        document_id: invData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate
      }));
      await supabase.from('line_items').insert(itemsToInsert);
    }
  };

  const updateProfessionalInvoice = async (id: string, i: Partial<ProfessionalInvoice>, items?: LineItem[]) => {
    const updates: any = {};
    if (i.status) updates.status = i.status;
    if (i.notes !== undefined) updates.notes = i.notes;
    
    if (Object.keys(updates).length > 0) {
      await supabase.from('professional_invoices').update(updates).eq('id', id);
    }

    if (items) {
      await supabase.from('line_items').delete().eq('document_id', id);
      const itemsToInsert = items.map(item => ({
        document_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate
      }));
      await supabase.from('line_items').insert(itemsToInsert);
    }
  };

  const deleteProfessionalInvoice = async (id: string) => {
    await supabase.from('payments').delete().eq('invoice_id', id);
    await supabase.from('line_items').delete().eq('document_id', id);
    await supabase.from('professional_invoices').delete().eq('id', id);
  };

  const addPayment = async (p: Omit<Payment, 'id'>) => {
    const { error: pErr } = await supabase.from('payments').insert([{
      invoice_id: p.invoiceId,
      amount: p.amount,
      date: p.date,
      method: p.method,
      note: p.note
    }]);

    if (pErr) throw pErr;

    // Update invoice totals and status
    const invoice = professionalInvoices.find(inv => inv.id === p.invoiceId);
    if (invoice) {
      const newPaid = invoice.amountPaid + p.amount;
      const newRemaining = invoice.totalAmount - newPaid;
      let newStatus: ProfessionalInvoiceStatus = 'PARTIALLY_PAID';
      if (newRemaining <= 0) newStatus = 'PAID';

      await supabase.from('professional_invoices').update({
        amount_paid: newPaid,
        amount_remaining: newRemaining,
        status: newStatus
      }).eq('id', p.invoiceId);

      // Add alert for payment received
      const client = clients.find(c => c.id === invoice.clientId);
      const newAlert: Omit<Alert, 'id'> = {
        type: 'Facturation',
        message: `Paiement de ${p.amount.toLocaleString()} FCFA reçu pour la facture ${invoice.number} (${client?.name})`,
        colorCode: 'vert',
        date: new Date().toISOString(),
        read: false
      };
      await supabase.from('alerts').insert([newAlert]);
    }
  };

  const convertQuoteToInvoice = async (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    await addProfessionalInvoice({
      clientId: quote.clientId,
      projectId: quote.projectId,
      quoteId: quote.id,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      totalAmount: quote.totalAmount,
      notes: `Converti depuis le devis ${quote.number}`
    }, quote.lineItems || []);

    await updateQuote(quoteId, { status: 'ACCEPTED' });
  };

  // --- New Management Implementations ---

  const addStockItem = async (item: Omit<StockItem, 'id' | 'lastUpdated'>) => {
    await supabase.from('stock_items').insert([{
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      last_updated: new Date().toISOString()
    }]);
  };

  const updateStockItem = async (id: string, item: Partial<StockItem>) => {
    const updates: any = { ...item, last_updated: new Date().toISOString() };
    if (item.minQuantity !== undefined) {
      updates.min_quantity = item.minQuantity;
      delete updates.minQuantity;
    }
    await supabase.from('stock_items').update(updates).eq('id', id);
  };

  const addStockMovement = async (m: Omit<StockMovement, 'id' | 'date'>) => {
    await supabase.from('stock_movements').insert([{
      item_id: m.itemId,
      project_id: m.projectId,
      type: m.type,
      quantity: m.quantity,
      date: new Date().toISOString(),
      note: m.note,
      performed_by: m.performedBy
    }]);
    
    // Update stock quantity
    const item = stockItems.find(i => i.id === m.itemId);
    if (item) {
      const newQty = m.type === 'IN' ? item.quantity + m.quantity : item.quantity - m.quantity;
      await updateStockItem(m.itemId, { quantity: newQty });
    }
  };

  const addSupplier = async (s: Omit<Supplier, 'id'>) => {
    await supabase.from('suppliers').insert([s]);
  };

  const updateSupplier = async (id: string, s: Partial<Supplier>) => {
    await supabase.from('suppliers').update(s).eq('id', id);
  };

  const addExpense = async (e: Omit<Expense, 'id' | 'date'>) => {
    await supabase.from('expenses').insert([{
      project_id: e.projectId,
      supplier_id: e.supplierId,
      description: e.description,
      amount: e.amount,
      date: new Date().toISOString(),
      category: e.category,
      status: e.status,
      receipt_url: e.receiptUrl
    }]);
  };

  const updateExpense = async (id: string, e: Partial<Expense>) => {
    const updates: any = { ...e };
    if (e.projectId !== undefined) { updates.project_id = e.projectId; delete updates.projectId; }
    if (e.supplierId !== undefined) { updates.supplier_id = e.supplierId; delete updates.supplierId; }
    if (e.receiptUrl !== undefined) { updates.receipt_url = e.receiptUrl; delete updates.receiptUrl; }
    
    await supabase.from('expenses').update(updates).eq('id', id);
  };

  const addWorker = async (w: Omit<AppWorker, 'id'>) => {
    await supabase.from('workers').insert([{
      name: w.name,
      specialty: w.specialty,
      phone: w.phone,
      daily_rate: w.dailyRate,
      status: w.status
    }]);
  };

  const updateWorker = async (id: string, w: Partial<AppWorker>) => {
    const updates: any = { ...w };
    if (w.dailyRate !== undefined) { updates.daily_rate = w.dailyRate; delete updates.dailyRate; }
    await supabase.from('workers').update(updates).eq('id', id);
  };

  const addAttendance = async (a: Omit<Attendance, 'id'>) => {
    await supabase.from('attendance').insert([{
      worker_id: a.workerId,
      project_id: a.projectId,
      date: a.date,
      status: a.status,
      hours_worked: a.hoursWorked
    }]);
  };

  const addDocument = async (d: Omit<AppDocument, 'id' | 'uploadedAt'>) => {
    await supabase.from('documents').insert([{
      project_id: d.projectId,
      name: d.name,
      type: d.type,
      url: d.url,
      uploaded_at: new Date().toISOString(),
      uploaded_by: d.uploadedBy,
      description: d.description
    }]);
  };

  const deleteDocument = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
  };

  return (
    <DataContext.Provider value={{ 
      projects, clients, lots, tasks, alerts, users, invoices, installments, 
      quotes, professionalInvoices, payments,
      stockItems, stockMovements, suppliers, expenses, workers, attendances, documents,
      companyInfo,
      dbError, isLoading, 
      addProject, updateProject, deleteProject, 
      addClient, updateClient, deleteClient, 
      addLot, updateLot, deleteLot, 
      addTask, updateTaskProgress, validateTask, 
      closeLot, closeTask, markAlertRead, 
      addInvoice, updateInvoice, deleteInvoice, updateInstallment,
      addQuote, updateQuote, deleteQuote, convertQuoteToInvoice,
      addProfessionalInvoice, updateProfessionalInvoice, deleteProfessionalInvoice, addPayment,
      addStockItem, updateStockItem, addStockMovement,
      addSupplier, updateSupplier, addExpense, updateExpense,
      addWorker, updateWorker, addAttendance, addDocument, deleteDocument
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
