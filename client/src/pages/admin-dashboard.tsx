import { useState } from "react";
import AdminHeader from "@/components/admin/admin-header";
import DashboardTab from "@/components/admin/dashboard-tab";
import UsersTab from "@/components/admin/users-tab";
import MenuTab from "@/components/admin/menu-tab";
import TablesTab from "@/components/admin/tables-tab";
import OrdersTab from "@/components/admin/orders-tab";
import FinancialTab from "@/components/admin/financial-tab";
import { Button } from "@/components/ui/button";
import { ChartLine, Users, Utensils, Table, Receipt, BarChart3 } from "lucide-react";

type AdminTab = "dashboard" | "users" | "menu" | "tables" | "orders" | "financial";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: ChartLine },
    { id: "users" as const, label: "Usuários", icon: Users },
    { id: "menu" as const, label: "Cardápio", icon: Utensils },
    { id: "tables" as const, label: "Mesas", icon: Table },
    { id: "orders" as const, label: "Pedidos", icon: Receipt },
    { id: "financial" as const, label: "Financeiro", icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "users":
        return <UsersTab />;
      case "menu":
        return <MenuTab />;
      case "tables":
        return <TablesTab />;
      case "orders":
        return <OrdersTab />;
      case "financial":
        return <FinancialTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
