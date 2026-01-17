import { Upload, History, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const links = [
    { icon: Upload, label: "New Analysis", path: "/upload" },
    { icon: History, label: "Game History", path: "/history" },
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="flex w-64 flex-col bg-gray-900 border-r border-gray-800 h-screen text-gray-300">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-wider">
          CHESS<span className="text-green-500">SCOPE</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.path ||
              (link.path === "/upload" && location.pathname === "/analysis");
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 group ${
                    isActive
                      ? "bg-green-500/10 text-green-400 shadow-[inset_4px_0_0_-0px_#4ade80]"
                      : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${isActive ? "text-green-400" : "group-hover:text-white"}`}
                  />
                  <span className="font-medium tracking-wide text-sm">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
