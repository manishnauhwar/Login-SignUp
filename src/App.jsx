import AppRouter from "./routes/Router";
import { ThemeProvider } from "./utils/ThemeContext";
import { LanguageProvider } from "./utils/LanguageContext";
import { NotificationProvider, useNotifications } from "./utils/NotificationContext";
import ToastContainer from "./components/Notification/ToastContainer";
import ResetPassword from "./components/login/ResetPassword";

const NotificationToastWrapper = () => {
  const { toasts, removeToast } = useNotifications();
  return <ToastContainer toasts={toasts} removeToast={removeToast} />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppRouter />
          <NotificationToastWrapper />
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
