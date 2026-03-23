-- Tables for Professional Billing System

-- Line Items (Prestations)
CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL, -- Refers to Quote or Invoice ID
  description TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 1,
  unit_price DECIMAL NOT NULL DEFAULT 0,
  tax_rate DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes (Devis)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REFUSED
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  subtotal DECIMAL NOT NULL DEFAULT 0,
  tax_total DECIMAL NOT NULL DEFAULT 0,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Invoices (Factures)
CREATE TABLE IF NOT EXISTS professional_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL NOT NULL DEFAULT 0,
  tax_total DECIMAL NOT NULL DEFAULT 0,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  amount_paid DECIMAL NOT NULL DEFAULT 0,
  amount_remaining DECIMAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (Paiements)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES professional_invoices(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  method TEXT NOT NULL, -- CASH, TRANSFER, CHECK, MOBILE_MONEY
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Inventory & Equipment (Stocks)
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  min_quantity DECIMAL NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- IN, OUT, ADJUSTMENT
  quantity DECIMAL NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note TEXT,
  performed_by TEXT NOT NULL
);

-- 2. Expenses & Suppliers (Dépenses & Fournisseurs)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL, -- MATERIAL, LABOR, EQUIPMENT, OTHER
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED
  receipt_url TEXT
);

-- 3. HR & Attendance (RH & Pointage)
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT NOT NULL,
  daily_rate DECIMAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' -- ACTIVE, INACTIVE
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- PRESENT, ABSENT, LATE, SICK
  hours_worked DECIMAL NOT NULL DEFAULT 8
);

-- 4. Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- PLAN, PHOTO, CONTRACT, REPORT, OTHER
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT NOT NULL,
  description TEXT
);

-- Update profiles table with new fields
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS missions TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS roles_description TEXT;

-- Update clients table with new fields
ALTER TABLE IF EXISTS clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS clients ADD COLUMN IF NOT EXISTS is_account_client BOOLEAN DEFAULT FALSE;

-- Enable RLS for all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS professional_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for authenticated users for now)
-- Note: In production, you should restrict this to the user's own data.
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('profiles', 'clients', 'projects', 'lots', 'tasks', 'invoices', 'installments', 'quotes', 'professional_invoices', 'payments', 'line_items', 'alerts', 'stock_items', 'stock_movements', 'suppliers', 'expenses', 'workers', 'attendance', 'documents')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated users" ON %I', t);
        EXECUTE format('CREATE POLICY "Allow all for authenticated users" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;
