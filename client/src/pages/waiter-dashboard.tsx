import { useState } from "react";
import WaiterHeader from "@/components/waiter/waiter-header";
import NewOrderTab from "@/components/waiter/new-order-tab";
import MyOrdersTab from "@/components/waiter/my-orders-tab";

type WaiterTab = "newOrder" | "myOrders";

export default function WaiterDashboard() {
  const [activeTab, setActiveTab] = useState<WaiterTab>("newOrder");

  const renderTabContent = () => {
    switch (activeTab) {
      case "newOrder":
        return <NewOrderTab />;
      case "myOrders":
        return <MyOrdersTab />;
      default:
        return <NewOrderTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WaiterHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
