import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Phone, Mail, Globe, X, Building, MapPin } from "lucide-react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  atualizarFornecedor,
  criarFornecedor,
  listarFornecedores,
  type Fornecedor,
  type FornecedorPayload,
} from "../data/fornecedoresApi";

const vazio: FornecedorPayload = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
  cep: "",
  endereco: "",
  complemento: "",
  cidade: "",
  estado: "",
  status: "Ativo",
  categoria: "",
};

export default function CadastroFornecedores() {
  const [itens, setItens] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState(vazio);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarFornecedores() {
    setErro(null);
    try {
      const lista = await listarFornecedores();
      setItens(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar fornecedores.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const filtrados = itens.filter((f) => {
    const t = busca.toLowerCase();
    const match =
      f.razaoSocial.toLowerCase().includes(t) ||
      f.nomeFantasia.toLowerCase().includes(t) ||
      f.cnpj.includes(t) ||
      f.email.toLowerCase().includes(t) ||
      f.cep.includes(t) ||
      f.endereco.toLowerCase().includes(t) ||
      f.categoria.toLowerCase().includes(t);
    return match && (filtroStatus === "Todos" || f.status === filtroStatus);
  });

  function abrirNovo() { setErro(null); setEditando(null); setForm(vazio); setModalAberto(true); }
  function abrirEdicao(item: Fornecedor) {
    setErro(null);
    setEditando(item);
    setForm({
      razaoSocial: item.razaoSocial,
      nomeFantasia: item.nomeFantasia,
      cnpj: item.cnpj,
      email: item.email,
      telefone: item.telefone,
      cep: item.cep,
      endereco: item.endereco,
      complemento: item.complemento,
      cidade: item.cidade,
      estado: item.estado,
      status: item.status,
      categoria: item.categoria,
    });
    setModalAberto(true);
  }
  function fechar() { setModalAberto(false); setEditando(null); }

  function normalizarTelefoneWhatsApp(telefone: string) {
    const digitos = telefone.replace(/\D/g, "");

    if (!digitos) return null;

    if (digitos.startsWith("55") && digitos.length >= 12) {
      return digitos;
    }

    if (digitos.length === 10 || digitos.length === 11) {
      return `55${digitos}`;
    }

    return digitos;
  }

  function linkWhatsApp(telefone: string) {
    const numero = normalizarTelefoneWhatsApp(telefone);
    if (!numero) return null;
    return `https://wa.me/${numero}`;
  }

  async function buscarEnderecoPorCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);
    setErro(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error("Falha ao consultar CEP.");
      }

      const data = await response.json();

      if (data?.erro) {
        setErro("CEP não encontrado.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        cep: `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`,
        endereco: data.logradouro || prev.endereco,
        complemento: prev.complemento || data.complemento || "",
        cidade: data.localidade || prev.cidade,
        estado: String(data.uf || prev.estado).toUpperCase().slice(0, 2),
      }));
    } catch {
      setErro("Não foi possível buscar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function salvar() {
    if (!form.razaoSocial.trim()) return;

    setSalvando(true);
    setErro(null);

    try {
      const payload: FornecedorPayload = {
        ...form,
        razaoSocial: form.razaoSocial.trim(),
        nomeFantasia: form.nomeFantasia.trim(),
        cnpj: form.cnpj.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        cep: form.cep.trim(),
        endereco: form.endereco.trim(),
        complemento: form.complemento.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase().slice(0, 2),
        categoria: form.categoria.trim(),
      };

      if (editando) {
        await atualizarFornecedor(editando.id, payload);
      } else {
        await criarFornecedor(payload);
      }

      await carregarFornecedores();
      fechar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar fornecedor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cadastro de Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">{itens.length} fornecedores cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por razão social, CNPJ, categoria..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-2">
            {(["Todos", "Ativo", "Inativo"] as const).map((f) => (
              <button key={f} onClick={() => setFiltroStatus(f)} className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${filtroStatus === f ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{f}</button>
            ))}
          </div>
        </div>
        {busca && <p className="text-xs text-gray-500 mt-2">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>}
      </Card>

      <Card className="overflow-hidden">
        {erro && <p className="m-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
        {carregando && <p className="m-4 text-sm text-gray-500">Carregando fornecedores...</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Razão Social / Fantasia</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">CNPJ</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Contato</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">CEP</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden xl:table-cell">Localização</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!carregando && filtrados.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400"><Search className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Nenhum fornecedor encontrado</p></td></tr>
              ) : filtrados.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs flex-shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.razaoSocial}</p>
                        <p className="text-xs text-gray-400">{item.nomeFantasia}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.cnpj}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-gray-600"><Mail className="w-3 h-3" />{item.email}</span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        {item.telefone}
                        {linkWhatsApp(item.telefone) && (
                          <a
                            href={linkWhatsApp(item.telefone) || "#"}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Abrir WhatsApp de ${item.razaoSocial}`}
                            title="Abrir no WhatsApp"
                            className="ml-1 inline-flex items-center justify-center rounded text-green-600 hover:text-green-700"
                          >
                            <WhatsAppIcon fontSize="inherit" className="text-base" />
                          </a>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{item.cep || "-"}</td>
                  <td className="px-4 py-3 hidden xl:table-cell text-gray-600">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <div>
                        <p>{item.endereco || "-"}</p>
                        <p className="text-xs text-gray-500">{[item.complemento, item.cidade, item.estado].filter(Boolean).join(" - ") || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                      <Globe className="w-3 h-3" />{item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={item.status === "Ativo" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-600 hover:bg-red-100"}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEdicao(item)} className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={fechar} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>
              <button onClick={fechar} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input id="razaoSocial" value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} placeholder="Razão social da empresa" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2 xl:col-span-1">
                <div>
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input id="nomeFantasia" value={form.nomeFantasia} onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} placeholder="Nome fantasia" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2 xl:col-span-1">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 0000-0000" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                  onBlur={(e) => {
                    void buscarEnderecoPorCep(e.target.value);
                  }}
                  placeholder="00000-000"
                  className="mt-1"
                />
                {buscandoCep && <p className="text-xs text-gray-500 mt-1">Buscando endereço pelo CEP...</p>}
              </div>
              <div className="md:col-span-2 xl:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, avenida, etc." className="mt-1" />
              </div>
              <div className="md:col-span-2 xl:col-span-1">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Sala, bloco, referência" className="mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-4 md:col-span-2 xl:col-span-1">
                <div className="col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="estado">UF</Label>
                  <Input id="estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2 xl:col-span-1">
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Distribuição" className="mt-1" />
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
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fechar}>Cancelar</Button>
              <Button onClick={salvar} disabled={salvando || !form.razaoSocial.trim()} className="bg-green-600 hover:bg-green-700 text-white">{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
