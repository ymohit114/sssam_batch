import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'SSSAM Batch Management System',
  description: 'Role-based batch scheduling, trainer allocation, and student management system.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased font-sans min-h-screen text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1 flex max-w-7xl w-full mx-auto">
                <Sidebar />
                <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto w-full max-w-full">
                  {children}
                </main>
              </div>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
