import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function AuthLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lógica de autenticação (simulada por enquanto)
    // Em um projeto real, você verificaria um token, cookie ou localStorage.
    const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";

    if (!isAuthenticated) {
      // Se não estiver autenticado, redireciona para a página de login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Se estiver autenticado, renderiza o conteúdo protegido (o componente Root com o menu e as páginas)
  return <Outlet />;
}