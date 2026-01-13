// src/routes/inventory/NewCategory.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Save, X, Palette } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useInventory } from '../../context/InventoryContext';

const NewCategory = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { addCategory } = useInventory();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📦'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ];

  const iconOptions = [
    '📦', '💻', '📝', '🪑', '👕', '🎒', '📱', '💡', '🔧', '🎨',
    '📊', '💰', '🚚', '🏢', '🏭', '🔌', '💎', '🍎', '☕', '🎯'
  ];

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
      addToast('Category name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addCategory(categoryData);
      
      addToast('Category created successfully!', 'success');
      navigate('/inventory/categories');
      
    } catch (error) {
      console.error('Error creating category:', error);
      addToast('Failed to create category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create New Category
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Organize your products into categories
              </p>
            </div>
            <button
              onClick={() => navigate('/inventory/categories')}
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
              Category Details
            </h2>
            
            {/* Name */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="e.g., Electronics, Stationery, Furniture"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="Brief description of this category"
              />
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 scale-110' : ''
                    } ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.value }}></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center">
                <div 
                  className="w-8 h-8 rounded-lg mr-3"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {formData.color}
                </span>
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      formData.icon === icon 
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500' 
                        : isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={`Icon ${index + 1}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center">
                <div className={`w-8 h-8 rounded-lg mr-3 flex items-center justify-center text-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {formData.icon}
                </div>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Selected icon
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className={`border rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Preview
            </h3>
            <div className={`flex items-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl mr-4"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.name || 'Category Name'}
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formData.description || 'Category description will appear here'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/categories')}
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
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewCategory;