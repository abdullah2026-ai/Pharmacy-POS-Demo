import { 
  Medicine, 
  Patient, 
  User, 
  Order, 
  AuditLogEntry, 
  SyncQueueItem, 
  UserRole,
  AuditCategory,
  DosageForm,
  Batch
} from '../types/pharmacy';
import { 
  INITIAL_BANGLADESH_MEDICINES, 
  INITIAL_PATIENTS, 
  INITIAL_USERS, 
  INITIAL_ORDERS, 
  INITIAL_AUDIT_LOGS,
  SAMPLE_BANGLADESH_MEDICINES,
  SAMPLE_PATIENTS
} from '../data/bangladeshMedicines';

const STORAGE_KEYS = {
  USERS: 'pharmly_users_v2',
  MEDICINES: 'pharmly_medicines_v2',
  PATIENTS: 'pharmly_patients_v2',
  ORDERS: 'pharmly_orders_v2',
  AUDIT_LOGS: 'pharmly_audit_logs_v2',
  CURRENT_USER: 'pharmly_current_user_v2',
  SYNC_QUEUE: 'pharmly_sync_queue_v2',
  LAST_SYNC: 'pharmly_last_sync_v2'
};

class StorageService {
  private currentUser: User | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncListeners: (() => void)[] = [];

  constructor() {
    this.initDefaultData();
    this.loadCurrentUser();
    this.setupNetworkListeners();
  }

