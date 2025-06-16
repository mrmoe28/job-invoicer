import DashboardLayout from '../../../components/dashboard-layout';

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
        <p className="text-gray-300 mb-6">Manage your account and application settings here.</p>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400">Settings options will appear here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 