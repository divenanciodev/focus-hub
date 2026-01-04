import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { mockPlans } from '@/data/mockData';
import { Check, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function Planos() {
  const [selectedPlan, setSelectedPlan] = useState<typeof mockPlans[0] | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSelectPlan = (plan: typeof mockPlans[0]) => {
    setSelectedPlan(plan);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPlan = () => {
    // Simulate plan selection
    setIsConfirmModalOpen(false);
    // Show success message (in real app, would integrate with payment)
  };

  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Grátis';
    if (period === 'yearly') {
      const monthly = price / 12;
      return (
        <div className="text-center">
          <span className="text-3xl font-bold">R$ {monthly.toFixed(2)}</span>
          <span className="text-muted-foreground">/mês</span>
          <p className="text-sm text-muted-foreground mt-1">
            R$ {price.toFixed(2)} por ano
          </p>
        </div>
      );
    }
    return (
      <div className="text-center">
        <span className="text-3xl font-bold">R$ {price.toFixed(2)}</span>
        <span className="text-muted-foreground">/mês</span>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Planos & Assinaturas"
        description="Escolha o plano ideal para você"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {mockPlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative bg-card border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg',
              plan.popular
                ? 'border-foreground shadow-md scale-105'
                : 'border-border hover:border-foreground/30'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                  <Star className="w-3 h-3" />
                  Mais popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              {formatPrice(plan.price, plan.period)}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/10 flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? 'default' : 'outline'}
              className="w-full"
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.price === 0 ? 'Começar grátis' : 'Selecionar plano'}
            </Button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar assinatura</DialogTitle>
            <DialogDescription>
              Você está selecionando o plano {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="py-4">
              <div className="bg-secondary rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Plano</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor</span>
                  <span className="font-semibold">
                    {selectedPlan.price === 0
                      ? 'Grátis'
                      : `R$ ${selectedPlan.price.toFixed(2)}/${
                          selectedPlan.period === 'monthly' ? 'mês' : 'ano'
                        }`}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {selectedPlan.price > 0
                  ? 'Ao confirmar, você será redirecionado para o pagamento.'
                  : 'Você terá acesso imediato aos recursos gratuitos.'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPlan}>
              {selectedPlan?.price === 0 ? 'Confirmar' : 'Ir para pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
