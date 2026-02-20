import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import DenialAnalystDashboard from './pages/DenialAnalystDashboard';
import ClaimsIntakeDashboard from './pages/ClaimsIntakeDashboard';
import MedicalCoderDashboard from './pages/MedicalCoderDashboard';
import ClaimDetailPage from './pages/ClaimDetailPage';
import ClaimsListPage from './pages/ClaimsListPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { persona, currentPage } = useApp();

  if (!persona || currentPage === 'login') {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (persona === 'denial_analyst') return <DenialAnalystDashboard />;
        if (persona === 'claims_intake') return <ClaimsIntakeDashboard />;
        if (persona === 'medical_coder') return <MedicalCoderDashboard />;
        return <DenialAnalystDashboard />;
      case 'claims':
        return <ClaimsListPage />;
      case 'claim-detail':
        return <ClaimDetailPage />;
      case 'settings':
        return <SettingsPage />;
      case 'analytics':
        return <DenialAnalystDashboard />;
      default:
        return <DenialAnalystDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
