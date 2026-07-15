import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Plus, Trash2, Calendar, Sun, CloudMoon, Sunrise, Sunset } from "lucide-react";
import { useRef } from "react";

interface Atividade {
  id: number;
  hora: string;
  descricao: string;
  tipo: string;
}

interface Dia {
  id: number;
  data: string;
  titulo: string;
  atividades: Atividade[];
}

interface DayByDayFormProps {
  dayByDay: Dia[];
  onDayByDayChange: (dayByDay: Dia[]) => void;
}

const tiposAtividade = [
  "Café da Manhã",
  "Passeio",
  "Almoço",
  "Visita Técnica",
  "Descanso",
  "Jantar",
  "Livre",
  "Evento",
  "Deslocamento",
  "Outro",
];

const iconeTipo = (tipo: string) => {
  switch (tipo) {
    case "Café da Manhã": return <Sunrise className="w-3 h-3" />;
    case "Almoço":
    case "Jantar": return <Sun className="w-3 h-3" />;
    case "Livre":
    case "Descanso": return <CloudMoon className="w-3 h-3" />;
    case "Evento":
    case "Passeio":
    case "Visita Técnica": return <Sunset className="w-3 h-3" />;
    default: return <Calendar className="w-3 h-3" />;
  }
};

export default function DayByDayForm({
  dayByDay,
  onDayByDayChange,
}: DayByDayFormProps) {
  const [novoDia, setNovoDia] = useState<Dia>({
    id: 0,
    data: "",
    titulo: "",
    atividades: [],
  });
  const [erro, setErro] = useState("");

  const adicionarAtividade = () => {
    const novaAtividade: Atividade = {
      id: Date.now(),
      hora: "",
      descricao: "",
      tipo: "",
    };
    setNovoDia({ ...novoDia, atividades: [...novoDia.atividades, novaAtividade] });
  };

  const removerAtividade = (id: number) => {
    setNovoDia({
      ...novoDia,
      atividades: novoDia.atividades.filter((a) => a.id !== id),
    });
  };

  const atualizarAtividade = (id: number, field: keyof Atividade, value: string) => {
    setNovoDia({
      ...novoDia,
      atividades: novoDia.atividades.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  const adicionarDia = () => {
    if (!novoDia.titulo.trim()) {
      setErro("Preencha o título do dia.");
      return;
    }
    if (novoDia.atividades.length === 0) {
      setErro("Adicione pelo menos uma atividade para o dia.");
      return;
    }
    if (novoDia.atividades.some((a) => !a.descricao.trim())) {
      setErro("Todas as atividades precisam ter uma descrição.");
      return;
    }

    const diaParaAdicionar: Dia = {
      ...novoDia,
      id: Date.now(),
    };

    onDayByDayChange([...dayByDay, diaParaAdicionar]);

    setNovoDia({ id: 0, data: "", titulo: "", atividades: [] });
    setErro("");
  };

  const removerDia = (id: number) => {
    onDayByDayChange(dayByDay.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Formulário para adicionar novo dia */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Adicionar Dia
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs">
              Título do Dia <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Ex: Dia 1 - Chegada em Paris"
              value={novoDia.titulo}
              onChange={(e) => setNovoDia({ ...novoDia, titulo: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Data</Label>
            <Input
              type="date"
              value={novoDia.data}
              onChange={(e) => setNovoDia({ ...novoDia, data: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Atividades do dia */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium">Atividades do Dia</Label>
            <Button
              onClick={adicionarAtividade}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              Atividade
            </Button>
          </div>

          {novoDia.atividades.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-300 rounded-lg">
              Nenhuma atividade adicionada. Clique em "Atividade" para adicionar.
            </p>
          )}

          <div className="space-y-2">
            {novoDia.atividades.map((atv, idx) => (
              <div
                key={atv.id}
                className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 min-w-[60px]">
                      Atividade {idx + 1}
                    </span>
                    <select
                      value={atv.tipo}
                      onChange={(e) =>
                        atualizarAtividade(atv.id, "tipo", e.target.value)
                      }
                      className="flex-1 rounded-md border border-input bg-white px-2 py-1 text-xs"
                    >
                      <option value="">Tipo</option>
                      {tiposAtividade.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="time"
                      placeholder="Hora"
                      value={atv.hora}
                      onChange={(e) =>
                        atualizarAtividade(atv.id, "hora", e.target.value)
                      }
                      className="w-28 text-xs"
                    />
                    <button
                      onClick={() => removerAtividade(atv.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    placeholder="Descrição da atividade"
                    value={atv.descricao}
                    onChange={(e) =>
                      atualizarAtividade(atv.id, "descricao", e.target.value)
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

        <Button
          onClick={adicionarDia}
          className="w-full gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Adicionar Dia ao Roteiro
        </Button>
      </Card>

      {/* Lista de dias adicionados */}
      {dayByDay.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500" />
            Dias do Roteiro ({dayByDay.length})
          </h4>
          <div className="space-y-3">
            {dayByDay.map((dia, idx) => (
              <div
                key={dia.id}
                className="border-l-4 border-purple-500 pl-3 py-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {dia.titulo}
                      </span>
                      {dia.data && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {new Date(dia.data).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      {dia.atividades.map((atv) => (
                        <div
                          key={atv.id}
                          className="flex items-start gap-2 text-xs text-gray-600"
                        >
                          <span className="flex items-center gap-1 min-w-[80px] text-gray-400 font-medium">
                            {iconeTipo(atv.tipo)}
                            {atv.hora || "--:--"}
                          </span>
                          {atv.tipo && (
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                              {atv.tipo}
                            </span>
                          )}
                          <span>{atv.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removerDia(dia.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-3 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {dayByDay.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum dia adicionado. Preencha o formulário acima para criar o roteiro dia a dia.
        </div>
      )}
    </div>
  );
}