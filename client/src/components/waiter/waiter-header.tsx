import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Utensils, LogOut, Plus, List } from "lucide-react";

interface WaiterHeaderProps {
  activeTab: string;
  onTabChange: (tab: "newOrder" | "myOrders") => void;
}

export default function WaiterHeader({ activeTab, onTabChange }: WaiterHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Utensils className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">RestaurantePro</h1>
            <Badge className="ml-3 bg-green-100 text-green-800">Garçom</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-1 pb-4">
          <Button
            variant={activeTab === "newOrder" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => onTabChange("newOrder")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
          <Button
            variant={activeTab === "myOrders" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => onTabChange("myOrders")}
          >
            <List className="mr-2 h-4 w-4" />
            Meus Pedidos
          </Button>
        </div>
      </div>
    </header>
  );
}
