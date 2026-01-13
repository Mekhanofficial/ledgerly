// src/routes/inventory/NewSupplier.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Save, X, Mail, Phone, MapPin, User, Star } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useInventory } from '../../context/InventoryContext';

const NewSupplier = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { suppliers, addSupplier } = useInventory();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    rating: 5,
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast('Supplier name is required', 'error');
      return;
    }

    if (!formData.email.trim()) {
      addToast('Supplier email is required', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const supplierData = {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        status: formData.status,
        rating: parseFloat(formData.rating),
        notes: formData.notes.trim(),
        products: [],
        orderCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addSupplier(supplierData);
      
      addToast('Supplier created successfully!', 'success');
      navigate('/inventory/suppliers');
      
    } catch (error) {
      console.error('Error creating supplier:', error);
      addToast('Failed to create supplier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Supplier
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Add a new supplier to your inventory
              </p>
            </div>
            <button
              onClick={() => navigate('/inventory/suppliers')}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Supplier Information
            </h2>
            
            {/* Name and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier Name *
                </label>
                <div className="relative">
                  <Truck className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., Tech Distributors Inc."
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Person
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., John Smith"
                  />
                </div>
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="supplier@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Address
              </label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-4 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  placeholder="123 Business Street, City, State, ZIP Code"
                />
              </div>
            </div>

            {/* Status and Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rating (1-5)
                </label>
                <div className="relative">
                  <Star className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Very Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="Additional notes about this supplier..."
              />
            </div>
          </div>

          {/* Preview */}
          <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Supplier Preview
            </h3>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-start mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                  <Truck className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formData.name || 'Supplier Name'}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      formData.status === 'Active' 
                        ? isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                        : formData.status === 'Pending'
                        ? isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800'
                        : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status || 'Active'}
                    </span>
                    <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Rating: {formData.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {formData.contact && (
                  <div className="flex items-center text-sm">
                    <User className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                      {formData.contact}
                    </span>
                  </div>
                )}
                {formData.email && (
                  <div className="flex items-center text-sm">
                    <Mail className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {formData.email}
                    </span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                      {formData.phone}
                    </span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className={`w-4 h-4 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {formData.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/suppliers')}
              className={`px-6 py-3 rounded-lg font-medium ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewSupplier;