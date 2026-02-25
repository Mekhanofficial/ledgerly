import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Repeat, UserMinus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import TablePagination from '../ui/TablePagination';
import { useTablePagination } from '../../hooks/usePagination';

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system control, users & roles' },
  { value: 'admin', label: 'Admin', description: 'Manage invoices, clients, reports' },
  { value: 'accountant', label: 'Accountant', description: 'Invoices, payments, financial reports' },
  { value: 'staff', label: 'Staff/Sales', description: 'Create invoices, assigned clients' },
  { value: 'client', label: 'Client', description: 'Portal access to own invoices' }
];

const summarizePermissions = (permissions = {}) => {
  const badges = [];
  Object.entries(permissions).forEach(([domain, actions]) => {
    Object.entries(actions || {}).forEach(([action, enabled]) => {
      if (enabled) {
        badges.push(`${domain}.${action}`);
      }
    });
  });
  return badges.slice(0, 6);
};

const TeamManagementPanel = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const authUser = useSelector((state) => state.auth.user);
  const canManageTeam = ['super_admin', 'admin'].includes(authUser?.role);
  const canManageRoles = authUser?.role === 'super_admin';
  const isProtectedAdmin = (member) => ['super_admin', 'admin'].includes(member?.role);
  const visibleRoleOptions = canManageRoles
    ? roleOptions
    : roleOptions.filter((option) => option.value !== 'super_admin');

  const [teamMembers, setTeamMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'staff', customerId: '' });
  const [savingInvite, setSavingInvite] = useState(false);
  const [roleSelections, setRoleSelections] = useState({});
  const [processingMember, setProcessingMember] = useState(null);
  const [shareInvite, setShareInvite] = useState({ open: false, url: '', email: '' });

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    if (canManageTeam) {
      fetchCustomers();
    }
  }, [canManageTeam]);

  useEffect(() => {
    const map = {};
    teamMembers.forEach((member) => {
      map[member._id] = member.role;
    });
    setRoleSelections(map);
  }, [teamMembers]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team');
      setTeamMembers(response.data.data || []);
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to load team members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const limit = 200;
      let page = 1;
      let all = [];
      let totalPages = 1;

      for (let guard = 0; guard < 200; guard += 1) {
        const response = await api.get('/customers', { params: { limit, page } });
        const payload = response.data || {};
        const data = Array.isArray(payload.data) ? payload.data : [];
        all = all.concat(data);
        const hasPagination = payload.pages !== undefined || payload.total !== undefined;
        if (!hasPagination) {
          break;
        }
        totalPages = payload.pages ?? Math.ceil((payload.total ?? all.length) / limit);
        if (data.length === 0 || page >= totalPages) {
          break;
        }
        page += 1;
      }

      setCustomers(all);
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to load customers', 'error');
    }
  };

  const handleInviteInput = (event) => {
    const { name, value } = event.target;
    setInviteForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'client' ? { customerId: '' } : {})
    }));
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();
    if (!canManageTeam) {
      addToast('Only admins and super admins can invite team members', 'warning');
      return;
    }

    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      addToast('Name and email are required', 'error');
      return;
    }
    if (inviteForm.role === 'client' && !inviteForm.customerId) {
      addToast('Select a customer for client users', 'error');
      return;
    }

    setSavingInvite(true);
    try {
      const response = await api.post('/team/invite', {
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        customerId: inviteForm.role === 'client' ? inviteForm.customerId : undefined
      });
      const inviteUrl = response?.data?.data?.inviteUrl;
      if (inviteUrl) {
        setShareInvite({
          open: true,
          url: inviteUrl,
          email: inviteForm.email.trim()
        });
      }
      const message = response?.data?.message || 'Invitation sent successfully';
      addToast(message, 'success');
      setInviteForm({ name: '', email: '', role: 'staff', customerId: '' });
      await fetchTeam();
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to invite team member', 'error');
    } finally {
      setSavingInvite(false);
    }
  };

  const updateRole = async (memberId) => {
    if (!canManageTeam) return;
    const newRole = roleSelections[memberId];
    const member = teamMembers.find((item) => item._id === memberId);
    if (!member || member.role === newRole) return;

    setProcessingMember(memberId);
    try {
      await api.put(`/team/${memberId}`, { role: newRole });
      addToast('Role updated successfully', 'success');
      await fetchTeam();
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to update role', 'error');
    } finally {
      setProcessingMember(null);
    }
  };

  const toggleActive = async (memberId, isActive) => {
    if (!canManageTeam) return;
    const member = teamMembers.find((item) => item._id === memberId);
    if (member && isActive === false && isProtectedAdmin(member)) {
      addToast('Admin accounts cannot be deactivated', 'warning');
      return;
    }
    setProcessingMember(memberId);
    try {
      await api.put(`/team/${memberId}`, { isActive });
      addToast(isActive ? 'Team member reactivated' : 'Team member deactivated', 'success');
      await fetchTeam();
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to update status', 'error');
    } finally {
      setProcessingMember(null);
    }
  };

  const resendInvite = async (memberId) => {
    if (!canManageTeam) return;
    setProcessingMember(memberId);
    try {
      const response = await api.post(`/team/${memberId}/resend-invite`);
      const inviteUrl = response?.data?.data?.inviteUrl;
      if (inviteUrl) {
        const member = teamMembers.find((item) => item._id === memberId);
        setShareInvite({
          open: true,
          url: inviteUrl,
          email: member?.email || ''
        });
      }
      const message = response?.data?.message || 'Invitation resent';
      addToast(message, 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to resend invitation', 'error');
    } finally {
      setProcessingMember(null);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(shareInvite.url);
      addToast('Invite link copied', 'success');
    } catch (error) {
      addToast('Failed to copy invite link', 'error');
    }
  };

  const shareOnWhatsapp = () => {
    const message = `You are invited to Ledgerly. Click to accept: ${shareInvite.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const visibleTeamMembers = canManageRoles
    ? teamMembers
    : teamMembers.filter((member) => member?.role !== 'super_admin');
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedTeamMembers
  } = useTablePagination(visibleTeamMembers, { initialRowsPerPage: 10 });

  const activeCount = visibleTeamMembers.filter((member) => member.invitationAccepted && member.isActive).length;
  const invitedCount = visibleTeamMembers.length - activeCount;
  const stats = [
    { label: 'Total Members', value: visibleTeamMembers.length },
    { label: 'Active', value: activeCount },
    { label: 'Invited', value: invitedCount }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team & Role Management
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Invite teammates, assign roles, and control access for your business.
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isDarkMode ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          <span className="opacity-70">Your role</span>
          <span className="uppercase tracking-wide">{authUser?.role || 'Unknown'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`border rounded-2xl p-4 shadow-sm transition ${
              isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white stat-value-safe">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 border rounded-2xl p-6 ${
            isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team members</h2>
            {canManageTeam ? (
              <span className={`text-[11px] uppercase tracking-wider font-semibold ${
                isDarkMode ? 'text-primary-300' : 'text-primary-600'
              }`}>
                {canManageRoles ? 'Super Admin view' : 'Admin view'}
              </span>
            ) : (
              <span className="text-[11px] uppercase tracking-wider text-gray-400">Read-only</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <tr className={`${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'} text-xs uppercase tracking-wide`}>
                  <th className="py-3 px-3 font-semibold">Name</th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500 dark:text-gray-400">
                      Loading team...
                    </td>
                  </tr>
                ) : visibleTeamMembers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500 dark:text-gray-400">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  paginatedTeamMembers.map((member) => (
                    <tr
                      key={member._id}
                      className={`${isDarkMode ? 'hover:bg-gray-900/30' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="py-3 px-3 space-y-1">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                        <div className="flex flex-wrap gap-1">
                          {summarizePermissions(member.permissions).map((tag) => (
                            <span
                              key={tag}
                              className={`text-[11px] rounded-full px-2 py-0.5 ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={roleSelections[member._id] || member.role}
                          disabled={!canManageTeam}
                          onChange={(event) =>
                            setRoleSelections((prev) => ({ ...prev, [member._id]: event.target.value }))
                          }
                          className={`w-full border rounded-lg px-2 py-2 text-sm transition ${
                            isDarkMode
                              ? 'bg-gray-900/60 border-gray-700 text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                          }`}
                        >
                          {visibleRoleOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            member.invitationAccepted && member.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          {member.invitationAccepted ? 'Active' : 'Invited'}
                        </span>
                        {!member.isActive && <p className="text-[11px] text-red-400 mt-1">Deactivated</p>}
                      </td>
                      <td className="py-3 px-3 space-y-2">
                        <button
                          onClick={() => updateRole(member._id)}
                          disabled={
                            !canManageTeam ||
                            processingMember === member._id ||
                            member.role === roleSelections[member._id]
                          }
                          className={`w-full text-xs text-left font-semibold ${
                            isDarkMode ? 'text-primary-300 hover:text-primary-200' : 'text-primary-600 hover:text-primary-700'
                          }`}
                        >
                          Save role
                        </button>
                        {!member.invitationAccepted && (
                          <button
                            onClick={() => resendInvite(member._id)}
                            disabled={!canManageTeam || processingMember === member._id}
                            className={`w-full text-xs text-left font-semibold ${
                              isDarkMode ? 'text-sky-300 hover:text-sky-200' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <Repeat className="inline-block w-3 h-3 mr-1" />
                            Resend invite
                          </button>
                        )}
                        {isProtectedAdmin(member) && member.isActive ? (
                          <span className="block text-[11px] text-gray-400">Admin accounts can't be deactivated</span>
                        ) : (
                          <button
                            onClick={() => toggleActive(member._id, !member.isActive)}
                            disabled={!canManageTeam || processingMember === member._id}
                            className={`w-full text-xs text-left font-semibold ${
                              isDarkMode ? 'text-rose-300 hover:text-rose-200' : 'text-red-600 hover:text-red-700'
                            }`}
                          >
                            <UserMinus className="inline-block w-3 h-3 mr-1" />
                            {member.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && visibleTeamMembers.length > 0 && (
            <TablePagination
              page={page}
              totalItems={visibleTeamMembers.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              isDarkMode={isDarkMode}
              itemLabel="members"
              className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700"
            />
          )}
        </div>

        <div
          className={`border rounded-2xl p-6 space-y-4 ${
            isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className={`w-5 h-5 ${isDarkMode ? 'text-primary-300' : 'text-primary-600'}`} />
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Invite teammate</h2>
            </div>
            <span className="text-[11px] text-gray-400">Fast onboarding</span>
          </div>
          {!canManageTeam && (
            <p className="text-sm text-gray-400">Only admins and super admins can invite or update team members.</p>
          )}
          <form className="space-y-3" onSubmit={handleInviteSubmit}>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</label>
              <input
                disabled={!canManageTeam}
                name="name"
                value={inviteForm.name}
                onChange={handleInviteInput}
                className={`w-full px-3 py-2 mt-1 rounded-lg border text-sm transition ${
                  isDarkMode
                    ? 'bg-gray-900/60 border-gray-700 text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</label>
              <input
                disabled={!canManageTeam}
                name="email"
                type="email"
                value={inviteForm.email}
                onChange={handleInviteInput}
                className={`w-full px-3 py-2 mt-1 rounded-lg border text-sm transition ${
                  isDarkMode
                    ? 'bg-gray-900/60 border-gray-700 text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
                placeholder="team@example.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</label>
              <select
                disabled={!canManageTeam}
                name="role"
                value={inviteForm.role}
                onChange={handleInviteInput}
                className={`w-full px-3 py-2 mt-1 rounded-lg border text-sm transition ${
                  isDarkMode
                    ? 'bg-gray-900/60 border-gray-700 text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
              >
                {visibleRoleOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {inviteForm.role === 'client' && (
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</label>
                <select
                  disabled={!canManageTeam}
                  name="customerId"
                  value={inviteForm.customerId}
                  onChange={handleInviteInput}
                  className={`w-full px-3 py-2 mt-1 rounded-lg border text-sm transition ${
                    isDarkMode
                      ? 'bg-gray-900/60 border-gray-700 text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                >
                  <option value="" className="bg-white dark:bg-gray-800">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id} className="bg-white dark:bg-gray-800">
                      {customer.name} {customer.email ? `(${customer.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={!canManageTeam || savingInvite}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                savingInvite || !canManageTeam
                  ? 'bg-primary-400 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {savingInvite ? 'Inviting...' : 'Send invitation'}
            </button>
          </form>
          {shareInvite.open && (
            <div className={`space-y-3 border rounded-xl p-4 ${
              isDarkMode ? 'border-primary-700/60 bg-primary-900/20' : 'border-primary-200 bg-primary-50/60'
            }`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-primary-200' : 'text-primary-700'}`}>
                Invite link ready
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Share this link with {shareInvite.email || 'the teammate'} if email delivery isn’t configured.
              </div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareInvite.url}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs ${
                    isDarkMode
                      ? 'bg-gray-900/60 border-gray-700 text-gray-100'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'
                  }`}
                >
                  Copy
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={shareOnWhatsapp}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white"
                >
                  Send via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShareInvite({ open: false, url: '', email: '' })}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                    isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          <div className="text-xs text-gray-400">
            Invited teammates receive a secure email with a seven-day link to complete onboarding.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPanel;
