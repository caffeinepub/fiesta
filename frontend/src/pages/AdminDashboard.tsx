import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useQueries';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import { UserRole } from '../backend';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    } else if (!isLoading && userRole !== UserRole.admin) {
      navigate({ to: '/' });
    }
  }, [identity, userRole, isLoading, navigate]);

  if (!identity || isLoading) {
    return null;
  }

  if (userRole !== UserRole.admin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-navy mb-8">Admin Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  );
}
