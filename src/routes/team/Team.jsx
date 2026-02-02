import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Mail, UserPlus, Repeat, UserMinus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import api from '../../services/api';

const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Full access to every module' },
  { value: 'accountant', label: 'Accountant', description: 'Invoices, payments, reports' },
  { value: 'sales', label: 'Sales', description: 'Invoices, receipts, inventory' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
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

const Team = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const authUser = useSelector((state) => state.auth.user);
  const canManageTeam = authUser?.role === 'admin';

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'sales' });
  const [savingInvite, setSavingInvite] = useState(false);
  const [roleSelections, setRoleSelections] = useState({});
  const [processingMember, setProcessingMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

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

  const handleInviteInput = (event) => {
    const { name, value } = event.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();
    if (!canManageTeam) {
      addToast('Only admins can invite team members', 'warning');
      return;
    }

    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      addToast('Name and email are required', 'error');
      return;
    }

    setSavingInvite(true);
    try {
      await api.post('/team/invite', {
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        role: inviteForm.role
      });
      addToast('Invitation sent successfully', 'success');
      setInviteForm({ name: '', email: '', role: 'sales' });
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
      await api.post(`/team/${memberId}/resend-invite`);
      addToast('Invitation resent', 'success');
    } catch (error) {
      addToast(error?.response?.data?.error || 'Failed to resend invitation', 'error');
    } finally {
      setProcessingMember(null);
    }
  };

  const activeCount = teamMembers.filter((member) => member.invitationAccepted && member.isActive).length;
  const invitedCount = teamMembers.length - activeCount;
  const roleBreakdown = useMemo(() => {
    const counts = {};
    roleOptions.forEach((role) => {
      counts[role.value] = teamMembers.filter((member) => member.role === role.value).length;
    });
    return counts;
  }, [teamMembers]);

  const stats = [
    { label: 'Total Members', value: teamMembers.length },
    { label: 'Active', value: activeCount },
    { label: 'Invited', value: invitedCount }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h1 className={`text-2xl md:text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Team & Role Management
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Invite teammates, assign roles, and control access for your business.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Your role: <span className="font-semibold">{authUser?.role || 'Unknown'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`border rounded-2xl p-4 shadow-sm transition ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
            >
              <p className="text-sm uppercase text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
          <div className={`lg:col-span-2 border rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team members</h2>
              {canManageTeam ? (
                <span className="text-xs uppercase tracking-wider text-primary-500 font-semibold">Admin view</span>
              ) : (
                <span className="text-xs uppercase tracking-wider text-gray-400">Read-only</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">Loading team...</td>
                    </tr>
                  ) : teamMembers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">No team members found.</td>
                    </tr>
                  ) : (
                    teamMembers.map((member) => (
                      <tr
                        key={member._id}
                        className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                      >
                        <td className="py-3 px-3 space-y-1">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                          <div className="flex flex-wrap gap-1">
                            {summarizePermissions(member.permissions).map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5"
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
                            className="w-full border rounded-lg px-2 py-1 text-sm"
                          >
                            {roleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              member.invitationAccepted && member.isActive
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {member.invitationAccepted ? 'Active' : 'Invited'}
                          </span>
                          {!member.isActive && (
                            <p className="text-[11px] text-red-400 mt-1">Deactivated</p>
                          )}
                        </td>
                        <td className="py-3 px-3 space-y-2">
                          <button
                            onClick={() => updateRole(member._id)}
                            disabled={
                              !canManageTeam ||
                              processingMember === member._id ||
                              member.role === roleSelections[member._id]
                            }
                            className="w-full text-xs text-left text-primary-600 hover:text-primary-800"
                          >
                            Save role
                          </button>
                          {!member.invitationAccepted && (
                            <button
                              onClick={() => resendInvite(member._id)}
                              disabled={!canManageTeam || processingMember === member._id}
                              className="w-full text-xs text-left text-blue-600 hover:text-blue-800"
                            >
                              <Repeat className="inline-block w-3 h-3 mr-1" />
                              Resend invite
                            </button>
                          )}
                          <button
                            onClick={() => toggleActive(member._id, !member.isActive)}
                            disabled={!canManageTeam || processingMember === member._id}
                            className="w-full text-xs text-left text-red-600 hover:text-red-800"
                          >
                            <UserMinus className="inline-block w-3 h-3 mr-1" />
                            {member.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`border rounded-2xl p-6 space-y-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Invite teammate</h2>
            </div>
            {!canManageTeam && (
              <p className="text-sm text-gray-400">Only admins can invite or update team members.</p>
            )}
            <form className="space-y-3" onSubmit={handleInviteSubmit}>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Name</label>
                <input
                  disabled={!canManageTeam}
                  name="name"
                  value={inviteForm.name}
                  onChange={handleInviteInput}
                  className="w-full px-3 py-2 mt-1 rounded-lg border text-sm bg-transparent"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Email</label>
                <input
                  disabled={!canManageTeam}
                  name="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={handleInviteInput}
                  className="w-full px-3 py-2 mt-1 rounded-lg border text-sm bg-transparent"
                  placeholder="team@example.com"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Role</label>
                <select
                  disabled={!canManageTeam}
                  name="role"
                  value={inviteForm.role}
                  onChange={handleInviteInput}
                  className="w-full px-3 py-2 mt-1 rounded-lg border text-sm bg-transparent"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!canManageTeam || savingInvite}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:bg-primary-400"
              >
                <UserPlus className="w-4 h-4" />
                {savingInvite ? 'Inviting...' : 'Send invitation'}
              </button>
            </form>
            <div className="text-xs text-gray-400">
              Invited teammates receive a secure email with a seven-day link to complete onboarding.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Team;
