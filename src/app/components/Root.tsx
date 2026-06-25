import { Link, Outlet, useLocation } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/logo.png";

const menuItems = [
  { name: "CADASTROS", path: "/cadastros" },
  { name: "FINANCEIRO", path: "/financeiro" },
  { name: "RELATÓRIOS", path: "/relatorios" },
  { name: "MARKETING", path: "/marketing" },
  { name: "FUNCIONÁRIO", path: "/funcionario" },
];

export default function Root() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/cadastros" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header/Menu Superior */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ImageWithFallback src={logoImg} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-semibold text-xl text-gray-900">Portal</span>
            </Link>

            {/* Menu de Navegação */}
            <nav className="flex gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
