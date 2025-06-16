import DashboardLayout from '../../../components/dashboard-layout';

export default function IntegrationsPage() {
  return (
    <DashboardLayout title="Integrations">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Integrations</h1>
        <p className="text-gray-300 mb-6">Connect with third-party services and tools.</p>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400">No integrations configured yet. Add integrations here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 