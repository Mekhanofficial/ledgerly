import React from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, MoreVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import TablePagination from '../ui/TablePagination';
import { useTablePagination } from '../../hooks/usePagination';

const SupportTickets = ({ tickets, onViewTicket }) => {
  const { isDarkMode } = useTheme();
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedItems: paginatedTickets
  } = useTablePagination(tickets, { initialRowsPerPage: 10 });

  const getPriorityBadge = (priority) => {
    const styles = {
      high: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
      medium: isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800',
      low: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
    };
    return styles[priority] || (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800');
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: AlertCircle,
      'in-progress': Clock,
      resolved: CheckCircle
    };
    return icons[status] || AlertCircle;
  };

  const getStatusIconColor = (status) => {
    const colors = {
      open: isDarkMode ? 'text-red-400' : 'text-red-600',
      'in-progress': isDarkMode ? 'text-amber-400' : 'text-amber-600',
      resolved: isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
    };
    return colors[status] || (isDarkMode ? 'text-gray-400' : 'text-gray-600');
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-6 py-4 border-b ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Support Tickets
            </h3>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage customer support requests
            </p>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
            New Ticket
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              {['Ticket ID', 'Subject', 'Customer', 'Priority', 'Status', 'Last Updated', 'Actions'].map((header) => (
                <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode 
              ? 'divide-gray-700 bg-gray-800' 
              : 'divide-gray-200 bg-white'
          }`}>
            {paginatedTickets.map((ticket) => {
              const StatusIcon = getStatusIcon(ticket.status);
              const statusIconColor = getStatusIconColor(ticket.status);
              return (
                <tr key={ticket.id} className={isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {ticket.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MessageSquare className={`w-4 h-4 mr-3 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ticket.subject}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {ticket.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        isDarkMode ? 'bg-primary-900/30' : 'bg-primary-100'
                      }`}>
                        <User className={`w-4 h-4 ${
                          isDarkMode ? 'text-primary-400' : 'text-primary-600'
                        }`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ticket.customer}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {ticket.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon className={`w-4 h-4 mr-2 ${statusIconColor}`} />
                      <span className={`text-sm capitalize ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {ticket.lastUpdated}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {ticket.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewTicket(ticket.id)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          isDarkMode 
                            ? 'text-blue-400 hover:bg-blue-900/30' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        View
                      </button>
                      <button className={`p-1 rounded-lg ${
                        isDarkMode 
                          ? 'text-gray-400 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        totalItems={tickets.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        isDarkMode={isDarkMode}
        itemLabel="tickets"
      />
    </div>
  );
};

export default SupportTickets;
