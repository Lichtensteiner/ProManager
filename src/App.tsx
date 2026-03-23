/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Clients from './pages/Clients';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import AIArchitect from './pages/AIArchitect';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import HR from './pages/HR';
import Documents from './pages/Documents';
import Planning from './pages/Planning';
import ClientPortal from './pages/ClientPortal';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="planning" element={<Planning />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="hr" element={<HR />} />
              <Route path="documents" element={<Documents />} />
              <Route path="client-portal" element={<ClientPortal />} />
              <Route path="clients" element={<Clients />} />
              <Route path="billing" element={<Billing />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai-architect" element={<AIArchitect />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
