import { Card } from "./ui/card";
import { useEffect, useRef } from "react";

interface RoteiroFormProps {
  roteiro: string;
  onRoteiroChange: (roteiro: string) => void;
}


export default function RoteiroForm({
  roteiro,
  onRoteiroChange,
}: RoteiroFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [roteiro]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div>
          <textarea
            ref={textareaRef}
            value={roteiro}
            onChange={(e) => onRoteiroChange(e.target.value)}
            placeholder="Ex: Dia 1 - Chegada em Paris (15/07)&#10;• Chegada ao Aeroporto Charles de Gaulle às 10h&#10;• Transfer para o Hotel Le Marais&#10;• Tarde livre para explorar o bairro&#10;• Jantar no Le Comptoir du Relais&#10;&#10;Dia 2 - Paris Histórico (16/07)&#10;• Café da manhã no hotel&#10;• Visita ao Museu do Louvre (9h-12h)&#10;• Almoço no bairro Saint-Germain&#10;• Passeio pelo Rio Sena (barco)&#10;• Jantar no restaurante local..."
            rows={1}
            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-4 py-3 text-[15px] leading-7 text-sky-900 placeholder:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400 resize-none overflow-hidden shadow-sm"
            style={{ fontFamily: "'Cambria', 'Palatino Linotype', 'Book Antiqua', serif" }}
          />
        </div>

      </Card>
    </div>
  );
}