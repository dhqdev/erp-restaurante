import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import MenuItemModal from "@/components/modals/menu-item-modal";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Food } from "@shared/schema";

export default function MenuTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Food | null>(null);
  const { toast } = useToast();

  const { data: foods, isLoading } = useQuery({
    queryKey: ["/api/foods"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/foods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir item",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: Food) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const foodsArray = foods as Food[] || [];
  const totalItems = foodsArray.length;
  const activeItems = foodsArray.filter((f: Food) => f.active).length;
  const inactiveItems = foodsArray.filter((f: Food) => !f.active).length;
  const categories = Array.from(new Set(foodsArray.map((f: Food) => f.category)));
  const averagePrice = foodsArray.length > 0 
    ? (foodsArray.reduce((sum: number, f: Food) => sum + parseFloat(f.price), 0) / foodsArray.length).toFixed(2)
    : "0.00";

  return (
    <>
      {/* Resumo do Cardápio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Preço Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {averagePrice}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Categorias ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {category} ({foods?.filter(f => f.category === category).length})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Cardápio</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!foods || foods.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum item encontrado
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((item: Food) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <span className="text-lg font-bold text-primary">R$ {item.price}</span>
                    </div>
                    <Badge>{item.category}</Badge>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MenuItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={editingItem}
      />
    </>
  );
}
