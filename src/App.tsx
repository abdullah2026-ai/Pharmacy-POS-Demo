/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { storageService } from './services/storageService';
import { User, Medicine, Patient, Order, AuditLogEntry, SyncQueueItem, UserRole } from './types/pharmacy';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { ProductsView } from './components/ProductsView';
import { OrdersView } from './components/OrdersView';
import { PatientEmrView } from './components/PatientEmrView';
import { AuditLogView } from './components/AuditLogView';
import { StaffRbacView } from './components/StaffRbacView';
import { SyncCenterView } from './components/SyncCenterView';
import { PaymentsView } from './components/PaymentsView';
import { SettingsView } from './components/SettingsView';
import { InvoiceModal } from './components/InvoiceModal';
import { LoginModal } from './components/LoginModal';
import { LandingPage } from './components/LandingPage';
import { WhatsAppDeliveryModal } from './components/WhatsAppDeliveryModal';
import { GeminiChatbot } from './components/GeminiChatbot';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<'app' | 'landing'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showGeminiChatbot, setShowGeminiChatbot] = useState<boolean>(false);

  // Core Data State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingQueue, setPendingQueue] = useState<SyncQueueItem[]>([]);

  // Connectivity & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(storageService.getNetworkStatus());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(storageService.getLastSyncTime());

  // Modals
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  // Load all data from storage service
  const reloadData = useCallback(() => {
    setMedicines(storageService.getMedicines());
    setPatients(storageService.getPatients());
    setOrders(storageService.getOrders());
    setAuditLogs(storageService.getAuditLogs());
    setUsers(storageService.getUsers());
    setPendingQueue(storageService.getSyncQueue());
    setLastSyncTime(storageService.getLastSyncTime());
    setIsOnline(storageService.getNetworkStatus());
  }, []);

  useEffect(() => {
    reloadData();
    const unsubscribe = storageService.subscribeSync(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, [reloadData]);

  // Synchronize across devices
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await storageService.syncPendingQueue();
    setTimeout(() => {
      reloadData();
      setIsSyncing(false);
    }, 600);
  };

  // Switch role for instant RBAC testing
  const handleSwitchRole = (role: UserRole) => {
    const allUsers = storageService.getUsers();
    const targetUser = allUsers.find(u => u.role === role) || allUsers[0];
    storageService.setCurrentUser(targetUser);
    setCurrentUser(targetUser);
    reloadData();
  };

  // Handler for Sale Completed
  const handleCompleteSale = (newOrder: Order) => {
    storageService.createOrder(newOrder);
    reloadData();
    // Promptly open the printable receipt invoice
    setActiveInvoiceOrder(newOrder);
  };

  // Handler for Medicine changes
  const handleSaveMedicine = (med: Medicine) => {
    storageService.saveMedicine(med);
    reloadData();
  };

  const handleDeleteMedicine = (id: string) => {
    storageService.deleteMedicine(id);
    reloadData();
  };

  // Handler for Patient changes
  const handleSavePatient = (pat: Patient) => {
    storageService.savePatient(pat);
    reloadData();
  };

  // Handler for Staff User changes
  const handleCreateUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    storageService.createUser(newUser);
    reloadData();
  };

  const handleUpdateUser = (updatedUser: User) => {
    storageService.updateUser(updatedUser);
    reloadData();
  };

  // Handler for Order status updates
  const handleUpdateOrderStatus = (orderId: string, status: 'Delivered' | 'Pending' | 'Refunded') => {
    storageService.updateOrderStatus(orderId, status);
    reloadData();
  };

  const handleDeleteOrder = (orderId: string) => {
    storageService.deleteOrder(orderId);
    reloadData();
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setIsLoggedIn(false);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    reloadData();
  };

  if (currentScreen === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setCurrentScreen('app')}
          onOpenLogin={() => {
            setCurrentScreen('app');
            setShowLoginModal(true);
          }}
          onOrderCreatedInDb={() => reloadData()}
        />

        <LoginModal
          isOpen={showLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-800 flex overflow-x-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingSyncCount={pendingQueue.length}
        onNavigateToLanding={() => setCurrentScreen('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isOnline={isOnline}
          pendingSyncCount={pendingQueue.length}
          onTriggerSync={handleTriggerSync}
          isSyncing={isSyncing}
          onSwitchUser={handleSwitchRole}
          onLogout={handleLogout}
          medicines={medicines}
          onNavigateToLanding={() => setCurrentScreen('landing')}
          onOpenWhatsAppDelivery={() => setShowWhatsAppModal(true)}
          onOpenGeminiAssistant={() => setShowGeminiChatbot(true)}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardView
              orders={orders}
              medicines={medicines}
              patients={patients}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenOrderInvoice={(order) => setActiveInvoiceOrder(order)}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'sales' && (
            <PosView
              medicines={medicines}
              patients={patients}
              currentUser={currentUser}
              onCompleteSale={handleCompleteSale}
              onOpenPatientModal={() => setActiveTab('customers')}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              medicines={medicines}
              currentUser={currentUser}
              onSaveMedicine={handleSaveMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onReload={reloadData}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onOpenOrderInvoice={(order) => setActiveInvoiceOrder(order)}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'customers' && (
            <PatientEmrView
              patients={patients}
              currentUser={currentUser}
              onSavePatient={handleSavePatient}
              onReload={reloadData}
              onSelectForPos={(patId) => {
                setActiveTab('sales');
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView orders={orders} />
          )}

          {activeTab === 'audit' && (
            <AuditLogView auditLogs={auditLogs} />
          )}

          {activeTab === 'staff' && (
            <StaffRbacView
              users={users}
              currentUser={currentUser}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onSwitchUser={handleSwitchRole}
            />
          )}

          {activeTab === 'sync' && (
            <SyncCenterView
              isOnline={isOnline}
              pendingQueue={pendingQueue}
              lastSyncTime={lastSyncTime}
              isSyncing={isSyncing}
              onTriggerSync={handleTriggerSync}
              currentUser={currentUser}
              onReloadAllData={reloadData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceModal
        order={activeInvoiceOrder}
        onClose={() => setActiveInvoiceOrder(null)}
      />

      {/* Authentication Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* WhatsApp Gazipur Delivery Modal */}
      <WhatsAppDeliveryModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onOrderCreatedInDb={() => reloadData()}
      />

      {/* Gemini AI Clinical Pharmacy Assistant */}
      <GeminiChatbot
        isOpen={showGeminiChatbot}
        onClose={() => setShowGeminiChatbot(false)}
      />
    </div>
  );
}
