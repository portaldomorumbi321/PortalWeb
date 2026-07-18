import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plane, Bed, ShieldCheck, ShoppingCart, User, Mail, Share2, DollarSign, Map, CalendarDays, Car, Utensils, Sparkles, Info, FileText, Link2, Users } from "lucide-react";
import { Button } from "./ui/button";
import { buscarOrcamentoPublico } from "../data/orcamentosApi";
// Tipos replicados de Orcamentos.tsx para consistência
interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
}

interface Voo {
  id: number;
  companhia: string;
  numero: string;
  data: string;
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  duracao: string;
  documento: string | null;
  documentoTipo: "pdf" | "imagem" | null;
  documentoNome: string;
  linkVoo: string;
}

interface Hospedagem {
  id: number;
  nome: string;
  local: string;
  preco: number;
  checkin: string;
  checkout: string;
  noites: number;
}

interface Seguro {
  id: number;
  tipo: string;
  valor: number;
}

interface Transporte {
  id: number;
  tipo: string;
  origem: string;
  destino: string;
  valor: number;
}

interface Restaurante {
  id: number;
  nome: string;
  local: string;
  preco: number;
}

interface Experiencia {
  id: number;
  nome: string;
  local: string;
  preco: number;
}

interface Day {
  id: number;
  titulo: string;
  atividades: { id: number; hora: string; descricao: string }[];
}

interface Pacote {
  id: number;
  operador: string;
  origem?: string;
  destino?: string;
  link: string;
  descricao: string;
  foto: string | null;
  valor?: number;
}

