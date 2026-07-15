import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  FileText,
  Lightbulb,
  Sparkles,
  Loader2,
} from "lucide-react";

interface RoteiroFormProps {
  roteiro: string;
  onRoteiroChange: (roteiro: string) => void;
}

export default function RoteiroForm({
  roteiro,
  onRoteiroChange,
}: RoteiroFormProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          Roteiro da Viagem (Texto)
        </h4>

        <p className="text-sm text-gray-600 mb-4">
          Descreva o roteiro detalhado da viagem, incluindo datas, horários,
          atividades e informações importantes para o viajante.
        </p>

        {/* Campo de texto para o roteiro */}
        <div>
          <textarea
            value={roteiro}
            onChange={(e) => onRoteiroChange(e.target.value)}
            placeholder="Ex: Dia 1 - Chegada em Paris (15/07)&#10;• Chegada ao Aeroporto Charles de Gaulle às 10h&#10;• Transfer para o Hotel Le Marais&#10;• Tarde livre para explorar o bairro&#10;• Jantar no Le Comptoir du Relais&#10;&#10;Dia 2 - Paris Histórico (16/07)&#10;• Café da manhã no hotel&#10;• Visita ao Museu do Louvre (9h-12h)&#10;• Almoço no bairro Saint-Germain&#10;• Passeio pelo Rio Sena (barco)&#10;• Jantar no restaurante local..."
            rows={15}
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-y"
          />
        </div>

      </Card>
    </div>
  );
}