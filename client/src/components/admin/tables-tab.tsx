import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TableModal from "@/components/modals/table-modal";
import { Plus, Edit, Trash2, Table } from "lucide-react";
import type { Table as TableType } from "@shared/schema";

export default function TablesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const { toast } = useToast();

  const { data: tables, isLoading } = useQuery({
    queryKey: ["/api/tables"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "Sucesso",
        description: "Mesa excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir mesa",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (table: TableType) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta mesa?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
      case "occupied":
        return <Badge className="bg-red-100 text-red-800">Ocupada</Badge>;
      case "reserved":
        return <Badge className="bg-yellow-100 text-yellow-800">Reservada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Mesas</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Mesa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!tables || tables.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma mesa encontrada
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table: TableType) => (
                <div key={table.id} className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow relative">
                  <div className="h-16 w-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Table className="h-6 w-6 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{table.name}</h4>
                  {getStatusBadge(table.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    {table.capacity} lugares
                  </p>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEdit(table)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDelete(table.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TableModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        table={editingTable}
      />
    </>
  );
}
