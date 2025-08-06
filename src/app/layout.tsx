import type { Metadata } from 'next';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: "Codash | (Coding Activity Tracker)",
  description: "Track your coding journey",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
       <AuthProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
      </body>
    </html>
  );
}
