import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, Plus, Minus, MessageSquare, Send } from "lucide-react";
import type { Table as TableType, Food } from "@shared/schema";

interface OrderItem extends Food {
  quantity: number;
  observations?: string;
}

export default function NewOrderTab() {
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderNotes, setOrderNotes] = useState("");
  const { toast } = useToast();

  const { data: tables } = useQuery({
    queryKey: ["/api/tables"],
  });

  const { data: foods } = useQuery({
    queryKey: ["/api/foods"],
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest("POST", "/api/orders", orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setOrderItems([]);
      setSelectedTable(null);
      setOrderNotes("");
      toast({
        title: "Sucesso",
        description: "Pedido enviado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar pedido",
        variant: "destructive",
      });
    },
  });

  const availableTables = tables?.filter((table: TableType) => table.status === "available") || [];
  const filteredFoods = foods?.filter((food: Food) => 
    selectedCategory === "all" || food.category === selectedCategory
  ) || [];

  const categories = [
    { id: "all", label: "Todos" },
    { id: "Entradas", label: "Entradas" },
    { id: "Pratos Principais", label: "Pratos Principais" },
    { id: "Bebidas", label: "Bebidas" },
    { id: "Sobremesas", label: "Sobremesas" },
  ];

  const updateQuantity = (foodId: number, change: number) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.id === foodId);
      if (existing) {
        const newQuantity = existing.quantity + change;
        if (newQuantity <= 0) {
          return prev.filter(item => item.id !== foodId);
        }
        return prev.map(item =>
          item.id === foodId ? { ...item, quantity: newQuantity } : item
        );
      } else if (change > 0) {
        const food = foods?.find((f: Food) => f.id === foodId);
        if (food) {
          return [...prev, { ...food, quantity: 1 }];
        }
      }
      return prev;
    });
  };

  const getItemQuantity = (foodId: number) => {
    return orderItems.find(item => item.id === foodId)?.quantity || 0;
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => 
      total + (parseFloat(item.price) * item.quantity), 0
    ).toFixed(2);
  };

  const handleSubmitOrder = () => {
    if (!selectedTable || orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione uma mesa e adicione itens ao pedido",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      tableId: selectedTable.id,
      items: orderItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        observations: item.observations || ""
      })),
      total: getTotalPrice(),
      notes: orderNotes,
      status: "pending"
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="space-y-6">
      {/* Table Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Mesa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {availableTables.map((table: TableType) => (
              <Button
                key={table.id}
                variant={selectedTable?.id === table.id ? "default" : "outline"}
                className="aspect-square flex flex-col items-center justify-center p-4 h-auto"
                onClick={() => setSelectedTable(table)}
              >
                <Table className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{table.name}</span>
                <span className="text-xs text-green-600">Disponível</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Selection */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cardápio</CardTitle>
              <Badge>Mesa selecionada: {selectedTable.name}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFoods.map((item: Food) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex space-x-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <span className="text-lg font-bold text-primary">R$ {item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={getItemQuantity(item.id) === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {getItemQuantity(item.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.quantity}x</span>
                    </div>
                    {item.observations && (
                      <p className="text-sm text-gray-500">{item.observations}</p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 ml-4">
                    R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                <span>Total:</span>
                <span>R$ {getTotalPrice()}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Textarea
                placeholder="Observações gerais do pedido..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="resize-none h-20"
              />
              <Button
                onClick={handleSubmitOrder}
                className="w-full"
                size="lg"
                disabled={createOrderMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {createOrderMutation.isPending ? "Enviando..." : "Enviar Pedido"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
