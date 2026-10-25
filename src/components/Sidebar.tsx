import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Settings, 
  LogOut,
  Sparkles,
  X,
  Globe
} from 'lucide-react';
import { User, UserRole } from '../types/pharmacy';
import { ThreeLogo } from './ThreeLogo';

export type ActiveTab = 
  | 'overview' 
  | 'products' 
  | 'orders' 
  | 'sales' 
  | 'customers' 
  | 'payments' 
  | 'audit' 
  | 'staff' 
  | 'sync' 
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingSyncCount: number;
  onNavigateToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  pendingSyncCount,
  onNavigateToLanding
}) => {
  const isSuperadmin = currentUser.role === 'SUPERADMIN';

  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as ActiveTab, label: 'Products', icon: Package },
    { id: 'orders' as ActiveTab, label: 'Orders', icon: ShoppingCart },
    { id: 'sales' as ActiveTab, label: 'Sales (POS)', icon: Receipt },
    { id: 'customers' as ActiveTab, label: 'Customers (EMR)', icon: Users },
    { id: 'payments' as ActiveTab, label: 'Payments', icon: CreditCard },
    { id: 'audit' as ActiveTab, label: 'Audit Logs', icon: ShieldCheck, badge: isSuperadmin ? 'Strict' : undefined },
    { id: 'staff' as ActiveTab, label: 'Staff & RBAC', icon: UserCheck, restricted: !isSuperadmin },
    { id: 'sync' as ActiveTab, label: 'Cloud Sync', icon: RefreshCw, count: pendingSyncCount },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 neu-dark-panel text-slate-100 flex flex-col justify-between p-4 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between px-2 py-2 mb-4 border-b border-emerald-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl neu-dark-sunken flex items-center justify-center p-0.5 shadow-sm border border-emerald-800/40">
                <ThreeLogo size={36} interactive={false} />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white">Pharmly</span>
                <span className="text-[10px] font-semibold text-[#bbf246] tracking-wider block uppercase">Bangladesh</span>
              </div>
            </div>
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-950/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Landing Page Link */}
          {onNavigateToLanding && (
            <button
              onClick={() => {
                onNavigateToLanding();
                onCloseMobile();
              }}
              className="w-full mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300/80 hover:text-white hover:bg-emerald-950/60 transition-colors flex items-center justify-between neu-dark-item"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-3.5 h-3.5 text-[#bbf246]" />
                <span>Visit Landing Page</span>
              </div>
              <span className="text-[10px] text-[#bbf246]">Public</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              if (item.restricted) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'neu-accent-btn text-[#062822] shadow-[0_4px_16px_rgba(187,242,70,0.25)] translate-x-1' 
                      : 'text-emerald-100/70 hover:text-white hover:bg-emerald-950/50 hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#062822]' : 'text-emerald-400/80'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold tabular-nums">
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-emerald-900/80 text-[#bbf246] border border-emerald-700/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Banner & User Card */}
        <div className="space-y-3 pt-3 border-t border-emerald-950/80">
          {/* Pro / Compliance Badge */}
          <div className="neu-dark-sunken p-3.5 rounded-2xl relative overflow-hidden border border-emerald-900/40">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#bbf246]" />
              <span className="text-xs font-bold text-white">DGDA Pharma Pro</span>
            </div>
            <p className="text-[11px] text-emerald-200/70 leading-relaxed mb-2.5">
              Offline-first pharmaceutical compliance & audit tracking active.
            </p>
            <div className="flex items-center justify-between text-[10px] text-[#bbf246] font-mono">
              <span>Node: Dhaka Hub</span>
              <span>BST (UTC+6)</span>
            </div>
          </div>

          {/* Current Staff Logout */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-emerald-200/80">
            <div className="truncate pr-2">
              <p className="font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-400/80 capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-emerald-400 hover:text-rose-400 hover:bg-emerald-950/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
