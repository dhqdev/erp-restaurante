import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Utensils, LogOut } from "lucide-react";

export default function AdminHeader() {
  const { user, trialDaysLeft, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Utensils className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">RestaurantePro</h1>
            <Badge className="ml-3">Admin</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Teste expira em: <span className="font-semibold text-red-600">{trialDaysLeft} dias</span>
            </div>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
