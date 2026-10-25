import React, { useState, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileText, 
  AlertTriangle, 
  HeartPulse, 
  Calendar, 
  Phone, 
  MapPin, 
  UserPlus, 
  Pill, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  ChevronRight,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Patient, Prescription, PrescribedItem, User } from '../types/pharmacy';
import { storageService } from '../services/storageService';

interface PatientEmrViewProps {
  patients: Patient[];
  currentUser: User;
  onSavePatient: (patient: Patient) => void;
  onSelectForPos?: (patientId: string) => void;
  onReload?: () => void;
}

export const PatientEmrView: React.FC<PatientEmrViewProps> = ({
  patients,
  currentUser,
  onSavePatient,
  onSelectForPos,
  onReload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);

  // New Patient Form state
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [phone, setPhone] = useState('+8801');
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('B+');
  const [address, setAddress] = useState('Dhaka, Bangladesh');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicText, setChronicText] = useState('');

  // New Prescription Form state
  const [rxDoctor, setRxDoctor] = useState('Prof. Dr. Tanvir Ahmed');
  const [rxHospital, setRxHospital] = useState('Dhaka Medical College & Hospital');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxSchedule, setRxSchedule] = useState('1+0+1');
  const [rxDuration, setRxDuration] = useState('14 Days');
  const [rxTiming, setRxTiming] = useState('খাবারের পর');

  // Filtered patients
  const filteredPatients = patients.filter(p => 
    p.fullNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.fullNameBn.includes(searchQuery) ||
    p.phone.includes(searchQuery) ||
    p.patientCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !phone.trim()) {
      alert('Patient English name and phone number are required.');
      return;
    }

    const newCode = `P-BD-${Math.floor(8900 + Math.random() * 900)}`;
    const newPat: Patient = {
      id: `pat_${Date.now()}`,
      patientCode: newCode,
      fullNameEn: nameEn,
      fullNameBn: nameBn || nameEn,
      phone,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      chronicConditions: chronicText ? chronicText.split(',').map(s => s.trim()) : [],
      allergies: allergiesText ? allergiesText.split(',').map(s => s.trim()) : [],
      prescriptions: [],
      registeredDate: new Date().toISOString().split('T')[0],
      lastVisitDate: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      lastUpdatedBy: currentUser.email
    };

    onSavePatient(newPat);
    setSelectedPatientId(newPat.id);
    setShowAddPatientModal(false);

    // Reset form
    setNameEn('');
    setNameBn('');
    setPhone('+8801');
    setAllergiesText('');
    setChronicText('');
  };

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !rxDrugName.trim()) {
      alert('Please enter prescribed medication.');
      return;
    }

    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      prescriptionCode: `RX-2026-${Math.floor(100 + Math.random() * 900)}`,
      doctorName: rxDoctor,
      doctorDegrees: 'MBBS, FCPS',
      hospitalOrClinic: rxHospital,
      date: new Date().toISOString().split('T')[0],
      diagnosis: rxDiagnosis || 'General Clinical Review',
      clinicalNotes: rxNotes,
      medicines: [
        {
          drugName: rxDrugName,
          generic: 'Active ingredient',
          dosageSchedule: rxSchedule,
          duration: rxDuration,
          timing: rxTiming
        }
      ]
    };

    const updated = {
      ...selectedPatient,
      prescriptions: [newRx, ...(selectedPatient.prescriptions || [])],
      lastVisitDate: new Date().toISOString().split('T')[0]
    };

    onSavePatient(updated);
    setShowAddPrescriptionModal(false);
    setRxDrugName('');
    setRxDiagnosis('');
    setRxNotes('');
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = storageService.importPatientsFromCsv(text);
        if (res.success) {
          setCsvNotice(`Successfully imported ${res.count} patients into EMR registry!`);
          setTimeout(() => setCsvNotice(null), 5000);
          if (onReload) onReload();
        } else {
          alert(`Patient CSV Import Error: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadPatientsCsvTemplate = () => {
    const headers = [
      'Full Name (English)',
      'Full Name (Bangla)',
      'Phone',
      'Age',
      'Gender',
      'Blood Group',
      'Address',
      'Allergies (semicolon separated)',
      'Chronic Conditions (semicolon separated)'
    ];
    const sampleRows = [
      ['Mohammad Rafiqul Islam', 'মোঃ রফিকুল ইসলাম', '+8801711223344', '54', 'Male', 'B+', 'House 12, Road 4, Mirpur-10, Dhaka', 'Penicillin', 'Type 2 Diabetes; Hypertension'],
      ['Begum Rokeya Sultana', 'বেগম রোকেয়া সুলতানা', '+8801819876543', '42', 'Female', 'O+', 'Sector 7, Uttara, Dhaka', 'Sulfa drugs', 'Bronchial Asthma; Allergic Rhinitis'],
      ['Tanvir Hossain', 'তানভীর হোসেন', '+8801912345678', '29', 'Male', 'A+', 'Dhanmondi 27, Dhaka', '', 'Migraine'],
      ['Nasreen Akhtar', 'নাসরিন আক্তার', '+8801671123456', '36', 'Female', 'AB+', 'Chawkbazar, Chittagong', 'Aspirin', 'Gastric Ulcer']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bangladesh_patient_emr_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPatientsCsv = () => {
    if (patients.length === 0) {
      alert('No patient records to export.');
      return;
    }
    const headers = ['Patient Code', 'Full Name (English)', 'Full Name (Bangla)', 'Phone', 'Age', 'Gender', 'Blood Group', 'Address', 'Allergies', 'Chronic Conditions', 'Total Spent'];
    const rows = patients.map(p => [
      p.patientCode,
      p.fullNameEn,
      p.fullNameBn,
      p.phone,
      p.age.toString(),
      p.gender,
      p.bloodGroup,
      p.address,
      p.allergies.join('; '),
      p.chronicConditions.join('; '),
      p.totalSpent.toString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pharmly_patients_emr_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCsvFileUpload}
        accept=".csv,text/csv"
        className="hidden"
      />

      {/* CSV Notice Banner */}
      {csvNotice && (
        <div className="neu-flat p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold">{csvNotice}</p>
          </div>
          <button 
            onClick={() => setCsvNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Patient Electronic Medical Records (EMR)</h2>
          <p className="text-xs text-slate-500">Longitudinal Clinical Dossier, Chronic Conditions & Allergy Surveillance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import patient records from CSV file"
            className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 hover:text-emerald-700"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          {/* CSV Template */}
          <button
            onClick={downloadPatientsCsvTemplate}
            title="Download blank CSV template for patient registry"
            className="neu-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">CSV Template</span>
          </button>

          {/* Export CSV */}
          {patients.length > 0 && (
            <button
              onClick={exportPatientsCsv}
              title="Export all registered patients to CSV"
              className="neu-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Enroll New Patient Button */}
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="neu-accent-btn px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll New Patient</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: List on Left, Comprehensive Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Patient directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="neu-flat p-3 rounded-2xl">
            <div className="neu-sunken flex items-center px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, code..."
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="neu-flat p-6 rounded-2xl text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">
                  {patients.length === 0 ? 'No Patients Registered Yet' : 'No Patients Found'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {patients.length === 0 
                    ? 'Enroll patients manually or upload a CSV file.'
                    : 'No matches found. Clear search.'}
                </p>
                {patients.length === 0 && (
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => setShowAddPatientModal(true)}
                      className="neu-accent-btn px-3 py-1.5 rounded-xl text-xs font-bold w-full"
                    >
                      + Enroll First Patient
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 w-full flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload Patients CSV</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredPatients.map(p => {
                const isSelected = p.id === selectedPatient?.id;
                const hasAllergy = p.allergies && p.allergies.length > 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'neu-convex ring-2 ring-emerald-600/30 border-l-4 border-l-emerald-600' 
                        : 'neu-flat hover:translate-x-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{p.fullNameEn}</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200 text-slate-600">
                          {p.bloodGroup}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{p.fullNameBn}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.phone} · {p.patientCode}</p>

                      {hasAllergy && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-md">
                          <AlertTriangle className="w-2.5 h-2.5" /> Allergy: {p.allergies.join(', ')}
                        </span>
                      )}
                    </div>

                    <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-emerald-700' : ''}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (8 cols): Complete Medical Dossier */}
        <div className="lg:col-span-8 space-y-5">
          {selectedPatient ? (
            <>
              {/* Patient Profile Card */}
              <div className="neu-flat p-5 lg:p-6 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl neu-flat-sm flex items-center justify-center font-bold text-emerald-800 text-lg">
                      {selectedPatient.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{selectedPatient.fullNameEn}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                          {selectedPatient.patientCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {selectedPatient.fullNameBn} · {selectedPatient.gender}, {selectedPatient.age} years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddPrescriptionModal(true)}
                      className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Prescription</span>
                    </button>
                    {onSelectForPos && (
                      <button
                        onClick={() => onSelectForPos(selectedPatient.id)}
                        className="neu-accent-btn px-3.5 py-1.5 rounded-xl text-xs font-bold"
                      >
                        Dispense in POS
                      </button>
                    )}
                  </div>
                </div>

                {/* Vitals & Contact Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="neu-sunken-sm p-3 rounded-2xl flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                      <p className="font-bold text-slate-800 font-mono truncate">{selectedPatient.phone}</p>
                    </div>
                  </div>

                  <div className="neu-sunken-sm p-3 rounded-2xl flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Residential Address</p>
                      <p className="font-semibold text-slate-800 truncate">{selectedPatient.address}</p>
                    </div>
                  </div>

                  <div className="neu-sunken-sm p-3 rounded-2xl flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Lifetime Orders</p>
                      <p className="font-bold text-emerald-700 font-mono">৳{(selectedPatient.totalSpent || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Safety & Clinical Risk Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Allergies Box */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Documented Drug Hypersensitivities</span>
                    </div>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPatient.allergies.map(a => (
                          <span key={a} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-200/90 text-rose-900 border border-rose-300">
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-700/70">No active drug allergies documented.</p>
                    )}
                  </div>

                  {/* Chronic Illnesses */}
                  <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span>Chronic Medical Conditions</span>
                    </div>
                    {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPatient.chronicConditions.map(c => (
                          <span key={c} className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white text-slate-800 border border-slate-300 shadow-xs">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No chronic illnesses recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prescription History Timeline */}
              <div className="neu-flat p-5 lg:p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-base font-bold text-slate-900">Physician Prescriptions & Regimens</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedPatient.prescriptions?.length || 0} Prescriptions Recorded
                  </span>
                </div>

                <div className="space-y-4">
                  {(!selectedPatient.prescriptions || selectedPatient.prescriptions.length === 0) ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No prescriptions on record. Click "+ Add Prescription" to register new medical notes.
                    </div>
                  ) : (
                    selectedPatient.prescriptions.map(rx => (
                      <div key={rx.id} className="neu-sunken-sm p-4 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                          <div>
                            <span className="font-bold text-xs text-slate-900">{rx.doctorName}</span>
                            <span className="text-[11px] text-slate-500 block">{rx.hospitalOrClinic}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-[11px] font-bold text-emerald-700">{rx.prescriptionCode}</span>
                            <span className="block text-[10px] text-slate-400">{rx.date}</span>
                          </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="text-xs">
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Diagnosis / Symptoms</span>
                          <p className="font-semibold text-slate-800">{rx.diagnosis}</p>
                        </div>

                        {/* Prescribed Drugs Schedule */}
                        <div className="bg-white/80 p-3 rounded-xl border border-slate-200/70 space-y-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            Prescribed Pharmaceuticals & Regimen:
                          </span>
                          <div className="divide-y divide-slate-100">
                            {rx.medicines.map((med, idx) => (
                              <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-900">{med.drugName}</span>
                                  <span className="text-[11px] text-slate-500 ml-1.5 font-mono">({med.dosageSchedule})</span>
                                </div>
                                <div className="text-right">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                                    {med.timing}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-2">{med.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {rx.clinicalNotes && (
                          <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                            Doctor Notes: {rx.clinicalNotes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="neu-flat p-12 text-center text-slate-500 rounded-3xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl neu-flat flex items-center justify-center text-slate-400">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {patients.length === 0 ? 'No Patient EMR Records Available' : 'Select a Patient'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {patients.length === 0
                    ? 'Begin by enrolling a new patient manually or importing from a CSV file to track clinical history and drug allergies.'
                    : 'Choose a patient from the left column to view their medical history, prescriptions, and allergy profile.'}
                </p>
              </div>
              {patients.length === 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="neu-accent-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enroll Patient Manually</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="neu-btn px-4 py-2 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload CSV File</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add New Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="neu-convex max-w-lg w-full p-6 rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Enroll New Bangladesh Patient</h3>
              <button 
                onClick={() => setShowAddPatientModal(false)}
                className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Mohammad Rahim"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="e.g. মোঃ রহিম"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801..."
                    className="w-full bg-transparent font-mono font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as any)}
                    className="w-full bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Thana, District"
                  className="w-full bg-transparent font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-rose-600 uppercase block mb-1">
                  ⚠️ Known Drug Allergies (Comma-separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Amoxicillin, NSAIDs, Sulfa"
                  className="w-full bg-transparent font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Chronic Conditions (Comma-separated)
                </label>
                <input
                  type="text"
                  value={chronicText}
                  onChange={(e) => setChronicText(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  className="w-full bg-transparent font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="neu-btn px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-accent-btn px-6 py-2 rounded-xl font-bold"
                >
                  Save EMR Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {showAddPrescriptionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="neu-convex max-w-lg w-full p-6 rounded-3xl border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Add Prescription for {selectedPatient?.fullNameEn}
              </h3>
              <button 
                onClick={() => setShowAddPrescriptionModal(false)}
                className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPrescription} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    value={rxDoctor}
                    onChange={(e) => setRxDoctor(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={rxHospital}
                    onChange={(e) => setRxHospital(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  placeholder="e.g. Hypertension with Gastric Dyspepsia"
                  className="w-full bg-transparent text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Prescribed Drug *</label>
                  <input
                    type="text"
                    required
                    value={rxDrugName}
                    onChange={(e) => setRxDrugName(e.target.value)}
                    placeholder="e.g. Seclo 20"
                    className="w-full bg-transparent font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Schedule</label>
                  <input
                    type="text"
                    value={rxSchedule}
                    onChange={(e) => setRxSchedule(e.target.value)}
                    placeholder="1+0+1"
                    className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Timing (বাংলা)</label>
                  <input
                    type="text"
                    value={rxTiming}
                    onChange={(e) => setRxTiming(e.target.value)}
                    placeholder="খাবারের পর"
                    className="w-full bg-transparent text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Doctor Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="Follow-up instructions or dietary caution..."
                  className="w-full bg-transparent text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPrescriptionModal(false)}
                  className="neu-btn px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-accent-btn px-6 py-2 rounded-xl font-bold"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
