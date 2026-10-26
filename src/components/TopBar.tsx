import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  User as UserIcon,
  Shield,
  Layers,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { User, UserRole, Medicine } from '../types/pharmacy';
import { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  currentUser: User;
  onOpenMobileSidebar: () => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onSwitchUser: (role: UserRole) => void;
  onLogout: () => void;
  medicines: Medicine[];
  onSearchSelect?: (type: 'medicine' | 'patient', id: string) => void;
  onNavigateToLanding?: () => void;
  onOpenWhatsAppDelivery?: () => void;
  onOpenGeminiAssistant?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  currentUser,
  onOpenMobileSidebar,
  isOnline,
  pendingSyncCount,
  onTriggerSync,
  isSyncing,
  onSwitchUser,
  onLogout,
  medicines,
  onNavigateToLanding,
  onOpenWhatsAppDelivery,
  onOpenGeminiAssistant
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Breadcrumb mapping matching Pharmly image style
  const breadcrumbMap: Record<ActiveTab, { title: string; subtitle: string }> = {
    overview: { title: 'Order Details', subtitle: 'Overview > List data' },
    products: { title: 'Inventory Registry', subtitle: 'Products > Stock & Batches' },
    orders: { title: 'Dispensing History', subtitle: 'Orders > Sales Invoices' },
    sales: { title: 'Fast POS Dispensing', subtitle: 'Sales > Billing & Patient Rx' },
    customers: { title: 'Patient Health Dossier', subtitle: 'Customers > Medical History EMR' },
    payments: { title: 'Financial Settlements', subtitle: 'Payments > Reconciliation' },
    audit: { title: 'Security Compliance', subtitle: 'Audit Logs > Regulatory Traceability' },
    staff: { title: 'Access Governance', subtitle: 'Staff > Role-Based Access Control' },
    sync: { title: 'Multi-Device Sync', subtitle: 'Cloud Sync > Offline-First Replication' },
    settings: { title: 'System Configurations', subtitle: 'Settings > DGDA Pharmacy License' },
  };

  const breadcrumb = breadcrumbMap[activeTab] || { title: 'Pharmacy Manager', subtitle: 'System > Central' };

  // Calculate critical alerts for notification drawer
  const lowStockItems = medicines.filter(m => m.totalStockUnits <= m.reorderLevel);
  const totalAlerts = lowStockItems.length;

  return (
    <header className="sticky top-0 z-30 bg-[#eef2f6]/95 backdrop-blur-md px-4 lg:px-8 py-3.5 border-b border-slate-200/80">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl neu-btn text-slate-700 hover:text-slate-900"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              {breadcrumb.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              {breadcrumb.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Sunken Inset Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full relative">
            <div className="neu-sunken flex items-center px-3.5 py-2 w-full text-slate-700">
              <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, generic (e.g. Napa, Seclo, Metformin)..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Keep necessary only (Clean, Uncrowded) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* AI Clinical Assistant Icon (Gemini 3.8 Flash) */}
          {onOpenGeminiAssistant && (
            <button
              onClick={onOpenGeminiAssistant}
              title="Pharmly AI Clinical Assistant (Gemini 3.8 Flash)"
              className="neu-btn p-2 rounded-xl text-emerald-700 hover:text-emerald-900 transition-colors"
              aria-label="AI Assistant"
            >
              <Sparkles className="w-4 h-4 fill-current text-emerald-600" />
            </button>
          )}

          {/* View Storefront Icon */}
          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              title="Open Public Storefront & Delivery Page"
              className="neu-btn p-2 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="View Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* Multi-Device Offline Sync Icon */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            title={isOnline ? (pendingSyncCount > 0 ? `${pendingSyncCount} changes queued to sync` : 'Cloud Synced') : 'Offline Mode'}
            className={`neu-btn p-2 rounded-xl transition-colors ${
              isOnline ? 'text-emerald-700' : 'text-amber-700'
            }`}
            aria-label="Sync Status"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            ) : isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationMenu(!showNotificationMenu);
                setShowProfileMenu(false);
              }}
              className="neu-btn p-2 rounded-xl text-slate-600 hover:text-slate-900 relative transition-transform"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 neu-convex p-3.5 rounded-2xl z-50 border border-slate-200/80 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">Pharmacy Alerts</span>
                  <span className="text-[10px] text-slate-500 font-mono">{totalAlerts} pending</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      All pharmaceutical stocks nominal.
                    </div>
                  ) : (
                    lowStockItems.slice(0, 5).map(m => (
                      <div key={m.id} className="p-2 neu-sunken-sm rounded-xl text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{m.brandName} ({m.strength})</p>
                          <p className="text-[11px] text-slate-500">
                            Stock: <span className="font-bold text-amber-600 tabular-nums">{m.totalStockUnits}</span> / Reorder: {m.reorderLevel}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotificationMenu(false);
              }}
              className="neu-btn px-2.5 py-1.5 rounded-2xl flex items-center gap-2.5 text-left transition-all"
            >
              <img
                src={currentUser.avatarUrl || '/src/assets/images/superadmin_avatar_1792908539605.jpg'}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[9px] text-emerald-700 font-bold uppercase leading-none">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown & Instant Role Switcher */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 neu-convex p-3.5 rounded-2xl z-50 border border-slate-200/80 shadow-2xl">
                <div className="pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatarUrl || '/src/assets/images/superadmin_avatar_1792908539605.jpg'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#062822] text-[#bbf246]">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Role Testing Switcher */}
                <div className="py-2.5 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Switch RBAC Role (Testing):
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      onClick={() => {
                        onSwitchUser('SUPERADMIN');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1.5 rounded-lg text-left transition-colors ${
                        currentUser.role === 'SUPERADMIN' 
                          ? 'bg-[#062822] text-[#bbf246] font-bold' 
                          : 'neu-sunken-sm text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Superadmin
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('PHARMACIST');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1.5 rounded-lg text-left transition-colors ${
                        currentUser.role === 'PHARMACIST' 
                          ? 'bg-[#062822] text-[#bbf246] font-bold' 
                          : 'neu-sunken-sm text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Pharmacist
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('CASHIER');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1.5 rounded-lg text-left transition-colors ${
                        currentUser.role === 'CASHIER' 
                          ? 'bg-[#062822] text-[#bbf246] font-bold' 
                          : 'neu-sunken-sm text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Sales Cashier
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('INVENTORY_MANAGER');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1.5 rounded-lg text-left transition-colors ${
                        currentUser.role === 'INVENTORY_MANAGER' 
                          ? 'bg-[#062822] text-[#bbf246] font-bold' 
                          : 'neu-sunken-sm text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Inventory Lead
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-center py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Sign Out of Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
