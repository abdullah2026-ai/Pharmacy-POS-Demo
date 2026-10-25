import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { User, UserRole } from '../types/pharmacy';

interface StaffRbacViewProps {
  users: User[];
  currentUser: User;
  onCreateUser: (newUser: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (user: User) => void;
  onSwitchUser: (role: UserRole) => void;
}

export const StaffRbacView: React.FC<StaffRbacViewProps> = ({
  users,
  currentUser,
  onCreateUser,
  onUpdateUser,
  onSwitchUser
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PHARMACIST');
  const [phone, setPhone] = useState('+8801');
  const [branch, setBranch] = useState('Dhaka Central Hub - Dhanmondi');

  const isSuperadmin = currentUser.role === 'SUPERADMIN';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Name, Email and Password are required.');
      return;
    }

    onCreateUser({
      name,
      email,
      password,
      role,
      phone,
      branch,
      status: 'ACTIVE'
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
    setPassword('');
    setRole('PHARMACIST');
    setPhone('+8801');
  };

  const toggleStatus = (user: User) => {
    if (user.id === currentUser.id) {
      alert('You cannot suspend your currently active administrator session.');
      return;
    }
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    onUpdateUser({ ...user, status: newStatus });
  };

  const roleBadgeStyle = (userRole: UserRole) => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'bg-[#062822] text-[#bbf246]';
      case 'PHARMACIST':
        return 'bg-emerald-100 text-emerald-800';
      case 'CASHIER':
        return 'bg-blue-100 text-blue-800';
      case 'INVENTORY_MANAGER':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Staff & Role-Based Access Control (RBAC)</h2>
          </div>
          <p className="text-xs text-slate-500">
            Granular permissions for Pharmacists, Cashiers, and Inventory Managers
          </p>
        </div>

        {isSuperadmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="neu-accent-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        )}
      </div>

      {/* Staff Accounts Table */}
      <div className="neu-flat p-5 rounded-3xl">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Registered Pharmacy Personnel</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Staff Member</th>
                <th className="pb-3">Security Role</th>
                <th className="pb-3">Contact Phone</th>
                <th className="pb-3">Branch Location</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-medium text-slate-900">
                      <div>
                        <span className="font-bold">{u.name} {isCurrent && '(You)'}</span>
                        <span className="block text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${roleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 font-mono text-slate-700">{u.phone}</td>
                    <td className="py-3.5 text-slate-600">{u.branch}</td>

                    <td className="py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isSuperadmin && !isCurrent && (
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              u.status === 'ACTIVE' 
                                ? 'neu-btn text-rose-600 hover:bg-rose-50' 
                                : 'neu-btn text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => onSwitchUser(u.role)}
                          className="neu-btn px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 hover:text-slate-900"
                        >
                          Simulate View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="neu-flat p-5 rounded-3xl">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Role Permissions Matrix</h3>
        <p className="text-xs text-slate-500 mb-4">
          Hierarchical privilege boundary enforced for data privacy & Bangladesh DGDA compliance
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-3">Functional Capability</th>
                <th className="p-3 text-center">SUPERADMIN</th>
                <th className="p-3 text-center">PHARMACIST</th>
                <th className="p-3 text-center">CASHIER</th>
                <th className="p-3 text-center">INVENTORY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 font-semibold text-slate-800">POS Sales Dispensing & Billing</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-slate-400">Read-only</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Patient EMR & Allergy Records</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-slate-400">Read-only</td>
                <td className="p-3 text-center text-rose-500">✗ Blocked</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Inventory Stock Intake & Expiry Marking</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-slate-400">Read-only</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Regulatory Audit Logs & Compliance Export</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full (Export)</td>
                <td className="p-3 text-center text-slate-400">Read-only</td>
                <td className="p-3 text-center text-rose-500">✗ Blocked</td>
                <td className="p-3 text-center text-rose-500">✗ Blocked</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Staff Account Creation & Access Governance</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-rose-500">✗ Blocked</td>
                <td className="p-3 text-center text-rose-500">✗ Blocked</td>
                <td className="p-3 text-center text-rose-500">✗ Blocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="neu-convex max-w-md w-full p-6 rounded-3xl border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Provision New Staff Account</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Mahbubur Rahman"
                  className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email / Username *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharma.bd"
                  className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Security Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer"
                  >
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="CASHIER">Sales Cashier</option>
                    <option value="INVENTORY_MANAGER">Inventory Lead</option>
                    <option value="SUPERADMIN">Super Administrator</option>
                  </select>
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801..."
                    className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Branch Location</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-transparent text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="neu-btn px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-accent-btn px-6 py-2 rounded-xl font-bold"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
