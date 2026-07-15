import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plane, Bed, ShieldCheck, ShoppingCart, User, Mail, Share2, DollarSign, Map, CalendarDays, Car, Utensils, Sparkles, Info, FileText, Link2 } from "lucide-react";
import { Button } from "./ui/button";
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

interface OrcamentoCompleto {
  numero: string;
  cliente: string;
  email: string;
  status: string;
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

  useEffect(() => {
    if (numero) {
      const dados = localStorage.getItem(`orc_${numero}`);
      if (dados) {
        setOrcamento(JSON.parse(dados));
      }
    }
  }, [numero]);

  if (!orcamento) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Carregando resumo...</h1>
          <p className="text-gray-500 mt-2">Se o orçamento não carregar, volte e tente novamente.</p>
        </div>
      </div>
    );
  }

  const totalVendas = orcamento.itens.reduce((acc, i) => acc + calcItem(i), 0);
  const totalHospedagem = orcamento.hospedagem?.reduce((acc, h) => acc + (h.preco || 0), 0) || 0;
  // Voos e Seguro não têm valor no modelo atual, mas podemos adicionar se necessário.
  const totalSeguro = orcamento.seguro?.reduce((acc, s) => acc + (s.valor || 0), 0) || 0;
  const totalTransporte = orcamento.transporte?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;
  const totalRestaurante = orcamento.restaurante?.reduce((acc, r) => acc + (r.preco || 0), 0) || 0;
  const totalExperiencias = orcamento.experiencias?.reduce((acc, e) => acc + (e.preco || 0), 0) || 0;


  const totalGeral = totalVendas + totalHospedagem + totalSeguro + totalTransporte + totalRestaurante + totalExperiencias;

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

        <div className="space-y-6">
          {/* Voos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Plane className="text-blue-500" /> Voos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orcamento.voos && orcamento.voos.length > 0 ? (
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
              ) : <p className="text-sm text-gray-500">Nenhuma informação de voo adicionada.</p>}
            </CardContent>
          </Card>

          {/* Hospedagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Bed className="text-purple-500" /> Hospedagem</span>
                {totalHospedagem > 0 && <span className="text-lg font-bold text-gray-700">{moeda(totalHospedagem)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orcamento.hospedagem && orcamento.hospedagem.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {orcamento.hospedagem.map(h => (
                    <div key={h.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{h.nome} - {h.local}</span>
                        <span className="font-semibold">{moeda(h.preco)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{new Date(h.checkin + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(h.checkout + 'T00:00:00').toLocaleDateString('pt-BR')} ({h.noites} noites)</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Nenhuma informação de hospedagem adicionada.</p>}
            </CardContent>
          </Card>

          {/* Seguro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><ShieldCheck className="text-green-500" /> Seguro</span>
                {totalSeguro > 0 && <span className="text-lg font-bold text-gray-700">{moeda(totalSeguro)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orcamento.seguro && orcamento.seguro.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {orcamento.seguro.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{s.tipo}</span>
                      <span className="font-semibold">{moeda(s.valor)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Nenhuma informação de seguro adicionada.</p>}
            </CardContent>
          </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Car className="text-yellow-500" /> Transporte</span>
                {totalTransporte > 0 && <span className="text-lg font-bold text-gray-700">{moeda(totalTransporte)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orcamento.transporte && orcamento.transporte.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {orcamento.transporte.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{t.tipo}: {t.origem} → {t.destino}</span>
                      <span className="font-semibold">{moeda(t.valor)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Nenhuma informação de transporte adicionada.</p>}
            </CardContent>
          </Card>

          {/* Restaurantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Utensils className="text-red-500" /> Restaurantes</span>
                {totalRestaurante > 0 && <span className="text-lg font-bold text-gray-700">{moeda(totalRestaurante)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orcamento.restaurante && orcamento.restaurante.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {orcamento.restaurante.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{r.nome} - {r.local}</span>
                      <span className="font-semibold">{moeda(r.preco)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Nenhuma informação de restaurante adicionada.</p>}
            </CardContent>
          </Card>

          {/* Experiências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Sparkles className="text-pink-500" /> Experiências</span>
                {totalExperiencias > 0 && <span className="text-lg font-bold text-gray-700">{moeda(totalExperiencias)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orcamento.experiencias && orcamento.experiencias.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {orcamento.experiencias.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{e.nome} - {e.local}</span>
                      <span className="font-semibold">{moeda(e.preco)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Nenhuma informação de experiência adicionada.</p>}
            </CardContent>
          </Card>

          {/* Vendas */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="text-orange-500" /> Vendas</CardTitle></CardHeader>
            <CardContent>
              {orcamento.itens && orcamento.itens.length > 0 && orcamento.itens.some(i => i.descricao) ? (
                <div className="space-y-2">
                  <table className="w-full text-sm">
                    <tbody>
                      {orcamento.itens.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.descricao}</td>
                          <td className="py-2 text-right font-semibold">{moeda(calcItem(item))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <span className="text-sm font-semibold">Total Vendas: </span>
                      <span className="text-lg font-bold text-indigo-600">{moeda(totalVendas)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum item de venda adicionado.</p>
              )}
            </CardContent>
          </Card>
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