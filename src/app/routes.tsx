import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Cadastros from "./components/Cadastros";
import CadastroClientes from "./components/CadastroClientes";
import CadastroFornecedores from "./components/CadastroFornecedores";
import CadastroProdutos from "./components/CadastroProdutos";
import CadastroEnderecos from "./components/CadastroEnderecos";
import Financeiro from "./components/Financeiro";
import Relatorios from "./components/Relatorios";
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
      { path: "financeiro", Component: Financeiro },
      { path: "relatorios", Component: Relatorios },
      { path: "marketing", Component: Marketing },
      { path: "funcionario", Component: Funcionario },
    ],
  },
]);
