import '../styles/globals.css'; // Your global styles
import { AuthProvider } from '../contexts/AuthContext'; // Your AuthProvider
import Layout from '../components/Layout'; // Import the dashboard layout
import { useRouter } from 'next/router'; // Import the router
// 1. IMPORT 'toast' and 'ToastBar'
import { toast, Toaster, ToastBar } from 'react-hot-toast'; 

// 1. Define your public-facing routes
const publicRoutes = ['/login', '/register', '/']; // Homepage, login, and register

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AuthProvider>
      {/* 2. UPDATED TOASTER CONFIGURATION */}
      <Toaster 
        position="top-right" // <-- Moved to top-right
        toastOptions={{
          duration: 4000, // Adjusted duration for the "deloading bar" feel
          className: 'custom-toast-alert', // <-- Custom class for glossy effect
          style: {
            padding: '12px 16px', // Slightly more padding
            borderRadius: '8px', // Slightly rounded corners
            fontSize: '15px',
            color: '#333',
            background: '#fff',
            // Default styling for the toasts, we'll override for types below
          },
          success: {
            iconTheme: {
              primary: '#10B981', // Green check for success
              secondary: '#fff',
            },
            // 3. REMOVED the conflicting borderLeft style
            // style: { borderLeft: '4px solid #10B981' },
            className: 'custom-toast-alert success-toast', // Specific class for success
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // Red X for error
              secondary: '#fff',
            },
            // 3. REMOVED the conflicting borderLeft style
            // style: { borderLeft: '4px solid #EF4444' },
            className: 'custom-toast-alert error-toast', // Specific class for error
          },
          // You can add info and warning similarly if you use toast.info / toast.warning
          // warning: { ... },
          // info: { ... },
        }}
      >
        {/* 4. ADDED CUSTOM RENDERER FOR CLOSE BUTTON */}
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                <div className="flex-1 mr-4">{message}</div>
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>

      {publicRoutes.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  );
}

export default MyApp;