interface OrcamentoCompleto {
  numero: string;
  cliente: string;
  email: string;
  passageiros?: string[];
  status: string;
  pacotes?: Pacote[];
  voos?: Voo[];
  hospedagem?: Hospedagem[];
  seguro?: Seguro[];
  transporte?: Transporte[];
  restaurante?: Restaurante[];
  experiencias?: Experiencia[];
  roteiro?: string;
  dayByDay?: Day[];
  observacoes?: string;
  itens: ItemOrc[]; // Itens de Venda
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcItem(item: ItemOrc) {
  const bruto = item.quantidade * item.valorUnitario;
  const desc = bruto * (item.desconto / 100);
  return bruto - desc;
}

export default function ResumoOrcamento() {
  const { numero } = useParams<{ numero: string }>();
  const [orcamento, setOrcamento] = useState<OrcamentoCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function carregarOrcamento() {
      if (!numero) {
        if (active) {
          setOrcamento(null);
          setErroCarregamento("Número do orçamento não informado.");
          setCarregando(false);
        }
        return;
      }

      setCarregando(true);
      setErroCarregamento(null);

      try {
        const orcamentoApi = await buscarOrcamentoPublico(numero);
        if (active) {
          setOrcamento(orcamentoApi);
          setCarregando(false);
        }
        return;
      } catch (error) {
        const dados = localStorage.getItem(`orc_${numero}`);

        if (dados) {
          try {
            const parsed = JSON.parse(dados);
            if (active) {
              setOrcamento(parsed);
              setCarregando(false);
            }
            return;
          } catch {
            // segue para o estado de erro abaixo
          }
        }

        if (active) {
          setOrcamento(null);
          setErroCarregamento(error instanceof Error ? error.message : "Resumo não disponível no momento.");
          setCarregando(false);
        }
      }
    }

    carregarOrcamento();

    return () => {
      active = false;
    };
  }, [numero]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Carregando resumo...</h1>
          <p className="text-gray-500 mt-2">Aguardando os dados do orçamento.</p>
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Resumo indisponível</h1>
          <p className="text-gray-500 mt-2">{erroCarregamento || "Não foi possível carregar o orçamento deste link."}</p>
        </div>
      </div>
    );
  }

  const itensVendaAdicionados = (orcamento.itens || []).filter((item) => item.descricao?.trim());
  const totalVendas = itensVendaAdicionados.reduce((acc, i) => acc + calcItem(i), 0);
  const totalPacotes = orcamento.pacotes?.reduce((acc, p) => acc + (Number(p.valor) || 0), 0) || 0;
  const totalHospedagem = orcamento.hospedagem?.reduce((acc, h) => acc + (h.preco || 0), 0) || 0;
  const totalSeguro = orcamento.seguro?.reduce((acc, s) => acc + (s.valor || 0), 0) || 0;
  const totalTransporte = orcamento.transporte?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;
  const totalRestaurante = orcamento.restaurante?.reduce((acc, r) => acc + (r.preco || 0), 0) || 0;
  const totalExperiencias = orcamento.experiencias?.reduce((acc, e) => acc + (e.preco || 0), 0) || 0;
  const pacoteDestaque = (orcamento.pacotes || []).find((item) => Boolean(item?.foto)) || (orcamento.pacotes || [])[0] || null;

  const totalGeral = totalPacotes + totalVendas + totalHospedagem + totalSeguro + totalTransporte + totalRestaurante + totalExperiencias;

  const handleShareWhatsApp = () => {
    if (!orcamento) return;
    const message = `Olá! Aqui está o resumo do seu orçamento:\n\nCliente: ${orcamento.cliente}\nOrçamento: ${orcamento.numero}\n\nVisite: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Resumo do Orçamento</h1>
          <p className="text-lg text-indigo-600 font-mono mt-1">{orcamento.numero}</p>
        </div>

        {pacoteDestaque?.foto && (
          <Card className="mb-6 overflow-hidden">
            <img
              src={pacoteDestaque.foto}
              alt="Foto do pacote"
              className="h-64 w-full object-cover sm:h-80"
            />
            {(pacoteDestaque.origem || pacoteDestaque.destino) && (
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Origem:</span> {pacoteDestaque.origem || "-"}
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="font-semibold">Destino:</span> {pacoteDestaque.destino || "-"}
                </p>
              </CardContent>
            )}
          </Card>
        )}

        <Card className="mb-6 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-indigo-500" />
              <span>Dados do Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="font-semibold text-gray-900">{orcamento.cliente}</p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Mail className="w-4 h-4" /> {orcamento.email}
            </p>
          </CardContent>
        </Card>

        {Array.isArray(orcamento.passageiros) && orcamento.passageiros.length > 0 && (
          <Card className="mb-6 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-5 h-5 text-indigo-500" />
                <span>Passageiros</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-wrap gap-2">
                {orcamento.passageiros.map((nome) => (
                  <span key={nome} className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 border border-indigo-100">
                    {nome}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Voos */}
          {orcamento.voos && orcamento.voos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Plane className="text-blue-500" /> Voos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {orcamento.voos.map(voo => (
                    <div key={voo.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{voo.companhia} {voo.numero}</p>
                          <p className="text-sm text-gray-600">{voo.origem} → {voo.destino}</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500">{new Date(voo.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                        <span>Partida: <span className="font-semibold text-gray-700">{voo.partida}</span></span>
                        <span>Chegada: <span className="font-semibold text-gray-700">{voo.chegada}</span></span>
                        <span className="font-semibold text-gray-700">({voo.duracao})</span>
                      </div>
                      {(voo.linkVoo || voo.documentoNome) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
                          {voo.linkVoo && (
                            <a
                              href={voo.linkVoo}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              Abrir link do voo
                            </a>
                          )}
                          {voo.documento && voo.documentoNome && (
                            <a
                              href={voo.documento}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {voo.documentoNome}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Hospedagem */}
          {orcamento.hospedagem && orcamento.hospedagem.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Bed className="text-purple-500" /> Hospedagem</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {orcamento.hospedagem.map(h => (
                    <div key={h.id} className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">{h.nome} - {h.local}</span>
                      <p className="text-xs text-gray-500 mt-1">{new Date(h.checkin + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(h.checkout + 'T00:00:00').toLocaleDateString('pt-BR')} ({h.noites} noites)</p>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Seguro */}
          {orcamento.seguro && orcamento.seguro.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><ShieldCheck className="text-green-500" /> Seguro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {orcamento.seguro.map(s => (
                    <div key={s.id} className="p-2 bg-gray-50 rounded">
                      <span>{s.tipo}</span>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Roteiro */}
          {orcamento.roteiro && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Map className="text-sky-500" /> Roteiro</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 whitespace-pre-wrap">{orcamento.roteiro}</p></CardContent>
            </Card>
          )}

          {/* Day by Day */}
          {orcamento.dayByDay && orcamento.dayByDay.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="text-purple-500" /> Dia a Dia</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {orcamento.dayByDay.map(dia => (
                  <div key={dia.id} className="p-2 bg-gray-50 rounded">
                    <p className="font-semibold text-sm text-gray-800">{dia.titulo}</p>
                    <ul className="list-disc list-inside pl-2 mt-1 text-xs text-gray-600 space-y-1">
                      {dia.atividades.map(atv => (
                        <li key={atv.id}>{atv.hora && `${atv.hora} - `}{atv.descricao}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Transporte */}
          {orcamento.transporte && orcamento.transporte.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Car className="text-yellow-500" /> Transporte</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {orcamento.transporte.map(t => (
                    <div key={t.id} className="p-2 bg-gray-50 rounded">
                      <span>{t.tipo}: {t.origem} → {t.destino}</span>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Restaurantes */}
          {orcamento.restaurante && orcamento.restaurante.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Utensils className="text-red-500" /> Restaurantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {orcamento.restaurante.map(r => (
                    <div key={r.id} className="p-2 bg-gray-50 rounded">
                      <span>{r.nome} - {r.local}</span>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Experiências */}
          {orcamento.experiencias && orcamento.experiencias.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Sparkles className="text-pink-500" /> Experiências</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {orcamento.experiencias.map(e => (
                    <div key={e.id} className="p-2 bg-gray-50 rounded">
                      <span>{e.nome} - {e.local}</span>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Vendas */}
          {itensVendaAdicionados.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="text-orange-500" /> Vendas</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                  {itensVendaAdicionados.map(item => (
                    <div key={item.id} className="p-2 bg-gray-50 rounded">
                      {item.descricao}
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* Observações */}
        {orcamento.observacoes && (
          <Card className="mt-6">
            <CardHeader><CardTitle className="flex items-center gap-2"><Info className="text-amber-500" /> Observações</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-gray-600 whitespace-pre-wrap">{orcamento.observacoes}</p></CardContent>
          </Card>
        )}

        {/* Total Geral */}
        <Card className="mt-8 bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <span className="flex items-center gap-2"><DollarSign className="text-indigo-500" /> Valor Total da Viagem</span>
              <span className="text-2xl font-bold text-indigo-700">{moeda(totalGeral)}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="mt-8 flex gap-2 print:hidden">
          <Button onClick={() => window.print()} className="flex-1">
            Imprimir
          </Button>
          <Button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
            <Share2 className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
        </div>
      </main>
    </div>
  );
}