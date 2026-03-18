import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

type FormState = {
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  password: string;
  confirmPassword: string;
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { user, users, addUser, updateUser, removeUser } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    username: '',
    name: '',
    email: '',
    role: 'employee',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const userList = useMemo(() => {
    return Object.values(users).map((entry) => entry.user);
  }, [users]);

  const resetForm = () => {
    setForm({
      username: '',
      name: '',
      email: '',
      role: 'employee',
      password: '',
      confirmPassword: '',
    });
    setEditingUsername(null);
    setIsEditing(false);
  };

  const openAddDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (username: string) => {
    const entry = users[username];
    if (!entry) return;

    setForm({
      username: entry.user.username,
      name: entry.user.name,
      email: entry.user.email ?? '',
      role: entry.user.role,
      password: '',
      confirmPassword: '',
    });
    setEditingUsername(username);
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.username || !form.name || !form.email) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!form.email.includes('@')) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (!isEditing) {
      if (!form.password) {
        toast.error('Vui lòng nhập mật khẩu');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
        return;
      }

      const success = addUser(
        {
          username: form.username.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        },
        form.password
      );

      if (!success) {
        toast.error('Không thể tạo tài khoản. Có thể tên đăng nhập hoặc email đã tồn tại.');
        return;
      }

      toast.success('Đã tạo tài khoản thành công');
      setShowDialog(false);
      resetForm();
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    if (!editingUsername) return;

    const success = updateUser(editingUsername, {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password ? form.password : undefined,
    });

    if (!success) {
      toast.error('Không thể cập nhật tài khoản. Có thể email đã được sử dụng.');
      return;
    }

    toast.success('Cập nhật tài khoản thành công');
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = (username: string, name: string) => {
    if (user?.username === username) {
      toast.error('Bạn không thể xóa chính mình.');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${name}?`)) return;

    const success = removeUser(username);
    if (!success) {
      toast.error('Không thể xóa tài khoản. Cần ít nhất một quản lý.');
      return;
    }

    toast.success('Đã xóa tài khoản');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý nhân sự
          </h1>
          <p className="text-gray-600">Danh sách tài khoản nhân viên</p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">Tên đăng nhập</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.username} className="border-t border-gray-100">
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditDialog(u.username)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.username, u.name)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userList.length === 0 && (
          <div className="p-10 text-center text-gray-600">
            Chưa có tài khoản nào.
          </div>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing
                    ? 'Cập nhật thông tin tài khoản. Để giữ nguyên mật khẩu, để trống trường mật khẩu.'
                    : 'Tạo tài khoản mới cho nhân viên.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  disabled={isEditing}
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="vd: nguyen.van.a"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="vd: Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="vd: a@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        role: e.target.value as 'admin' | 'employee',
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="employee">Nhân viên</option>
                    <option value="admin">Quản lý</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={
                      isEditing
                        ? 'Để trống để giữ nguyên'
                        : 'Nhập mật khẩu'
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={
                    isEditing
                      ? 'Để trống để giữ nguyên'
                      : 'Nhập lại mật khẩu'
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  {isEditing ? 'Lưu' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
