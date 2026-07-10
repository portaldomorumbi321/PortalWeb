import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Cadastros from "./components/Cadastros";
import CadastroClientes from "./components/CadastroClientes";
import CadastroFornecedores from "./components/CadastroFornecedores";
import CadastroProdutos from "./components/CadastroProdutos";
import CadastroEnderecos from "./components/CadastroEnderecos";
import CadastroTarefas from "./components/CadastroTarefas";
import Financeiro from "./components/Financeiro";
import Orcamentos from "./components/Orcamentos";
import Relatorios from "./components/Relatorios";
import RelatorioVendas from "./components/RelatorioVendas";
import RelatorioFinanceiro from "./components/RelatorioFinanceiro";
import RelatorioClientes from "./components/RelatorioClientes";
import RelatorioProdutos from "./components/RelatorioProdutos";
import RoteiroOrcamento from "./components/RoteiroOrcamento";
import Marketing from "./components/Marketing";
import Funcionario from "./components/Funcionario";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Cadastros },
      { path: "cadastros", Component: Cadastros },
      { path: "cadastros/clientes", Component: CadastroClientes },
      { path: "cadastros/fornecedores", Component: CadastroFornecedores },
      { path: "cadastros/produtos", Component: CadastroProdutos },
      { path: "cadastros/enderecos", Component: CadastroEnderecos },
      { path: "cadastros/tarefas", Component: CadastroTarefas },
      { path: "financeiro", Component: Financeiro },
      { path: "financeiro/orcamentos", Component: Orcamentos },
      { path: "relatorios", Component: Relatorios },
      { path: "relatorios/vendas", Component: RelatorioVendas },
      { path: "relatorios/financeiro", Component: RelatorioFinanceiro },
      { path: "relatorios/clientes", Component: RelatorioClientes },
      { path: "relatorios/produtos", Component: RelatorioProdutos },
      { path: "marketing", Component: Marketing },
      { path: "funcionario", Component: Funcionario },
    ],
  },
  {
    path: "/financeiro/orcamentos/roteiro/:numero",
    Component: RoteiroOrcamento,
  },
]);
