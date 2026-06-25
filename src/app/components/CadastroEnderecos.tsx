import { useState } from "react";
import { Search, Plus, Edit2, Trash2, MapPin, X, Check, Home, Building } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

interface Endereco {
  id: number;
  tipo: "Residencial" | "Comercial" | "Cobrança" | "Entrega";
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  referencia: string;
  status: "Ativo" | "Inativo";
}

const dados: Endereco[] = [
  { id: 1, tipo: "Comercial", logradouro: "Av. Paulista", numero: "1000", complemento: "Sala 501", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100", referencia: "Próx. ao MASP", status: "Ativo" },
  { id: 2, tipo: "Residencial", logradouro: "Rua das Flores", numero: "42", complemento: "Apto 3B", bairro: "Jardins", cidade: "Campinas", estado: "SP", cep: "13010-050", referencia: "", status: "Ativo" },
  { id: 3, tipo: "Entrega", logradouro: "Rod. Anhanguera", numero: "km 95", complemento: "Galpão 2", bairro: "Industrial", cidade: "Sumaré", estado: "SP", cep: "13175-000", referencia: "Portão azul", status: "Ativo" },
  { id: 4, tipo: "Cobrança", logradouro: "Rua XV de Novembro", numero: "200", complemento: "", bairro: "Centro", cidade: "Curitiba", estado: "PR", cep: "80020-310", referencia: "", status: "Inativo" },
];

const tipos = ["Residencial", "Comercial", "Cobrança", "Entrega"] as const;
const vazio: Omit<Endereco, "id"> = { tipo: "Comercial", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "", referencia: "", status: "Ativo" };

const tipoCores: Record<string, string> = {
  Residencial: "bg-blue-100 text-blue-700",
  Comercial: "bg-orange-100 text-orange-700",
  Cobrança: "bg-yellow-100 text-yellow-700",
  Entrega: "bg-teal-100 text-teal-700",
};

export default function CadastroEnderecos() {
  const [itens, setItens] = useState<Endereco[]>(dados);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Endereco | null>(null);
  const [form, setForm] = useState<Omit<Endereco, "id">>(vazio);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  const filtrados = itens.filter((e) => {
    const t = busca.toLowerCase();
    const match =
      e.logradouro.toLowerCase().includes(t) ||
      e.bairro.toLowerCase().includes(t) ||
      e.cidade.toLowerCase().includes(t) ||
      e.cep.includes(t);
    const matchStatus = filtroStatus === "Todos" || e.status === filtroStatus;
    const matchTipo = filtroTipo === "Todos" || e.tipo === filtroTipo;
    return match && matchStatus && matchTipo;
  });

  function abrirNovo() { setEditando(null); setForm(vazio); setModalAberto(true); }
  function abrirEdicao(e: Endereco) { setEditando(e); setForm({ tipo: e.tipo, logradouro: e.logradouro, numero: e.numero, complemento: e.complemento, bairro: e.bairro, cidade: e.cidade, estado: e.estado, cep: e.cep, referencia: e.referencia, status: e.status }); setModalAberto(true); }
  function fechar() { setModalAberto(false); setEditando(null); }

  function salvar() {
    if (!form.logradouro.trim()) return;
    if (editando) {
      setItens((prev) => prev.map((e) => (e.id === editando.id ? { ...editando, ...form } : e)));
    } else {
      const id = itens.length > 0 ? Math.max(...itens.map((e) => e.id)) + 1 : 1;
      setItens((prev) => [...prev, { id, ...form }]);
    }
    fechar();
  }

  function excluir(id: number) { setItens((prev) => prev.filter((e) => e.id !== id)); setConfirmarExclusao(null); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Endereços</h1>
          <p className="text-sm text-gray-500 mt-1">{itens.length} endereços cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4" /> Novo Endereço
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por logradouro, bairro, cidade, CEP..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(["Todos", "Ativo", "Inativo"] as const).map((f) => (
            <button key={f} onClick={() => setFiltroStatus(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${filtroStatus === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{f}</button>
          ))}
          <span className="border-l border-gray-200 mx-1" />
          {["Todos", ...tipos].map((t) => (
            <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${filtroTipo === t ? "bg-gray-700 text-white border-gray-700" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{t}</button>
          ))}
        </div>
        {busca && <p className="text-xs text-gray-500 mt-2">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>}
      </Card>

      {/* Cards em grid */}
      {filtrados.length === 0 ? (
        <Card className="py-12 text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Nenhum endereço encontrado</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                    {item.tipo === "Residencial" ? <Home className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tipoCores[item.tipo]}`}>{item.tipo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={item.status === "Ativo" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-600 hover:bg-red-100"}>{item.status}</Badge>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <p className="font-semibold text-gray-900">{item.logradouro}, {item.numero}{item.complemento ? ` — ${item.complemento}` : ""}</p>
                <p className="text-sm text-gray-500">{item.bairro}</p>
                <p className="text-sm text-gray-600">{item.cidade} — {item.estado} · CEP {item.cep}</p>
                {item.referencia && <p className="text-xs text-gray-400 italic">{item.referencia}</p>}
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                {confirmarExclusao === item.id ? (
                  <>
                    <span className="text-xs text-gray-500 mr-1">Excluir?</span>
                    <button onClick={() => excluir(item.id)} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmarExclusao(null)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => abrirEdicao(item)} className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmarExclusao(item.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={fechar} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Endereço" : "Novo Endereço"}</h2>
              <button onClick={fechar} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid gap-4">
              <div>
                <Label>Tipo de Endereço</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tipos.map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t })} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${form.tipo === t ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="logradouro">Logradouro *</Label>
                <Input id="logradouro" value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} placeholder="Rua, Av., Rod..." className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="123" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Apto, Sala..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} placeholder="Bairro" className="mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="estado">UF</Label>
                  <Input id="estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="referencia">Ponto de Referência</Label>
                <Input id="referencia" value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} placeholder="Próximo a..." className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-1">
                  {(["Ativo", "Inativo"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${form.status === s ? s === "Ativo" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fechar}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.logradouro.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">{editando ? "Salvar alterações" : "Cadastrar"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
