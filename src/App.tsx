/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Sidebar } from './components/Sidebar.tsx';

// Views
import { DashboardView } from './views/DashboardView.tsx';
import { RecordHarvestView } from './views/RecordHarvestView.tsx';
import { FarmersView } from './views/FarmersView.tsx';
import { HarvestRecordsView } from './views/HarvestRecordsView.tsx';
import { ReceiptsView } from './views/ReceiptsView.tsx';
import { MonthlyReportsView } from './views/MonthlyReportsView.tsx';
import { FarmerSlipsView } from './views/FarmerSlipsView.tsx';
import { GroupsSatellitesView } from './views/GroupsSatellitesView.tsx';
import { UsersView } from './views/UsersView.tsx';
import { AuditLogView } from './views/AuditLogView.tsx';
import { SettingsView } from './views/SettingsView.tsx';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'record-harvest':
        return <RecordHarvestView onNavigate={setActiveTab} />;
      case 'farmers':
        return <FarmersView onNavigate={setActiveTab} />;
      case 'records':
        return <HarvestRecordsView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'reports':
        return <MonthlyReportsView />;
      case 'farmer-slips':
        return <FarmerSlipsView />;
      case 'groups':
      case 'satellites':
        return <GroupsSatellitesView />;
      case 'users':
        return <UsersView />;
      case 'audit-log':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar / Mobile Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 md:pl-72 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}
