import { NavLink, useLocation } from 'react-router-dom';
import { 
  ClipboardList, 
  Users, 
  FileText, 
  History, 
  BookOpen,
  LayoutDashboard 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Painel' },
  { href: '/candidates', icon: Users, label: 'Candidatos' },
  { href: '/evaluations', icon: ClipboardList, label: 'Avaliações' },
  { href: '/new-evaluation', icon: FileText, label: 'Nova Súmula' },
  { href: '/history', icon: History, label: 'Histórico' },
  { href: '/programs', icon: BookOpen, label: 'Programas' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 mt-8">
        <div className="bg-secondary rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm mb-2">Regulamento CBJ</h4>
          <p className="text-xs text-muted-foreground">
            Sistema baseado no Regulamento de Exame e Outorga de Faixas e Graus da CBJ 2018.
          </p>
        </div>
      </div>
    </aside>
  );
}
