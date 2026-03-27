import { useLocation, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingCart, Droplets, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/sales", label: "Sales", icon: ShoppingCart },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <Droplets className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-foreground leading-tight">{isAdmin ? 'Zama Tui Sales Manager' : 'Zama Tui'}</h1>
          <p className="text-xs text-muted-foreground">{isAdmin ? 'Sales Manager' : 'Delivery Manager'}</p>
        </div>
        <div className="ml-auto">
          {isAdmin ? (
            <Button size="sm" variant="ghost" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => navigate("/login")}>
              <LogIn className="w-4 h-4 mr-1" /> Admin
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
        {children}
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
