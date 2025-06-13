import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
}

export default function TrialExpiredModal({ isOpen, onClose, onPayment }: TrialExpiredModalProps) {
  const features = [
    "Usuários ilimitados",
    "Relatórios completos",
    "Suporte prioritário",
    "Backup automático",
    "Integração completa"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 p-2">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Período de Teste Expirado
            </h3>
            <p className="text-gray-600 text-sm">
              Seu período de teste de 7 dias chegou ao fim. Continue usando o RestaurantePro com nossa assinatura mensal.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Plano Mensal</span>
              <span className="text-2xl font-bold text-primary">R$ 99/mês</span>
            </div>
            
            <ul className="space-y-2 text-sm text-gray-600">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onPayment}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Assinar Agora
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continuar Navegando
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Você será redirecionado para nossa página de pagamento segura
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
