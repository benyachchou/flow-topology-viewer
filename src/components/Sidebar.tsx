
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Database,
  Link,
  Square,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Topologie', href: '/topology', icon: Link },
  { name: 'Dispositifs', href: '/devices', icon: Database },
  { name: 'API Client', href: '/api', icon: Square },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">ONOS Manager</h1>
              <p className="text-sm text-slate-400">SDN Controller</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )
                }
              >
                <item.icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5 mr-3")} />
                {!collapsed && item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className={cn("flex items-center", collapsed && "justify-center")}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">O</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">ONOS Controller</p>
              <p className="text-xs text-slate-400">En ligne</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
