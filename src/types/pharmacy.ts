export type UserRole = 'SUPERADMIN' | 'PHARMACIST' | 'CASHIER' | 'INVENTORY_MANAGER';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone: string;
  branch: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt?: string;
}

export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Suspension' 
  | 'Injection' 
  | 'Eye Drops' 
  | 'Ointment' 
  | 'Inhaler'
  | 'Suppository';

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantityInStock: number;
  purchasePrice: number; // in BDT ৳
  mrp: number; // Maximum Retail Price in BDT ৳
  supplierName: string;
  rackLocation: string; // e.g. "Rack A-3", "Cold Storage"
  status: 'GOOD' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string; // e.g. Square Pharmaceuticals, Beximco, Incepta
  strength: string; // e.g. 500mg, 20mg, 10mg/5ml
  dosageForm: DosageForm;
  dgdaRegNo: string; // Bangladesh DGDA registration number
  category: string; // e.g. Analgesic, PPI, Antibiotic, Antihistamine, Antidiabetic
  unitPrice: number; // MRP in BDT ৳
  costPrice: number; // in BDT ৳
  vatPercentage: number; // e.g. 2.4% standard BD pharmacy VAT
  reorderLevel: number;
  unitsPerPack: number; // e.g. 10 tablets per strip
  totalStockUnits: number;
  rackLocation: string;
  requiresPrescription: boolean;
  indications: string;
  sideEffects?: string;
  contraindications?: string;
  batches: Batch[];
  updatedAt: string;
  lastUpdatedBy: string;
}

export interface CartItem {
  medicineId: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  batchNumber: string;
  unitPrice: number;
  quantity: number;
  discountPercentage: number;
  total: number;
}

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'DUE';

export interface Order {
  id: string;
  orderNumber: string; // e.g. #ORD576
  patientId?: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: 'Delivered' | 'Pending' | 'Refunded';
  cashierId: string;
  cashierName: string;
  doctorName?: string;
  prescriptionNumber?: string;
  notes?: string;
  timestamp: string; // ISO String
  lastUpdatedBy: string;
}

export interface PrescribedItem {
  drugName: string;
  generic: string;
  dosageSchedule: string; // e.g. "1+0+1" or "সকালে ১টি + রাতে ১টি"
  duration: string; // e.g. "7 days"
  timing: string; // "খাবারের পর" / "খাবারের আগে"
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  doctorName: string;
  doctorDegrees: string;
  hospitalOrClinic: string;
  date: string;
  diagnosis: string;
  medicines: PrescribedItem[];
  clinicalNotes?: string;
}

export interface Patient {
  id: string;
  patientCode: string; // e.g. P-BD-8901
  fullNameEn: string;
  fullNameBn: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  nidOrIdNumber?: string;
  emergencyContact: string;
  chronicConditions: string[]; // e.g. ["Type 2 Diabetes", "Hypertension", "Asthma"]
  allergies: string[]; // e.g. ["Penicillin", "NSAIDs", "Sulfa"]
  prescriptions: Prescription[];
  registeredDate: string;
  lastVisitDate: string;
  totalSpent: number;
  lastUpdatedBy: string;
}

export type AuditCategory = 
  | 'AUTH' 
  | 'SALES' 
  | 'INVENTORY' 
  | 'PATIENT_EMR' 
  | 'USER_MGMT' 
  | 'SYNC' 
  | 'SETTINGS';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: UserRole;
  category: AuditCategory;
  action: string;
  entityId?: string;
  entityType?: string;
  description: string;
  changesDiff?: {
    field?: string;
    oldValue?: any;
    newValue?: any;
  }[];
  ipAddress: string;
  clientDevice: string;
}

export interface SyncQueueItem {
  id: string;
  entity: 'MEDICINE' | 'ORDER' | 'PATIENT' | 'USER' | 'AUDIT';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
  synced: boolean;
}
