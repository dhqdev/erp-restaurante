import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import WaiterDashboard from "@/pages/waiter-dashboard";
import NotFound from "@/pages/not-found";
import TrialExpiredModal from "@/components/modals/trial-expired-modal";
import { useTrial } from "@/hooks/use-trial";

function AuthenticatedApp() {
  const { user, trialDaysLeft, isLoading, isAuthenticated, logout } = useAuth();
  const { showTrialModal, closeTrialModal, redirectToPayment } = useTrial(trialDaysLeft);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <Switch>
        <Route path="/">
          {user?.role === "admin" ? <AdminDashboard /> : <WaiterDashboard />}
        </Route>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/waiter" component={WaiterDashboard} />
        <Route component={NotFound} />
      </Switch>
      
      <TrialExpiredModal
        isOpen={showTrialModal}
        onClose={closeTrialModal}
        onPayment={redirectToPayment}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
