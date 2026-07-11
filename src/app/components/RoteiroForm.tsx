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
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Sugestões de integração com API de IA para gerar roteiros automaticamente
  const gerarRoteiroAutomatico = async () => {
    setCarregando(true);
    setErro("");

    try {
      // TODO: Integrar com API de IA (ex: OpenAI, Gemini, etc.)
      // Exemplo de integração:
      // const response = await fetch("https://api.openai.com/v1/chat/completions", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      //   },
      //   body: JSON.stringify({
      //     model: "gpt-4",
      //     messages: [
      //       {
      //         role: "system",
      //         content: "Você é um especialista em roteiros de viagem. Gere um roteiro detalhado.",
      //       },
      //       {
      //         role: "user",
      //         content: `Crie um roteiro de viagem detalhado com base nas informações fornecidas.`,
      //       },
      //     ],
      //   }),
      // });
      // const data = await response.json();
      // const roteiroGerado = data.choices[0].message.content;

      // Fallback manual enquanto não houver API configurada
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setErro(
        "API de IA não configurada. Adicione VITE_OPENAI_API_KEY no .env para gerar roteiros automaticamente, ou digite manualmente abaixo."
      );
    } catch (err) {
      console.error("Erro ao gerar roteiro:", err);
      setErro(
        "Erro ao gerar roteiro automaticamente. Você pode digitá-lo manualmente abaixo."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          Roteiro da Viagem
        </h4>

        <p className="text-sm text-gray-600 mb-4">
          Descreva o roteiro detalhado da viagem, incluindo datas, horários,
          atividades e informações importantes para o viajante.
        </p>

        {/* Sugestão de integração com IA */}
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                Sugestão: Geração Automática com IA
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Integre com APIs como OpenAI GPT, Google Gemini ou Claude para
                gerar roteiros automaticamente com base nos dados do orçamento
                (destino, datas, hospedagem, voos, etc.).
              </p>
              <Button
                onClick={gerarRoteiroAutomatico}
                disabled={carregando}
                variant="outline"
                size="sm"
                className="mt-2 text-purple-700 border-purple-300 hover:bg-purple-100"
              >
                {carregando ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar roteiro com IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Campo de texto para o roteiro */}
        <div>
          <Label className="text-xs">
            Descrição do Roteiro
          </Label>
          <textarea
            value={roteiro}
            onChange={(e) => onRoteiroChange(e.target.value)}
            placeholder="Ex: Dia 1 - Chegada em Paris (15/07)&#10;• Chegada ao Aeroporto Charles de Gaulle às 10h&#10;• Transfer para o Hotel Le Marais&#10;• Tarde livre para explorar o bairro&#10;• Jantar no Le Comptoir du Relais&#10;&#10;Dia 2 - Paris Histórico (16/07)&#10;• Café da manhã no hotel&#10;• Visita ao Museu do Louvre (9h-12h)&#10;• Almoço no bairro Saint-Germain&#10;• Passeio pelo Rio Sena (barco)&#10;• Jantar no restaurante local..."
            rows={15}
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-y"
          />
        </div>

        {erro && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{erro}</p>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-400">
          {roteiro.length > 0
            ? `${roteiro.split("\n").length} linhas, ${roteiro.length} caracteres`
            : "Nenhum roteiro digitado ainda."}
        </div>
      </Card>

      {/* Preview do roteiro quando houver conteúdo */}
      {roteiro.trim() && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Pré-visualização do Roteiro
          </h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {roteiro}
          </div>
        </Card>
      )}
    </div>
  );
}