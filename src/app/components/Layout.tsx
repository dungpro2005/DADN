import { Outlet, useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  BarChart3, 
  LogOut,
  User,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/buildings', icon: Building2, label: 'Tòa nhà' },
    { path: '/machines', icon: Settings, label: 'Máy sấy' },
    { path: '/schedules', icon: Calendar, label: 'Lịch trình' },
    { path: '/statistics', icon: BarChart3, label: 'Thống kê' },
  ];

  // Add Admin-only pages
  const adminNavItems = user?.role === 'admin'
    ? [
        ...navItems,
        { path: '/users', icon: Users, label: 'Nhân sự' },
        { path: '/activity-logs', icon: FileText, label: 'Nhật ký hoạt động' },
      ]
    : navItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Quản lý máy sấy
          </h1>
          <p className="text-sm text-gray-600 mt-1">Nhà máy sấy trái cây</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
