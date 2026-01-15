import Sidebar from "./Sidebar";

export default function Layout({ children, isAuthenticated, onLogout }) {
  if (!isAuthenticated) {
    return <main className="min-h-screen bg-gray-950 text-white">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto p-8 relative">{children}</main>
    </div>
  );
}