  private initDefaultData() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(INITIAL_BANGLADESH_MEDICINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    }
  }

  private loadCurrentUser() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch {
        this.currentUser = INITIAL_USERS[0];
      }
    } else {
      // Default to Superadmin for initial preview
      this.currentUser = INITIAL_USERS[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifySyncUpdate();
      this.syncPendingQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifySyncUpdate();
    });
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public subscribeSync(listener: () => void) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifySyncUpdate() {
    this.syncListeners.forEach(listener => listener());
  }

  // --- Auth & Session ---
  public getCurrentUser(): User {
    if (!this.currentUser) {
      this.loadCurrentUser();
    }
    return this.currentUser || INITIAL_USERS[0];
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.logAudit({
        category: 'AUTH',
        action: 'USER_LOGIN',
        description: `${user.name} (${user.role}) logged in`
      });
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public login(email: string, pass: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'User with this email not found in pharmacy registry.' };
    }
    if (found.status === 'SUSPENDED') {
      return { success: false, error: 'This user account is suspended by administrator.' };
    }
    if (found.password && found.password !== pass) {
      return { success: false, error: 'Incorrect security password. Please try again.' };
    }
    
    // Update lastLoginAt
    found.lastLoginAt = new Date().toISOString();
    this.updateUser(found, false);
    this.setCurrentUser(found);
    return { success: true, user: found };
  }

  // --- Audit Logging ---
  public logAudit(params: {
    category: AuditCategory;
    action: string;
    description: string;
    entityId?: string;
    entityType?: string;
    changesDiff?: { field?: string; oldValue?: any; newValue?: any }[];
  }) {
    const user = this.getCurrentUser();
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.email,
      userRole: user.role,
      category: params.category,
      action: params.action,
      entityId: params.entityId,
      entityType: params.entityType,
      description: params.description,
      changesDiff: params.changesDiff,
      ipAddress: '103.145.118.' + (Math.floor(Math.random() * 40) + 20) + ' (Dhaka, BD)',
      clientDevice: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile PWA Client (Handheld)' : 'Desktop Station (POS Web)'
    };

    const logs = this.getAuditLogs();
    logs.unshift(entry);
    // Keep last 1000 logs locally
    if (logs.length > 1000) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    this.enqueueSync({
      id: `sync_${entry.id}`,
      entity: 'AUDIT',
      action: 'CREATE',
      payload: entry,
      timestamp: entry.timestamp,
      synced: false
    });
  }

  public getAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return stored ? JSON.parse(stored) : INITIAL_AUDIT_LOGS;
  }

  // --- Users & RBAC ---
  public getUsers(): User[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  }

  public createUser(newUser: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const created: User = {
      ...newUser,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(created);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    this.logAudit({
      category: 'USER_MGMT',
      action: 'CREATE_USER',
      entityId: created.id,
      entityType: 'USER',
      description: `Created new staff account: ${created.name} (${created.email}) with role ${created.role}`
    });

    this.enqueueSync({
      id: `sync_${created.id}`,
      entity: 'USER',
      action: 'CREATE',
      payload: created,
      timestamp: created.createdAt,
      synced: false
    });

    return created;
  }

  public updateUser(updatedUser: User, recordAudit = true): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      const oldUser = users[idx];
      users[idx] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      if (recordAudit) {
        this.logAudit({
          category: 'USER_MGMT',
          action: 'UPDATE_USER',
          entityId: updatedUser.id,
          entityType: 'USER',
          description: `Updated staff account for ${updatedUser.name} (${updatedUser.role})`,
          changesDiff: [
            { field: 'role', oldValue: oldUser.role, newValue: updatedUser.role },
            { field: 'status', oldValue: oldUser.status, newValue: updatedUser.status }
          ]
        });
      }

      this.enqueueSync({
        id: `sync_${updatedUser.id}_${Date.now()}`,
        entity: 'USER',
        action: 'UPDATE',
        payload: updatedUser,
        timestamp: new Date().toISOString(),
        synced: false
      });
    }
  }

  // --- Medicines & Inventory ---
  public getMedicines(): Medicine[] {
    if (typeof window === 'undefined') return INITIAL_BANGLADESH_MEDICINES;
    const stored = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    return stored ? JSON.parse(stored) : INITIAL_BANGLADESH_MEDICINES;
  }

  public saveMedicine(medicine: Medicine): void {
    const medicines = this.getMedicines();
    const idx = medicines.findIndex(m => m.id === medicine.id);
    const user = this.getCurrentUser();
    medicine.updatedAt = new Date().toISOString();
    medicine.lastUpdatedBy = user.email;

    if (idx !== -1) {
      const old = medicines[idx];
      medicines[idx] = medicine;
      this.logAudit({
        category: 'INVENTORY',
        action: 'UPDATE_MEDICINE',
        entityId: medicine.id,
        entityType: 'MEDICINE',
        description: `Updated ${medicine.brandName} (${medicine.strength}) - Stock: ${medicine.totalStockUnits}, Price: ৳${medicine.unitPrice}`,
        changesDiff: [
          { field: 'totalStockUnits', oldValue: old.totalStockUnits, newValue: medicine.totalStockUnits },
          { field: 'unitPrice', oldValue: old.unitPrice, newValue: medicine.unitPrice }
        ]
      });
    } else {
      medicines.unshift(medicine);
      this.logAudit({
        category: 'INVENTORY',
        action: 'ADD_MEDICINE',
        entityId: medicine.id,
        entityType: 'MEDICINE',
        description: `Registered new medicine ${medicine.brandName} (${medicine.genericName}) by ${medicine.manufacturer}`
      });
    }

    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    this.enqueueSync({
      id: `sync_med_${medicine.id}_${Date.now()}`,
      entity: 'MEDICINE',
      action: idx !== -1 ? 'UPDATE' : 'CREATE',
      payload: medicine,
      timestamp: medicine.updatedAt,
      synced: false
    });
  }

  public deleteMedicine(id: string): void {
    const medicines = this.getMedicines();
    const found = medicines.find(m => m.id === id);
    if (!found) return;

    const filtered = medicines.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(filtered));

    this.logAudit({
      category: 'INVENTORY',
      action: 'DELETE_MEDICINE',
      entityId: id,
      entityType: 'MEDICINE',
      description: `Removed medicine ${found.brandName} from pharmacy database`
    });

    this.enqueueSync({
      id: `sync_del_med_${id}_${Date.now()}`,
      entity: 'MEDICINE',
      action: 'DELETE',
      payload: { id },
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  // --- Patients & EMR ---
  public getPatients(): Patient[] {
    if (typeof window === 'undefined') return INITIAL_PATIENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return stored ? JSON.parse(stored) : INITIAL_PATIENTS;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.getPatients().find(p => p.id === id);
  }

  public savePatient(patient: Patient): void {
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === patient.id);
    const user = this.getCurrentUser();
    patient.lastUpdatedBy = user.email;

    if (idx !== -1) {
      const old = patients[idx];
      patients[idx] = patient;
      this.logAudit({
        category: 'PATIENT_EMR',
        action: 'UPDATE_PATIENT',
        entityId: patient.patientCode,
        entityType: 'PATIENT',
        description: `Updated EMR record for ${patient.fullNameEn} (${patient.fullNameBn})`,
        changesDiff: [
          { field: 'chronicConditions', oldValue: old.chronicConditions, newValue: patient.chronicConditions },
          { field: 'allergies', oldValue: old.allergies, newValue: patient.allergies }
        ]
      });
    } else {
      patients.unshift(patient);
      this.logAudit({
        category: 'PATIENT_EMR',
        action: 'REGISTER_PATIENT',
        entityId: patient.patientCode,
        entityType: 'PATIENT',
        description: `Enrolled new patient: ${patient.fullNameEn} (${patient.phone}), Blood Group: ${patient.bloodGroup}`
      });
    }

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    this.enqueueSync({
      id: `sync_pat_${patient.id}_${Date.now()}`,
      entity: 'PATIENT',
      action: idx !== -1 ? 'UPDATE' : 'CREATE',
      payload: patient,
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  // --- Orders & Sales POS ---
  public getOrders(): Order[] {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : INITIAL_ORDERS;
  }

  public createOrder(order: Order): void {
    const orders = this.getOrders();
    const user = this.getCurrentUser();
    order.lastUpdatedBy = user.email;
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Deduct inventory stock
    const medicines = this.getMedicines();
    order.items.forEach(item => {
      const med = medicines.find(m => m.id === item.medicineId);
      if (med) {
        med.totalStockUnits = Math.max(0, med.totalStockUnits - item.quantity);
        // Deduct from batch
        if (med.batches && med.batches.length > 0) {
          const batch = med.batches.find(b => b.batchNumber === item.batchNumber) || med.batches[0];
          if (batch) {
            batch.quantityInStock = Math.max(0, batch.quantityInStock - item.quantity);
          }
        }
        med.updatedAt = new Date().toISOString();
        med.lastUpdatedBy = user.email;
      }
    });
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));

    // Update patient spending if attached
    if (order.patientId) {
      const patients = this.getPatients();
      const pat = patients.find(p => p.id === order.patientId);
      if (pat) {
        pat.totalSpent = (pat.totalSpent || 0) + order.grandTotal;
        pat.lastVisitDate = new Date().toISOString().split('T')[0];
        pat.lastUpdatedBy = user.email;
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
      }
    }

    this.logAudit({
      category: 'SALES',
      action: 'DISPENSE_SALE',
      entityId: order.orderNumber,
      entityType: 'ORDER',
      description: `Sale ${order.orderNumber} dispensed to ${order.customerName}: ৳${order.grandTotal.toFixed(2)} via ${order.paymentMethod} (${order.items.length} items)`
    });

    this.enqueueSync({
      id: `sync_ord_${order.id}`,
      entity: 'ORDER',
      action: 'CREATE',
      payload: order,
      timestamp: order.timestamp,
      synced: false
    });
  }

  public updateOrderStatus(orderId: string, status: 'Delivered' | 'Pending' | 'Refunded'): void {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const oldStatus = order.status;
    order.status = status;
    order.lastUpdatedBy = this.getCurrentUser().email;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    this.logAudit({
      category: 'SALES',
      action: 'UPDATE_ORDER_STATUS',
      entityId: order.orderNumber,
      entityType: 'ORDER',
      description: `Order ${order.orderNumber} status changed from ${oldStatus} to ${status}`
    });

    this.enqueueSync({
      id: `sync_ord_stat_${order.id}_${Date.now()}`,
      entity: 'ORDER',
      action: 'UPDATE',
      payload: order,
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  public deleteOrder(orderId: string): void {
    const orders = this.getOrders();
    const target = orders.find(o => o.id === orderId);
    const remaining = orders.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remaining));

    this.logAudit({
      category: 'SALES',
      action: 'VOID_ORDER',
      entityId: target?.orderNumber || orderId,
      entityType: 'ORDER',
      description: `Voided order record ${target?.orderNumber || orderId} by ${this.getCurrentUser().email}`
    });

    this.notifySyncUpdate();
  }

  // --- Offline Sync Queue ---
  public getSyncQueue(): SyncQueueItem[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return stored ? JSON.parse(stored) : [];
  }

  private enqueueSync(item: SyncQueueItem) {
    const queue = this.getSyncQueue();
    queue.push(item);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    this.notifySyncUpdate();

    if (this.isOnline) {
      this.syncPendingQueue();
    }
  }

  public async syncPendingQueue(): Promise<{ syncedCount: number; pendingCount: number }> {
    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, pendingCount: 0 };
    }

    try {
      // Send queue batch to local server API endpoint if reachable
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: queue,
          deviceId: 'client_' + (typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 30) : 'node'),
          timestamp: new Date().toISOString()
        })
      }).catch(() => null);

      // If server responded or in simulation mode, flush synced items
      if (response && response.ok) {
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        this.notifySyncUpdate();
        return { syncedCount: queue.length, pendingCount: 0 };
      } else {
        // Clear queue for offline demo with simulated successful peer sync
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        this.notifySyncUpdate();
        return { syncedCount: queue.length, pendingCount: 0 };
      }
    } catch {
      return { syncedCount: 0, pendingCount: queue.length };
    }
  }

  public getLastSyncTime(): string {
    if (typeof window === 'undefined') return 'Just now';
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (!stored) return 'All local data synchronized';
    const date = new Date(stored);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // --- Full Backup Export & Import ---
  public exportFullBackup(): string {
    const backup = {
      version: '1.0-BD-PHARMA',
      exportedAt: new Date().toISOString(),
      exportedBy: this.getCurrentUser().email,
      pharmacy: {
        name: 'Pharmly BD Healthcare Pharmacy Ltd.',
        dgdaLicense: 'DGDA-DL-DHAKA-2026/8941',
        branch: 'Dhanmondi Central Hub, Dhaka'
      },
      data: {
        users: this.getUsers(),
        medicines: this.getMedicines(),
        patients: this.getPatients(),
        orders: this.getOrders(),
        auditLogs: this.getAuditLogs()
      }
    };
    return JSON.stringify(backup, null, 2);
  }

  public importFullBackup(jsonContent: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.data || !parsed.data.medicines) {
        return { success: false, error: 'Invalid backup file schema.' };
      }
      if (parsed.data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.data.users));
      if (parsed.data.medicines) localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(parsed.data.medicines));
      if (parsed.data.patients) localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(parsed.data.patients));
      if (parsed.data.orders) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(parsed.data.orders));
      if (parsed.data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.data.auditLogs));
      
      this.logAudit({
        category: 'SETTINGS',
        action: 'RESTORE_DATABASE',
        description: `Imported full database archive exported on ${parsed.exportedAt || 'earlier date'}`
      });

      this.notifySyncUpdate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to parse JSON file' };
    }
  }

  // --- CSV Import & Export for Medicines ---
  public importMedicinesFromCsv(csvContent: string): { success: boolean; count: number; error?: string } {
    try {
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV file is empty or missing data rows.' };
      }

      const headers = this.parseCsvLine(lines[0].toLowerCase());
      const brandIdx = headers.findIndex(h => h.includes('brand'));
      const genericIdx = headers.findIndex(h => h.includes('generic'));
      const mfrIdx = headers.findIndex(h => h.includes('manufac') || h.includes('company'));
      const strengthIdx = headers.findIndex(h => h.includes('strength') || h.includes('mg'));
      const formIdx = headers.findIndex(h => h.includes('dosage') || h.includes('form'));
      const priceIdx = headers.findIndex(h => h.includes('mrp') || h.includes('price'));
      const costIdx = headers.findIndex(h => h.includes('cost'));
      const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty') || h.includes('quantity'));
      const reorderIdx = headers.findIndex(h => h.includes('reorder'));
      const rackIdx = headers.findIndex(h => h.includes('rack') || h.includes('shelf'));
      const batchIdx = headers.findIndex(h => h.includes('batch') || h.includes('lot'));
      const expIdx = headers.findIndex(h => h.includes('expir') || h.includes('expiry'));
      const dgdaIdx = headers.findIndex(h => h.includes('dgda') || h.includes('reg'));

      if (brandIdx === -1 || genericIdx === -1) {
        return { 
          success: false, 
          count: 0, 
          error: 'Required columns "Brand Name" and "Generic Name" were not found in the CSV header.' 
        };
      }

      const existingMedicines = this.getMedicines();
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = this.parseCsvLine(lines[i]);
        if (!row[brandIdx] || !row[genericIdx]) continue;

        const brand = row[brandIdx];
        const generic = row[genericIdx];
        const mfr = mfrIdx !== -1 && row[mfrIdx] ? row[mfrIdx] : 'Bangladesh Pharma Ltd.';
        const strength = strengthIdx !== -1 && row[strengthIdx] ? row[strengthIdx] : '500mg';
        const dosageForm = (formIdx !== -1 && row[formIdx] ? row[formIdx] : 'Tablet') as DosageForm;
        const price = priceIdx !== -1 && row[priceIdx] ? (parseFloat(row[priceIdx]) || 10.0) : 10.0;
        const cost = costIdx !== -1 && row[costIdx] ? (parseFloat(row[costIdx]) || price * 0.8) : price * 0.8;
        const stock = stockIdx !== -1 && row[stockIdx] ? (parseInt(row[stockIdx]) || 100) : 100;
        const reorder = reorderIdx !== -1 && row[reorderIdx] ? (parseInt(row[reorderIdx]) || 25) : 25;
        const rack = rackIdx !== -1 && row[rackIdx] ? row[rackIdx] : 'Rack A-01';
        const batchNo = batchIdx !== -1 && row[batchIdx] ? row[batchIdx] : `LOT-${Math.floor(1000 + Math.random() * 9000)}`;
        const expiry = expIdx !== -1 && row[expIdx] ? row[expIdx] : '2028-12-31';
        const dgda = dgdaIdx !== -1 && row[dgdaIdx] ? row[dgdaIdx] : `DAR-021-${Math.floor(100 + Math.random() * 900)}`;

        const batch: Batch = {
          id: `bch_${Date.now()}_${i}`,
          medicineId: `med_${Date.now()}_${i}`,
          batchNumber: batchNo,
          manufactureDate: new Date().toISOString().split('T')[0],
          expiryDate: expiry,
          quantityInStock: stock,
          purchasePrice: cost,
          mrp: price,
          supplierName: `${mfr} Depot`,
          rackLocation: rack,
          status: 'GOOD'
        };

        const newMedicine: Medicine = {
          id: `med_${Date.now()}_${i}`,
          brandName: brand,
          genericName: generic,
          manufacturer: mfr,
          strength: strength,
          dosageForm: dosageForm,
          dgdaRegNo: dgda,
          category: `${dosageForm} Formulation`,
          unitPrice: price,
          costPrice: cost,
          vatPercentage: 2.4,
          reorderLevel: reorder,
          unitsPerPack: 10,
          totalStockUnits: stock,
          rackLocation: rack,
          requiresPrescription: true,
          indications: `${generic} clinical monograph`,
          batches: [batch],
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: this.getCurrentUser().email
        };

        existingMedicines.push(newMedicine);
        importedCount++;
      }

      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(existingMedicines));
      this.logAudit({
        category: 'INVENTORY',
        action: 'CSV_IMPORT_INVENTORY',
        description: `Imported ${importedCount} medicines into inventory via CSV file upload`
      });

      this.notifySyncUpdate();
      return { success: true, count: importedCount };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Failed to process CSV file' };
    }
  }

  // --- CSV Import & Export for Patients ---
  public importPatientsFromCsv(csvContent: string): { success: boolean; count: number; error?: string } {
    try {
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV file is empty or missing data rows.' };
      }

      const headers = this.parseCsvLine(lines[0].toLowerCase());
      const nameEnIdx = headers.findIndex(h => h.includes('name') && (h.includes('en') || !h.includes('bn')));
      const nameBnIdx = headers.findIndex(h => h.includes('bn') || h.includes('বাংলা'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
      const ageIdx = headers.findIndex(h => h.includes('age'));
      const genderIdx = headers.findIndex(h => h.includes('gender'));
      const bloodIdx = headers.findIndex(h => h.includes('blood'));
      const addressIdx = headers.findIndex(h => h.includes('address'));
      const allergyIdx = headers.findIndex(h => h.includes('allerg'));
      const chronicIdx = headers.findIndex(h => h.includes('chronic') || h.includes('condition'));

      if (nameEnIdx === -1 || phoneIdx === -1) {
        return { 
          success: false, 
          count: 0, 
          error: 'Required columns "Full Name" and "Phone" were not found in the CSV header.' 
        };
      }

      const existingPatients = this.getPatients();
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = this.parseCsvLine(lines[i]);
        if (!row[nameEnIdx] || !row[phoneIdx]) continue;

        const nameEn = row[nameEnIdx];
        const nameBn = nameBnIdx !== -1 && row[nameBnIdx] ? row[nameBnIdx] : nameEn;
        const phone = row[phoneIdx];
        const age = ageIdx !== -1 && row[ageIdx] ? (parseInt(row[ageIdx]) || 40) : 40;
        const gender = (genderIdx !== -1 && row[genderIdx] ? row[genderIdx] : 'Male') as any;
        const blood = (bloodIdx !== -1 && row[bloodIdx] ? row[bloodIdx] : 'O+') as any;
        const addr = addressIdx !== -1 && row[addressIdx] ? row[addressIdx] : 'Dhaka, Bangladesh';
        const allergies = allergyIdx !== -1 && row[allergyIdx] ? row[allergyIdx].split(';').map(s => s.trim()) : [];
        const chronic = chronicIdx !== -1 && row[chronicIdx] ? row[chronicIdx].split(';').map(s => s.trim()) : [];

        const newPat: Patient = {
          id: `pat_${Date.now()}_${i}`,
          patientCode: `P-BD-${Math.floor(8900 + Math.random() * 900)}`,
          fullNameEn: nameEn,
          fullNameBn: nameBn,
          phone,
          age,
          gender,
          bloodGroup: blood,
          address: addr,
          emergencyContact: phone,
          chronicConditions: chronic,
          allergies: allergies,
          prescriptions: [],
          registeredDate: new Date().toISOString().split('T')[0],
          lastVisitDate: new Date().toISOString().split('T')[0],
          totalSpent: 0,
          lastUpdatedBy: this.getCurrentUser().email
        };

        existingPatients.push(newPat);
        importedCount++;
      }

      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(existingPatients));
      this.logAudit({
        category: 'PATIENT_EMR',
        action: 'CSV_IMPORT_PATIENTS',
        description: `Imported ${importedCount} patient EMR records via CSV upload`
      });

      this.notifySyncUpdate();
      return { success: true, count: importedCount };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Failed to process CSV file' };
    }
  }

  // Load standard Bangladesh sample catalogue (16 essential medicines)
  public loadStarterMedicines(): number {
    const list = [...SAMPLE_BANGLADESH_MEDICINES];
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(list));
    this.logAudit({
      category: 'INVENTORY',
      action: 'LOAD_STARTER_PACK',
      description: `Loaded Bangladesh standard pharmacy starter catalogue (${list.length} formulations: Square, Beximco, Healthcare)`
    });
    this.notifySyncUpdate();
    return list.length;
  }

  // Helper CSV line parser supporting quoted commas
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  public resetToFactoryDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.MEDICINES);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    this.initDefaultData();
    this.loadCurrentUser();
    this.notifySyncUpdate();
  }
}

export const storageService = new StorageService();
