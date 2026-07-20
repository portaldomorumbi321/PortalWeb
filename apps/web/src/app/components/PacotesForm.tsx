import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, Link2, Package2, Image } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Pacote {
  id: number;
  operador: string;
  origem: string;
  destino: string;
  link: string;
  descricao: string;
  foto: string | null;
  valor: number;
}

interface PacotesFormProps {
  pacotes: Pacote[];
  onPacotesChange: (pacotes: Pacote[]) => void;
}

const operadoresPadrao = [
  "HotelDO",
  "Decolar",
  "CVC",
  "Flytour",
  "Orinter",
  "Abreu",
  "Visual Turismo",
  "Diversa Turismo",
];

const pacoteVazio: Omit<Pacote, "id"> = {
  operador: "",
  origem: "",
  destino: "",
  link: "",
  descricao: "",
  foto: null,
  valor: 0,
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMoeda(valorTexto: string) {
  const limpo = valorTexto
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const valor = Number(limpo);
  return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

export default function PacotesForm({ pacotes, onPacotesChange }: PacotesFormProps) {
  const [form, setForm] = useState<Omit<Pacote, "id">>(pacoteVazio);
  const [valorInput, setValorInput] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formMinimizado, setFormMinimizado] = useState(true);

  const operadores = useMemo(
    () => Array.from(new Set([...operadoresPadrao, ...pacotes.map((item) => item.operador.trim()).filter(Boolean)])),
    [pacotes],
  );

  function limparFormulario() {
    setForm(pacoteVazio);
    setValorInput("");
    setEditandoId(null);
  }

  function salvarPacote() {
    if (!form.operador.trim()) {
      setErro("Informe o operador do pacote.");
      return;
    }

    if (editandoId !== null) {
      onPacotesChange(
        pacotes.map((item) =>
          item.id === editandoId
            ? {
                ...item,
                operador: form.operador.trim(),
                origem: form.origem.trim(),
                destino: form.destino.trim(),
                link: form.link.trim(),
                descricao: form.descricao.trim(),
                foto: form.foto,
                valor: form.valor,
              }
            : item,
        ),
      );
      limparFormulario();
      setErro("");
      return;
    }

    onPacotesChange([
      ...pacotes,
      {
        id: Date.now(),
        operador: form.operador.trim(),
        origem: form.origem.trim(),
        destino: form.destino.trim(),
        link: form.link.trim(),
        descricao: form.descricao.trim(),
        foto: form.foto,
        valor: form.valor,
      },
    ]);
    limparFormulario();
    setErro("");
  }

  function editarPacote(pacote: Pacote) {
    setFormMinimizado(false);
    setEditandoId(pacote.id);
    setForm({
      operador: pacote.operador || "",
      origem: pacote.origem || "",
      destino: pacote.destino || "",
      link: pacote.link || "",
      descricao: pacote.descricao || "",
      foto: pacote.foto || null,
      valor: Number(pacote.valor) || 0,
    });
    setValorInput(pacote.valor ? formatarMoeda(Number(pacote.valor) || 0) : "");
    setErro("");
  }

  function removerPacote(id: number) {
    onPacotesChange(pacotes.filter((item) => item.id !== id));
    if (editandoId === id) {
      limparFormulario();
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-gray-900">
            <Package2 className="h-4 w-4 text-indigo-500" />
            {editandoId !== null ? "Editar pacote" : "Adicionar pacote"}
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFormMinimizado((prev) => !prev)}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            {formMinimizado ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            {formMinimizado ? "Maximizar" : "Minimizar"}
          </Button>
        </div>

        {!formMinimizado && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs">Operador *</Label>
                <Input
                  className="mt-1"
                  placeholder="Selecione da lista ou digite"
                  value={form.operador}
                  onChange={(e) => setForm((prev) => ({ ...prev, operador: e.target.value }))}
                  list="lista-operadores-pacotes"
                />
                <datalist id="lista-operadores-pacotes">
                  {operadores.map((operador) => (
                    <option key={operador} value={operador} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs">Link</Label>
                <div className="relative mt-1">
                  <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="https://..."
                    className="pl-8"
                    value={form.link}
                    onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Origem</Label>
                <Input
                  className="mt-1"
                  placeholder="Ex: São Paulo"
                  value={form.origem}
                  onChange={(e) => setForm((prev) => ({ ...prev, origem: e.target.value }))}
                />
              </div>

              <div>
                <Label className="text-xs">Destino</Label>
                <Input
                  className="mt-1"
                  placeholder="Ex: Lisboa"
                  value={form.destino}
                  onChange={(e) => setForm((prev) => ({ ...prev, destino: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs">Descrição</Label>
                <textarea
                  rows={3}
                  placeholder="Detalhes do pacote"
                  value={form.descricao}
                  onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs">Foto (URL)</Label>
                <div className="relative mt-1">
                  <Image className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="https://media.staticontent.com/media/pictures/..."
                    className="pl-8"
                    value={form.foto || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, foto: e.target.value.trim() || null }))}
                  />
                </div>
                {form.foto && (
                  <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
                    <img src={form.foto} alt="Prévia da foto do pacote" className="h-28 w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={valorInput}
                  onChange={(e) => {
                    const texto = e.target.value;
                    setValorInput(texto);
                    setForm((prev) => ({ ...prev, valor: parseMoeda(texto) }));
                  }}
                  onBlur={() => {
                    setValorInput(form.valor > 0 ? formatarMoeda(form.valor) : "");
                  }}
                  className="mt-1"
                />
              </div>
            </div>

            {erro && <p className="mt-3 text-xs text-red-500">{erro}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={salvarPacote} className="gap-2">
                <Plus className="h-4 w-4" />
                {editandoId !== null ? "Salvar pacote" : "Adicionar pacote"}
              </Button>
              {editandoId !== null && (
                <Button type="button" variant="outline" onClick={limparFormulario}>
                  Cancelar edição
                </Button>
              )}
            </div>
          </>
        )}
      </Card>

      <div className="space-y-3">
        {pacotes.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            Nenhum pacote adicionado.
          </p>
        )}

        {pacotes.map((pacote, index) => (
          <Card key={pacote.id} className="p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-400">Pacote {index + 1}</p>
                <p className="font-semibold text-gray-900">{pacote.operador || "Sem operador"}</p>
                {(pacote.origem || pacote.destino) && (
                  <p className="text-xs text-gray-500 mt-0.5">{pacote.origem || "Origem"} -&gt; {pacote.destino || "Destino"}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => editarPacote(pacote)}
                  className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                  title="Editar pacote"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removerPacote(pacote.id)}
                  className="rounded p-1.5 text-red-500 hover:bg-red-50"
                  title="Remover pacote"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {pacote.link && (
              <a
                href={pacote.link}
                target="_blank"
                rel="noreferrer"
                className="mb-2 inline-flex max-w-full items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="truncate">{pacote.link}</span>
              </a>
            )}

            {pacote.foto && (
              <div className="mb-2 overflow-hidden rounded-md border border-gray-200">
                <img src={pacote.foto} alt={`Foto do pacote ${pacote.operador || index + 1}`} className="h-40 w-full object-cover" />
              </div>
            )}

            {pacote.descricao && <p className="text-sm text-gray-600">{pacote.descricao}</p>}
            {Number(pacote.valor) > 0 && (
              <p className="mt-1 text-sm font-semibold text-emerald-700">{formatarMoeda(Number(pacote.valor) || 0)}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
