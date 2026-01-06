// src/routes/invoices/RecurringInvoices.js
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, Play, Pause, Edit, Trash2, MoreVertical, PlayCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { recurringStorage } from '../../utils/recurringStorage';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { saveInvoice } from '../../utils/invoiceStorage';

const RecurringInvoices = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecurringInvoices();
  }, []);

  const loadRecurringInvoices = () => {
    setLoading(true);
    try {
      const invoices = recurringStorage.getRecurringInvoices();
      
      // If no invoices, load sample data
      if (invoices.length === 0) {
        const sampleData = [
          {
            id: 'RINV-001',
            name: 'Monthly Web Hosting',
            invoiceNumber: 'INV-2024-001',
            customer: { name: 'Acme Corp', email: 'billing@acmecorp.com' },
            amount: 299.00,
            frequency: 'monthly',
            nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalCycles: 12,
            cyclesCompleted: 1,
            created: new Date().toISOString(),
            lineItems: [
              { description: 'Web Hosting - Basic Plan', quantity: 1, rate: 299.00, tax: 0, amount: 299.00 }
            ]
          },
          {
            id: 'RINV-002',
            name: 'Quarterly Maintenance',
            invoiceNumber: 'INV-2024-002',
            customer: { name: 'TechStart Inc', email: 'finance@techstart.com' },
            amount: 1250.00,
            frequency: 'quarterly',
            nextRun: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalCycles: 8,
            cyclesCompleted: 1,
            created: new Date().toISOString(),
            lineItems: [
              { description: 'Quarterly Maintenance Services', quantity: 1, rate: 1250.00, tax: 0, amount: 1250.00 }
            ]
          }
        ];
        sampleData.forEach(inv => recurringStorage.saveRecurring(inv));
        setRecurringInvoices(sampleData);
      } else {
        setRecurringInvoices(invoices);
      }
    } catch (error) {
      addToast('Error loading recurring invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = (invoiceId) => {
    try {
      const invoice = recurringInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;

      const newStatus = invoice.status === 'active' ? 'paused' : 'active';
      
      if (newStatus === 'paused') {
        recurringStorage.pauseRecurring(invoiceId);
        addToast('Recurring invoice paused', 'success');
      } else {
        recurringStorage.resumeRecurring(invoiceId);
        addToast('Recurring invoice resumed', 'success');
      }
      
      loadRecurringInvoices();
    } catch (error) {
      addToast('Error updating recurring invoice', 'error');
    }
  };

  const handleEdit = (invoiceId) => {
    // Navigate to edit page or show edit modal
    console.log('Edit invoice:', invoiceId);
    addToast('Edit feature coming soon', 'info');
  };

  const handleDelete = (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this recurring invoice profile?')) {
      try {
        recurringStorage.deleteRecurring(invoiceId);
        addToast('Recurring invoice deleted', 'success');
        loadRecurringInvoices();
      } catch (error) {
        addToast('Error deleting recurring invoice', 'error');
      }
    }
  };

  const handleGenerateNow = (invoiceId) => {
    try {
      const invoice = recurringInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;

      // Generate invoice from recurring profile
      const newInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoiceData = {
        id: `inv_${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 'net-30',
        customer: invoice.customer,
        lineItems: invoice.lineItems || [
          { description: invoice.name, quantity: 1, rate: invoice.amount, tax: 0, amount: invoice.amount }
        ],
        subtotal: invoice.amount,
        totalTax: 0,
        totalAmount: invoice.amount,
        notes: 'Generated from recurring invoice profile',
        terms: '',
        currency: 'USD',
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Save to invoices
      saveInvoice(invoiceData);

      // Generate PDF
      const pdfDoc = generateInvoicePDF(invoiceData);
      pdfDoc.save(`${newInvoiceNumber}.pdf`);
      
      // Update cycles completed
      const updatedCycles = (invoice.cyclesCompleted || 0) + 1;
      recurringStorage.updateRecurring(invoiceId, { 
        cyclesCompleted: updatedCycles,
        nextRun: calculateNextRun(invoice.frequency, invoice.startDate, updatedCycles)
      });

      addToast(`Invoice generated: ${newInvoiceNumber}`, 'success');
      loadRecurringInvoices();
    } catch (error) {
      addToast('Error generating invoice', 'error');
    }
  };

  const calculateNextRun = (frequency, startDate, cyclesCompleted) => {
    const start = new Date(startDate);
    let nextRun = new Date(start);
    
    switch(frequency) {
      case 'daily':
        nextRun.setDate(start.getDate() + cyclesCompleted);
        break;
      case 'weekly':
        nextRun.setDate(start.getDate() + (cyclesCompleted * 7));
        break;
      case 'biweekly':
        nextRun.setDate(start.getDate() + (cyclesCompleted * 14));
        break;
      case 'monthly':
        nextRun.setMonth(start.getMonth() + cyclesCompleted);
        break;
      case 'quarterly':
        nextRun.setMonth(start.getMonth() + (cyclesCompleted * 3));
        break;
      case 'yearly':
        nextRun.setFullYear(start.getFullYear() + cyclesCompleted);
        break;
      default:
        return startDate;
    }
    
    return nextRun.toISOString().split('T')[0];
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'Weekly': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Bi-weekly': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Monthly': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Quarterly': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'Yearly': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Daily': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredInvoices = recurringInvoices.filter(invoice => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch = !searchTerm || 
      invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleCreateNew = () => {
    window.location.href = '/invoices/create';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate stats
  const activeInvoices = recurringInvoices.filter(inv => inv.status === 'active');
  const totalValue = activeInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const next30Days = activeInvoices.filter(inv => {
    if (!inv.nextRun) return false;
    const nextRun = new Date(inv.nextRun);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return nextRun <= thirtyDaysFromNow;
  }).length;

  const stats = [
    { label: 'Active Profiles', value: activeInvoices.length, icon: Play, color: 'bg-emerald-500' },
    { label: 'Total Value', value: totalValue, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Customers', value: [...new Set(recurringInvoices.map(inv => inv.customer?.name || inv.customer))].length, icon: Plus, color: 'bg-violet-500' },
    { label: 'Next 30 Days', value: next30Days, icon: Calendar, color: 'bg-amber-500' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading recurring invoices...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recurring Invoices
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Automate your regular billing with recurring invoice profiles
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleCreateNew}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Recurring Profile
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recurring invoices..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'border border-gray-300'
            }`}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = index === 1 
              ? `$${stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo`
              : stat.value.toString();
            
            return (
              <div key={index} className={`border rounded-xl p-5 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {displayValue}
                    </p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'paused', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === status
                  ? 'bg-white/30 text-white'
                  : isDarkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-300 text-gray-700'
              }`}>
                {recurringInvoices.filter(inv => status === 'all' || inv.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {filteredInvoices.length === 0 ? (
          <div className={`border rounded-xl p-12 text-center ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              No recurring invoices found
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Create your first recurring invoice profile
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Recurring Invoice
            </button>
          </div>
        ) : (
          <div className={`border rounded-xl overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Table Header */}
            <div className={`px-6 py-4 border-b ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Recurring Invoice Profiles ({filteredInvoices.length})
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {filteredInvoices.filter(inv => inv.status === 'active').length} active
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Profile
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Customer
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Amount & Frequency
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Next Run
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Progress
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {invoice.name}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {invoice.invoiceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {invoice.customer.name}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {invoice.customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(getFrequencyLabel(invoice.frequency))}`}>
                            {getFrequencyLabel(invoice.frequency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(invoice.nextRun)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {invoice.cyclesCompleted || 0} of {invoice.totalCycles || '∞'}
                            </span>
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {invoice.totalCycles ? 
                                `${Math.round(((invoice.cyclesCompleted || 0) / invoice.totalCycles) * 100)}%` : 
                                'Ongoing'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full" 
                              style={{ 
                                width: invoice.totalCycles ? 
                                  `${((invoice.cyclesCompleted || 0) / invoice.totalCycles) * 100}%` : 
                                  '100%'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {invoice.status === 'active' && (
                            <button 
                              onClick={() => handleGenerateNow(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                              }`}
                              title="Generate Now"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          )}
                          {invoice.status === 'active' ? (
                            <button 
                              onClick={() => handlePauseResume(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode ? 'hover:bg-gray-700 text-amber-400' : 'hover:bg-gray-100 text-amber-600'
                              }`}
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : invoice.status === 'paused' ? (
                            <button 
                              onClick={() => handlePauseResume(invoice.id)}
                              className={`p-1 rounded ${
                                isDarkMode ? 'hover:bg-gray-700 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                              }`}
                              title="Resume"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          ) : null}
                          <button 
                            onClick={() => handleEdit(invoice.id)}
                            className={`p-1 rounded ${
                              isDarkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(invoice.id)}
                            className={`p-1 rounded ${
                              isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className={`p-1 rounded ${
                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          }`}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className={`px-6 py-8 border-t ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            How Recurring Invoices Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-100 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Schedule Setup
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Set frequency, start date, and end date for automatic billing
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-emerald-100 text-emerald-600">
                <Play className="w-5 h-5" />
              </div>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Auto-Generation
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Invoices are automatically created and sent on schedule
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-violet-100 text-violet-600">
                <Filter className="w-5 h-5" />
              </div>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Payment Tracking
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track payments and send reminders automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecurringInvoices;