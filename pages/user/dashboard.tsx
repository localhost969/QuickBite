import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserDashboard from '@/components/user/UserDashboard';

export default function UserDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <Navbar />
      <UserDashboard />
    </ProtectedRoute>
  );
}
