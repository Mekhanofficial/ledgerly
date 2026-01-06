// src/components/invoices/RecurringSettingsModal.js
import React, { useState } from 'react';
import { X, Save, Calendar, Repeat } from 'lucide-react';

const RecurringSettingsModal = ({ settings, onSave, onClose }) => {
  const [formData, setFormData] = useState(settings);
  
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const endOptions = [
    { value: 'never', label: 'Never end' },
    { value: 'after', label: 'End after' },
    { value: 'on', label: 'End on date' }
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const calculateEndDate = () => {
    if (!formData.startDate || !formData.totalCycles) return '';
    
    const startDate = new Date(formData.startDate);
    let endDate = new Date(startDate);
    
    switch(formData.frequency) {
      case 'daily':
        endDate.setDate(startDate.getDate() + (formData.totalCycles - 1));
        break;
      case 'weekly':
        endDate.setDate(startDate.getDate() + ((formData.totalCycles - 1) * 7));
        break;
      case 'biweekly':
        endDate.setDate(startDate.getDate() + ((formData.totalCycles - 1) * 14));
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + (formData.totalCycles - 1));
        break;
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + ((formData.totalCycles - 1) * 3));
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + (formData.totalCycles - 1));
        break;
      default:
        return '';
    }
    
    return endDate.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Repeat className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recurring Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {/* End Options */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              End Options
            </label>
            <select
              value={formData.endOption}
              onChange={(e) => handleChange('endOption', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {endOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            {formData.endOption === 'after' && (
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.totalCycles}
                    onChange={(e) => handleChange('totalCycles', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-600 dark:text-gray-300">cycles</span>
                </div>
                {formData.startDate && formData.totalCycles && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Ends on: {calculateEndDate()}
                  </div>
                )}
              </div>
            )}
            
            {formData.endOption === 'on' && (
              <div className="mt-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Send Reminders
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Send payment reminders automatically
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.sendReminders}
              onChange={(e) => handleChange('sendReminders', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringSettingsModal;