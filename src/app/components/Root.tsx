import { Link, Outlet, useLocation } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/logo.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const menuItems = [
  { name: "ORÇAMENTOS", path: "/financeiro/orcamentos" },
  { name: "CADASTROS", path: "/cadastros" },
  { name: "FINANCEIRO", path: "/financeiro" },
  { name: "RELATÓRIOS", path: "/relatorios" },
  { name: "MARKETING", path: "/marketing" },
  { name: "FUNCIONÁRIO", path: "/funcionario" },
];

export default function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/cadastros" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header/Menu Superior */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-2 sm:px-3">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-shrink-0">
              <ImageWithFallback src={logoImg} alt="Logo" className="w-7 sm:w-9 h-7 sm:h-9 object-contain" />
              <span className="font-semibold text-sm sm:text-lg text-gray-900 truncate max-w-[180px] sm:max-w-none">321Go Portal</span>
            </Link>

            {/* Menu de Navegação - Desktop */}
            <nav className="hidden md:flex gap-0.5">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Menu Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Menu Mobile */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
       </div>
      </header>

      {/* Conteúdo - Sem margens laterais, apenas padding mínimo */}
      <main className="px-2 sm:px-3 py-3 sm:py-5">
        <Outlet />
      </main>
    </div>
  );
}
