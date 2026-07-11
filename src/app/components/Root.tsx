import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/logo.png";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

const menuItems = [
  { name: "DASHBOARD", path: "/" },
  { name: "LEADS", path: "/leads/list" },
  { name: "CADASTROS", path: "/cadastros" },
  { name: "FINANCEIRO", path: "/financeiro" },
  { name: "ORÇAMENTOS", path: "/financeiro/orcamentos" },
  { name: "RELATÓRIOS", path: "/relatorios" },
  { name: "MARKETING", path: "/marketing" },
  { name: "FUNCIONÁRIO", path: "/funcionario" },
];

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header/Menu Superior */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <ImageWithFallback src={logoImg} alt="Logo" className="w-8 sm:w-10 h-8 sm:h-10 object-contain" />
              <span className="font-semibold text-lg sm:text-xl text-gray-900"></span>
            </Link>

            {/* Menu de Navegação - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="ml-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-red-600 hover:text-red-900 hover:bg-red-100 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </nav>

            {/* Menu Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menu Mobile */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors text-red-600 hover:text-red-900 hover:bg-red-100 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </nav>
          )}
       </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
