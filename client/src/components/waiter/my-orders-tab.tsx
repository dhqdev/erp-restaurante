import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@shared/schema";

export default function MyOrdersTab() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "preparing":
        return <Badge className="bg-blue-100 text-blue-800">Preparando</Badge>;
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Pronto</Badge>;
      case "delivered":
        return <Badge className="bg-gray-100 text-gray-800">Entregue</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum pedido encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Order) => (
        <Card key={order.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Pedido #{order.id}</h4>
                <p className="text-sm text-gray-600">
                  Mesa {order.tableId} • {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(order.status)}
                <p className="text-lg font-bold text-gray-900 mt-1">R$ {order.total}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {Array.isArray(order.items) ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Itens não disponíveis</p>
              )}
            </div>
            
            {order.notes && (
              <div className="text-sm text-gray-600">
                <strong>Observações:</strong> {order.notes}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
