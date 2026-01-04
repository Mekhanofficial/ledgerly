import React, { useState } from 'react';
import { Users, Plus, Download, Mail } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import CustomerStats from '../../components/customers/CustomerStats';
import CustomerTable from '../../components/customers/CustomerTable';
import { useTheme } from '../../context/ThemeContext';

const Customers = () => {
  const { isDarkMode } = useTheme();
  const [filter, setFilter] = useState('all');

  const customers = [
    {
      id: 1,
      name: 'Acme Corporation',
      email: 'sarah@acmecorp.com',
      phone: '+1 (555) 123-4567',
      transactions: 24,
      totalSpent: 47850.00,
      outstanding: 0,
      lastTransaction: 'Dec 15, 2024',
      joinedDate: 'Jan 2023'
    },
    {
      id: 2,
      name: 'TechStart Industries',
      email: 'john@techstart.com',
      phone: '+1 (555) 987-6543',
      transactions: 18,
      totalSpent: 32500.00,
      outstanding: 1825.00,
      lastTransaction: 'Dec 14, 2024',
      joinedDate: 'Mar 2023'
    },
    {
      id: 3,
      name: 'Global Solutions Ltd',
      email: 'mike@globalsolutions.com',
      phone: '+1 (555) 456-7890',
      transactions: 31,
      totalSpent: 68200.00,
      outstanding: 3200.00,
      lastTransaction: 'Dec 10, 2024',
      joinedDate: 'Nov 2022'
    },
    {
      id: 4,
      name: 'BlueTech Innovations',
      email: 'lisa@bluetech.com',
      phone: '+1 (555) 321-0987',
      transactions: 12,
      totalSpent: 22750.00,
      outstanding: 0,
      lastTransaction: 'Dec 12, 2024',
      joinedDate: 'Jun 2023'
    },
    {
      id: 5,
      name: 'Peak Performance Group',
      email: 'alex@peakperformance.com',
      phone: '+1 (555) 654-3210',
      transactions: 8,
      totalSpent: 15400.00,
      outstanding: 2100.00,
      lastTransaction: 'Dec 8, 2024',
      joinedDate: 'Sep 2023'
    },
    {
      id: 6,
      name: 'Innovate Labs',
      email: 'emma@innovatelabs.com',
      phone: '+1 (555) 789-0123',
      transactions: 15,
      totalSpent: 28900.00,
      outstanding: 4500.00,
      lastTransaction: 'Dec 5, 2024',
      joinedDate: 'Feb 2023'
    },
    {
      id: 7,
      name: 'Digital Dynamics',
      email: 'david@digitaldynamics.com',
      phone: '+1 (555) 234-5678',
      transactions: 22,
      totalSpent: 41200.00,
      outstanding: 0,
      lastTransaction: 'Dec 3, 2024',
      joinedDate: 'Apr 2023'
    },
    {
      id: 8,
      name: 'Future Tech Systems',
      email: 'sophia@futuretech.com',
      phone: '+1 (555) 876-5432',
      transactions: 9,
      totalSpent: 16800.00,
      outstanding: 1250.00,
      lastTransaction: 'Nov 29, 2024',
      joinedDate: 'Aug 2023'
    },
    {
      id: 9,
      name: 'Alpha Enterprises',
      email: 'ryan@alphaenterprises.com',
      phone: '+1 (555) 345-6789',
      transactions: 17,
      totalSpent: 31500.00,
      outstanding: 0,
      lastTransaction: 'Nov 25, 2024',
      joinedDate: 'Jul 2023'
    },
    {
      id: 10,
      name: 'Zenith Solutions',
      email: 'olivia@zenithsolutions.com',
      phone: '+1 (555) 987-1234',
      transactions: 13,
      totalSpent: 24100.00,
      outstanding: 800.00,
      lastTransaction: 'Nov 20, 2024',
      joinedDate: 'May 2023'
    }
  ];

  const handleSendStatement = (customerIds) => {
    console.log('Send statement to customers:', customerIds);
  };

  const handleViewCustomer = (customerId) => {
    console.log('View customer:', customerId);
  };

  const handleEditCustomer = (customerId) => {
    console.log('Edit customer:', customerId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Customers
            </h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage customer relationships and outstanding balances
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Mail className="w-4 h-4 mr-2" />
              Email All
            </button>
            <button className={`flex items-center px-4 py-2 border rounded-lg ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <CustomerStats />

        {/* Customer Table Component */}
        <CustomerTable
          customers={customers}
          onSendStatement={handleSendStatement}
          onView={handleViewCustomer}
          onEdit={handleEditCustomer}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-blue-300' : 'text-gray-600'
                }`}>
                  Total Outstanding
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  $31,245
                </p>
              </div>
              <Users className={`w-8 h-8 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
          <div className={`border rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-emerald-900/20 border-emerald-800' 
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-emerald-300' : 'text-gray-600'
                }`}>
                  Active This Month
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  87
                </p>
              </div>
              <Users className={`w-8 h-8 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
          </div>
          <div className={`border rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-amber-900/20 border-amber-800' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-amber-300' : 'text-gray-600'
                }`}>
                  Avg. Transaction
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  $1,847
                </p>
              </div>
              <Users className={`w-8 h-8 ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Customers;