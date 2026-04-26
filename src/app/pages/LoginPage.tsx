import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { LogIn, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otpCode, setOtpCode] = useState('');
  const { login, requestOTP, verifyOTP, resetPassword: doResetPassword } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (login(username, password)) {
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } else {
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Vui lòng nhập email.');
      return;
    }

    const res = await requestOTP(resetEmail.trim());
    if (res.success) {
      toast.success('Mã OTP đã được gửi tới email của bạn.');
      setResetStep('otp');
    } else {
      if (res.debug_otp) {
        toast.info(`[Debug] Mã OTP là: ${res.debug_otp}`);
        setResetStep('otp');
      } else {
        toast.error(res.error || 'Không tìm thấy tài khoản với email này.');
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      toast.error('Vui lòng nhập mã OTP 4 số.');
      return;
    }

    const res = await verifyOTP(resetEmail.trim(), otpCode);
    if (res.success) {
      toast.success('Xác thực thành công. Vui lòng nhập mật khẩu mới.');
      setResetStep('reset');
    } else {
      toast.error(res.error || 'Mã OTP không đúng hoặc đã hết hạn.');
    }
  };

  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetPassword) {
      toast.error('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      toast.error('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    const success = await doResetPassword(resetEmail.trim(), resetPassword);
    if (success) {
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      setResetEmail('');
      setResetPassword('');
      setResetPasswordConfirm('');
      setOtpCode('');
      setResetStep('email');
    } else {
      toast.error('Có lỗi xảy ra khi đặt lại mật khẩu.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hệ thống quản lý máy sấy
            </h1>
            <p className="text-gray-600">
              Đăng nhập để tiếp tục
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="employee, admin hoặc email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Đăng nhập
            </button>

            <div className="flex justify-center text-sm text-gray-600">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-orange-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {resetStep === 'email' && 'Quên mật khẩu'}
                      {resetStep === 'otp' && 'Xác thực OTP'}
                      {resetStep === 'reset' && 'Đặt lại mật khẩu'}
                    </DialogTitle>
                    <DialogDescription>
                      {resetStep === 'email' && 'Nhập email để nhận mã xác thực (OTP).'}
                      {resetStep === 'otp' && `Mã OTP đã được gửi tới ${resetEmail}.`}
                      {resetStep === 'reset' && 'Nhập mật khẩu mới cho tài khoản của bạn.'}
                    </DialogDescription>
                  </DialogHeader>

                  {resetStep === 'email' && (
                    <form onSubmit={handleRequestOTP} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <Input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="example@domain.com"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <button type="button" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Hủy</button>
                        </DialogClose>
                        <button type="submit" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Gửi mã OTP</button>
                      </div>
                    </form>
                  )}

                  {resetStep === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP (4 số)</label>
                        <Input
                          type="text"
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="0000"
                          className="text-center text-2xl tracking-widest"
                          required
                        />
                      </div>
                      <div className="flex justify-between gap-2">
                        <button type="button" onClick={() => setResetStep('email')} className="text-sm text-orange-600 hover:underline">Quay lại</button>
                        <div className="flex gap-2">
                          <DialogClose asChild>
                            <button type="button" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Hủy</button>
                          </DialogClose>
                          <button type="submit" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Xác thực</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {resetStep === 'reset' && (
                    <form onSubmit={handleFinalReset} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                        <Input
                          type="password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          placeholder="••••••"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                        <Input
                          type="password"
                          value={resetPasswordConfirm}
                          onChange={(e) => setResetPasswordConfirm(e.target.value)}
                          placeholder="••••••"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <button type="button" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Hủy</button>
                        </DialogClose>
                        <button type="submit" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Đổi mật khẩu</button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
}
