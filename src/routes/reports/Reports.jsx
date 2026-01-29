// src/routes/reports/Reports.js - CLEANED VERSION
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Plus, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import ReportStats from '../../components/reports/ReportStats';
import ReportCards from '../../components/reports/ReportCards';
import ReportCharts from '../../components/reports/ReportCharts';
import CreateReportModal from '../../components/reports/CreateReportModal';
import ReportProgressModal from '../../components/reports/ReportProgressModal';
import GeneratedReportsList from '../../components/reports/GeneratedReportsList';
import ReportHeader from '../../components/reports/ReportHeader';
import ReportTypeFilter from '../../components/reports/ReportTypeFilter';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import { useInvoice } from '../../context/InvoiceContext';

const Reports = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const { addReportNotification } = useNotifications();
  const { invoices, customers } = useInvoice();
  
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportType, setReportType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [jsPDF, setJsPDF] = useState(null);

  // Load reports from localStorage
  useEffect(() => {
    loadReports();
  }, []);

  // Dynamically import jsPDF
  useEffect(() => {
    import('jspdf').then(jsPDF => {
      setJsPDF(jsPDF);
    });
  }, []);

  const loadReports = () => {
    try {
      const savedReports = JSON.parse(localStorage.getItem('ledgerly_reports') || '[]');
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleCreateReport = () => {
    setShowCreateModal(true);
  };

  const handleSaveReport = async (reportData) => {
    try {
      const newReport = {
        ...reportData,
        id: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'processing',
        progress: 0,
        downloads: 0,
        lastDownloaded: null
      };

      // Add to reports list
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem('ledgerly_reports', JSON.stringify(updatedReports));

      // Show progress modal
      setShowCreateModal(false);
      setGeneratingReport(newReport);
      setShowProgressModal(true);

      // Start report generation
      simulateReportGeneration(newReport);

      addToast('Report creation started!', 'success');
      
    } catch (error) {
      console.error('Error creating report:', error);
      addToast('Error creating report: ' + error.message, 'error');
    }
  };

  const simulateReportGeneration = (report) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      
      // Update progress
      setReports(prevReports => {
        const updatedReports = prevReports.map(r => 
          r.id === report.id ? { 
            ...r, 
            progress: Math.min(progress, 100), 
            status: progress === 100 ? 'completed' : 'processing',
            updatedAt: new Date().toISOString()
          } : r
        );
        
        localStorage.setItem('ledgerly_reports', JSON.stringify(updatedReports));
        return updatedReports;
      });

      if (progress >= 100) {
        clearInterval(interval);
        
        // Final update to completed status
        setReports(prevReports => {
          const finalUpdatedReports = prevReports.map(r => 
            r.id === report.id ? { 
              ...r, 
              status: 'completed',
              progress: 100,
              updatedAt: new Date().toISOString()
            } : r
          );
          
          localStorage.setItem('ledgerly_reports', JSON.stringify(finalUpdatedReports));
          return finalUpdatedReports;
        });

        // Add notification when report is complete
        addReportNotification(report, 'completed');
        addToast(`Report "${report.title}" generated successfully!`, 'success');
        
        setTimeout(() => {
          setShowProgressModal(false);
          setGeneratingReport(null);
        }, 1000);
      }
    }, 300);
  };

  const handleGenerateReport = (reportId) => {
    const reportTemplate = {
      sales: { title: 'Sales Report', type: 'sales', format: 'pdf' },
      revenue: { title: 'Revenue Report', type: 'revenue', format: 'pdf' },
      inventory: { title: 'Inventory Report', type: 'inventory', format: 'pdf' },
      customer: { title: 'Customer Report', type: 'customer', format: 'pdf' },
      profit: { title: 'Profit & Loss Report', type: 'profit', format: 'pdf' },
      expenses: { title: 'Expenses Report', type: 'expenses', format: 'pdf' },
      'quick-summary': { title: 'Quick Summary Report', type: 'summary', format: 'pdf' },
      'monthly-performance': { title: 'Monthly Performance Report', type: 'performance', format: 'pdf' }
    };

    const template = reportTemplate[reportId] || { 
      title: 'Custom Report', 
      type: 'custom',
      format: 'pdf'
    };
    
    const report = {
      ...template,
      id: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'processing',
      progress: 0,
      downloads: 0,
      lastDownloaded: null
    };

    // Add to reports list
    const updatedReports = [report, ...reports];
    setReports(updatedReports);
    localStorage.setItem('ledgerly_reports', JSON.stringify(updatedReports));

    // Start generation
    setGeneratingReport(report);
    setShowProgressModal(true);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      simulateReportGeneration(report);
    }, 100);
  };

  // Generate actual report data functions
  const generateReportData = (report) => {
    // Calculate invoice statistics
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'pending').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;
    
    // Calculate customer statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => {
      const customerInvoices = invoices.filter(inv => 
        inv.customerId === c.id || inv.customer === c.name
      );
      return customerInvoices.length > 0;
    }).length;
    
    // Get top customers
    const topCustomers = customers.map(customer => {
      const customerInvoices = invoices.filter(inv => 
        inv.customerId === customer.id || inv.customer === customer.name
      );
      const customerRevenue = customerInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 
        0
      );
      
      return {
        name: customer.name,
        totalInvoices: customerInvoices.length,
        totalAmount: customerRevenue,
        lastPurchase: customer.lastTransaction || 'Never',
        email: customer.email
      };
    })
    .filter(c => c.totalInvoices > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

    // Generate monthly trend data
    const generateMonthlyTrendData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      
      return months.map((month, index) => {
        const monthRevenue = invoices
          .filter(inv => {
            const invDate = new Date(inv.issueDate || inv.createdAt);
            return invDate.getMonth() === index && invDate.getFullYear() === currentDate.getFullYear();
          })
          .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
        
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.issueDate || inv.createdAt);
          return invDate.getMonth() === index && invDate.getFullYear() === currentDate.getFullYear();
        }).length;
        
        return {
          month,
          revenue: monthRevenue,
          invoices: monthInvoices
        };
      });
    };

    const data = {
      metadata: {
        title: report?.title || 'Business Report',
        generated: new Date().toISOString(),
        type: report?.type || 'general',
        format: report?.format || 'pdf',
        dateRange: report?.dateRange || 'last-30-days'
      },
      summary: {
        totalInvoices,
        totalCustomers,
        totalRevenue,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        draftInvoices,
        activeCustomers
      },
      breakdown: {
        byStatus: {
          draft: draftInvoices,
          sent: invoices.filter(inv => inv.status === 'sent').length,
          paid: paidInvoices,
          overdue: overdueInvoices,
          pending: pendingInvoices,
          cancelled: invoices.filter(inv => inv.status === 'cancelled').length
        },
        byCustomer: topCustomers,
        monthlyTrend: generateMonthlyTrendData(),
        revenueByStatus: {
          paid: invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0),
          pending: invoices
            .filter(inv => inv.status === 'pending' || inv.status === 'sent')
            .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0),
          overdue: invoices
            .filter(inv => inv.status === 'overdue')
            .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)
        }
      }
    };

    return data;
  };

  // Generate PDF using jsPDF
// Update the generatePDF function in Reports.js

// Generate PDF using jsPDF - ENHANCED VERSION
const generatePDF = (reportData, filename) => {
  if (!jsPDF) {
    addToast('PDF library not loaded. Please try again.', 'error');
    return;
  }

  try {
    const doc = new jsPDF.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = margin;
    let currentPage = 1;
    
    // Helper function to check if we need a new page
    const checkNewPage = () => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
        currentPage++;
      }
    };
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text(reportData.metadata.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Report info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date(reportData.metadata.generated).toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Type: ${reportData.metadata.type} | Format: ${reportData.metadata.format} | Date Range: ${reportData.metadata.dateRange}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    checkNewPage();
    
    // Summary section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('SUMMARY', margin, yPos);
    yPos += 10;
    
    // Summary cards layout
    const summaryCards = [
      { label: 'Total Invoices', value: reportData.summary.totalInvoices.toString() },
      { label: 'Total Revenue', value: `$${reportData.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
      { label: 'Total Customers', value: reportData.summary.totalCustomers.toString() },
      { label: 'Active Customers', value: reportData.summary.activeCustomers.toString() }
    ];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Calculate card dimensions
    const cardWidth = (pageWidth - 2 * margin) / 2 - 5;
    const cardHeight = 30;
    
    summaryCards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const xPos = margin + col * (cardWidth + 10);
      const cardYPos = yPos + row * (cardHeight + 5);
      
      // Draw card background
      doc.setFillColor(241, 245, 249); // Light gray-blue
      doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, 'F');
      
      // Draw left border
      doc.setFillColor(41, 128, 185); // Blue
      doc.rect(xPos, cardYPos, 4, cardHeight, 'F');
      
      // Add card content
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(card.label, xPos + 10, cardYPos + 10);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, xPos + 10, cardYPos + 22);
    });
    
    yPos += (Math.ceil(summaryCards.length / 2) * (cardHeight + 5)) + 15;
    checkNewPage();
    
    // Invoice Status Breakdown
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE STATUS BREAKDOWN', margin, yPos);
    yPos += 10;
    
    const statusData = [
      { label: 'Draft', value: reportData.breakdown.byStatus.draft, color: [254, 243, 199] },
      { label: 'Sent', value: reportData.breakdown.byStatus.sent, color: [219, 234, 254] },
      { label: 'Paid', value: reportData.breakdown.byStatus.paid, color: [209, 250, 229] },
      { label: 'Overdue', value: reportData.breakdown.byStatus.overdue, color: [254, 226, 226] },
      { label: 'Pending', value: reportData.breakdown.byStatus.pending, color: [255, 255, 255] },
      { label: 'Cancelled', value: reportData.breakdown.byStatus.cancelled, color: [255, 255, 255] }
    ];
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(71, 85, 105); // Dark gray
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Status', margin + 5, yPos + 7);
    doc.text('Count', margin + 60, yPos + 7);
    doc.text('Percentage', margin + 100, yPos + 7);
    
    yPos += 12;
    
    // Status rows
    doc.setFont('helvetica', 'normal');
    statusData.forEach((status, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }
      
      // Status badge
      if (status.color[0] !== 255) { // Not white
        doc.setFillColor(...status.color);
        doc.roundedRect(margin + 5, yPos + 1, 15, 6, 1, 1, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(status.label, margin + 25, yPos + 6);
      doc.text(status.value.toString(), margin + 60, yPos + 6);
      
      const percentage = ((status.value / reportData.summary.totalInvoices) * 100 || 0).toFixed(1);
      doc.text(`${percentage}%`, margin + 100, yPos + 6);
      
      yPos += 8;
    });
    
    yPos += 10;
    checkNewPage();
    
    // Revenue by Status
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REVENUE BY STATUS', margin, yPos);
    yPos += 10;
    
    const revenueData = [
      { label: 'Paid', value: reportData.breakdown.revenueByStatus.paid },
      { label: 'Pending', value: reportData.breakdown.revenueByStatus.pending },
      { label: 'Overdue', value: reportData.breakdown.revenueByStatus.overdue }
    ];
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Status', margin + 5, yPos + 7);
    doc.text('Amount', margin + 60, yPos + 7);
    doc.text('Percentage', margin + 120, yPos + 7);
    
    yPos += 12;
    
    // Revenue rows
    doc.setFont('helvetica', 'normal');
    revenueData.forEach((revenue, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(revenue.label, margin + 5, yPos + 6);
      doc.text(`$${revenue.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 60, yPos + 6);
      
      const percentage = ((revenue.value / reportData.summary.totalRevenue) * 100 || 0).toFixed(1);
      doc.text(`${percentage}%`, margin + 120, yPos + 6);
      
      yPos += 8;
    });
    
    yPos += 15;
    checkNewPage();
    
    // Top Customers
    if (reportData.breakdown.byCustomer.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP CUSTOMERS', margin, yPos);
      yPos += 10;
      
      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Rank', margin + 5, yPos + 7);
      doc.text('Customer', margin + 25, yPos + 7);
      doc.text('Invoices', margin + 120, yPos + 7);
      doc.text('Total Amount', margin + 160, yPos + 7);
      doc.text('Last Purchase', pageWidth - margin - 40, yPos + 7, { align: 'right' });
      
      yPos += 12;
      
      // Customer rows
      doc.setFont('helvetica', 'normal');
      reportData.breakdown.byCustomer.slice(0, 5).forEach((customer, index) => {
        checkNewPage();
        
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
        }
        
        doc.setTextColor(0, 0, 0);
        doc.text((index + 1).toString(), margin + 5, yPos + 6);
        
        // Truncate long customer names
        const customerName = customer.name.length > 30 ? customer.name.substring(0, 27) + '...' : customer.name;
        doc.text(customerName, margin + 25, yPos + 6);
        doc.text(customer.totalInvoices.toString(), margin + 120, yPos + 6);
        doc.text(`$${customer.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 160, yPos + 6);
        doc.text(customer.lastPurchase, pageWidth - margin - 5, yPos + 6, { align: 'right' });
        
        yPos += 8;
      });
      
      yPos += 15;
      checkNewPage();
    }
    
    // Monthly Trend
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`MONTHLY TREND (${new Date().getFullYear()})`, margin, yPos);
    yPos += 10;
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Month', margin + 5, yPos + 7);
    doc.text('Revenue', margin + 40, yPos + 7);
    doc.text('Invoices', margin + 90, yPos + 7);
    doc.text('Avg/Invoice', margin + 130, yPos + 7);
    
    yPos += 12;
    
    // Monthly data rows
    doc.setFont('helvetica', 'normal');
    reportData.breakdown.monthlyTrend.forEach((month, index) => {
      checkNewPage();
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      }
      
      const avgInvoice = month.invoices > 0 ? (month.revenue / month.invoices) : 0;
      
      doc.setTextColor(0, 0, 0);
      doc.text(month.month, margin + 5, yPos + 6);
      doc.text(`$${month.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 40, yPos + 6);
      doc.text(month.invoices.toString(), margin + 90, yPos + 6);
      doc.text(`$${avgInvoice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 130, yPos + 6);
      
      yPos += 8;
    });
    
    // Footer on each page
    const addFooter = (pageNum) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by Ledgerly Invoice System', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text(`Page ${pageNum} • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    };
    
    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }
    
    // Save the PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

  // Content generation functions for other formats
  const generateExcelContent = (reportData) => {
    const rows = [
      ['Report:', reportData.metadata.title],
      ['Generated:', new Date(reportData.metadata.generated).toLocaleString()],
      ['Type:', reportData.metadata.type],
      ['Format:', reportData.metadata.format],
      ['Date Range:', reportData.metadata.dateRange],
      [],
      ['SUMMARY', '', ''],
      ['Total Invoices:', reportData.summary.totalInvoices],
      ['Total Customers:', reportData.summary.totalCustomers],
      ['Total Revenue:', `$${reportData.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Paid Invoices:', reportData.summary.paidInvoices],
      ['Pending Invoices:', reportData.summary.pendingInvoices],
      ['Overdue Invoices:', reportData.summary.overdueInvoices],
      ['Draft Invoices:', reportData.summary.draftInvoices],
      ['Active Customers:', reportData.summary.activeCustomers],
      [],
      ['INVOICE BREAKDOWN BY STATUS', '', ''],
      ['Draft:', reportData.breakdown.byStatus.draft],
      ['Sent:', reportData.breakdown.byStatus.sent],
      ['Paid:', reportData.breakdown.byStatus.paid],
      ['Overdue:', reportData.breakdown.byStatus.overdue],
      ['Pending:', reportData.breakdown.byStatus.pending],
      ['Cancelled:', reportData.breakdown.byStatus.cancelled],
    ];

    return rows.map(row => row.join(',')).join('\n');
  };

  const generateCSVContent = (reportData) => {
    return generateExcelContent(reportData);
  };

  const generateHTMLContent = (reportData) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportData.metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: #f8fafc; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .header h1 { color: #2563eb; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .summary-card { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #2563eb; }
        .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: 600; color: #475569; }
        tr:hover { background: #f8fafc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .status-draft { background: #fef3c7; color: #92400e; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${reportData.metadata.title}</h1>
            <p>Generated: ${new Date(reportData.metadata.generated).toLocaleString()}</p>
            <p>Report Type: ${reportData.metadata.type} | Format: ${reportData.metadata.format} | Date Range: ${reportData.metadata.dateRange}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div>Total Invoices</div>
                <div class="summary-value">${reportData.summary.totalInvoices}</div>
            </div>
            <div class="summary-card">
                <div>Total Revenue</div>
                <div class="summary-value">$${reportData.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
                <div>Total Customers</div>
                <div class="summary-value">${reportData.summary.totalCustomers}</div>
            </div>
            <div class="summary-card">
                <div>Active Customers</div>
                <div class="summary-value">${reportData.summary.activeCustomers}</div>
            </div>
        </div>

        <div class="stat-grid">
            <div class="section">
                <h2>Invoice Status Breakdown</h2>
                <table>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-draft">Draft</span></td>
                        <td>${reportData.breakdown.byStatus.draft}</td>
                        <td>${((reportData.breakdown.byStatus.draft / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-sent">Sent</span></td>
                        <td>${reportData.breakdown.byStatus.sent}</td>
                        <td>${((reportData.breakdown.byStatus.sent / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-paid">Paid</span></td>
                        <td>${reportData.breakdown.byStatus.paid}</td>
                        <td>${((reportData.breakdown.byStatus.paid / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td><span class="status-badge status-overdue">Overdue</span></td>
                        <td>${reportData.breakdown.byStatus.overdue}</td>
                        <td>${((reportData.breakdown.byStatus.overdue / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Pending</td>
                        <td>${reportData.breakdown.byStatus.pending}</td>
                        <td>${((reportData.breakdown.byStatus.pending / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Cancelled</td>
                        <td>${reportData.breakdown.byStatus.cancelled}</td>
                        <td>${((reportData.breakdown.byStatus.cancelled / reportData.summary.totalInvoices) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <h2>Revenue by Status</h2>
                <table>
                    <tr>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                    </tr>
                    <tr>
                        <td>Paid</td>
                        <td>$${reportData.breakdown.revenueByStatus.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>${((reportData.breakdown.revenueByStatus.paid / reportData.summary.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Pending</td>
                        <td>$${reportData.breakdown.revenueByStatus.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>${((reportData.breakdown.revenueByStatus.pending / reportData.summary.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Overdue</td>
                        <td>$${reportData.breakdown.revenueByStatus.overdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>${((reportData.breakdown.revenueByStatus.overdue / reportData.summary.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>Top Customers</h2>
            <table>
                <tr>
                    <th>Rank</th>
                    <th>Customer</th>
                    <th>Invoices</th>
                    <th>Total Amount</th>
                    <th>Last Purchase</th>
                </tr>
                ${reportData.breakdown.byCustomer.slice(0, 5).map((cust, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${cust.name}</td>
                    <td>${cust.totalInvoices}</td>
                    <td>$${cust.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${cust.lastPurchase}</td>
                </tr>
                `).join('')}
            </table>
        </div>

        <div class="section">
            <h2>Monthly Trend (${new Date().getFullYear()})</h2>
            <table>
                <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>Invoices</th>
                    <th>Average Invoice Value</th>
                </tr>
                ${reportData.breakdown.monthlyTrend.map(month => `
                <tr>
                    <td>${month.month}</td>
                    <td>$${month.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${month.invoices}</td>
                    <td>$${month.invoices > 0 ? (month.revenue / month.invoices).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</td>
                </tr>
                `).join('')}
            </table>
        </div>

        <div class="footer">
            <p>Generated by Ledgerly Invoice System</p>
            <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p>Report ID: ${reportData.metadata.generated}</p>
        </div>
    </div>
</body>
</html>`;
  };

  const generateTextContent = (reportData) => {
    const title = reportData.metadata.title;
    const date = new Date(reportData.metadata.generated).toLocaleString();
    
    return `
==================================================================
                          ${title}
==================================================================

Generated: ${date}
Report Type: ${reportData.metadata.type}
Format: ${reportData.metadata.format}
Date Range: ${reportData.metadata.dateRange}

SUMMARY
==================================================================
Total Invoices: ${reportData.summary.totalInvoices}
Total Customers: ${reportData.summary.totalCustomers}
Total Revenue: $${reportData.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Paid Invoices: ${reportData.summary.paidInvoices}
Pending Invoices: ${reportData.summary.pendingInvoices}
Overdue Invoices: ${reportData.summary.overdueInvoices}
Draft Invoices: ${reportData.summary.draftInvoices}
Active Customers: ${reportData.summary.activeCustomers}

INVOICE BREAKDOWN BY STATUS
==================================================================
Draft: ${reportData.breakdown.byStatus.draft}
Sent: ${reportData.breakdown.byStatus.sent}
Paid: ${reportData.breakdown.byStatus.paid}
Overdue: ${reportData.breakdown.byStatus.overdue}
Pending: ${reportData.breakdown.byStatus.pending}
Cancelled: ${reportData.breakdown.byStatus.cancelled}

REVENUE BY STATUS
==================================================================
Paid Revenue: $${reportData.breakdown.revenueByStatus.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Pending Revenue: $${reportData.breakdown.revenueByStatus.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Overdue Revenue: $${reportData.breakdown.revenueByStatus.overdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}

TOP CUSTOMERS
==================================================================
${reportData.breakdown.byCustomer.slice(0, 5).map((cust, i) => 
  `${i + 1}. ${cust.name}: ${cust.totalInvoices} invoices, $${cust.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
).join('\n')}

MONTHLY TREND (Current Year)
==================================================================
${reportData.breakdown.monthlyTrend.map(month => 
  `${month.month}: $${month.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} revenue, ${month.invoices} invoices`
).join('\n')}

==================================================================
Generated by Ledgerly Invoice System
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
==================================================================`;
  };

  // Helper function to download files
  const downloadFile = (content, filename, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  // Download function with actual content generation
  const handleExport = (format, reportId = null) => {
    const report = reportId ? reports.find(r => r.id === reportId) : null;
    
    if (!report && reportId) {
      addToast('Report not found!', 'error');
      return;
    }
    
    try {
      const reportData = generateReportData(report);
      
      // Generate filename
      const safeTitle = (report?.title || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${safeTitle}_${dateStr}.${format}`;
      
      // Generate and download based on format
      switch(format) {
        case 'pdf':
          generatePDF(reportData, filename);
          break;
          
        case 'excel':
          const excelContent = generateExcelContent(reportData);
          downloadFile(excelContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
          
        case 'csv':
          const csvContent = generateCSVContent(reportData);
          downloadFile(csvContent, filename, 'text/csv');
          break;
          
        case 'html':
          const htmlContent = generateHTMLContent(reportData);
          downloadFile(htmlContent, filename, 'text/html');
          break;
          
        default:
          const textContent = generateTextContent(reportData);
          downloadFile(textContent, filename, 'text/plain');
      }

      // Update report download count
      if (report) {
        setReports(prevReports => {
          const updatedReports = prevReports.map(r => 
            r.id === report.id 
              ? { 
                  ...r, 
                  downloads: (r.downloads || 0) + 1, 
                  lastDownloaded: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } 
              : r
          );
          localStorage.setItem('ledgerly_reports', JSON.stringify(updatedReports));
          return updatedReports;
        });
      }

      // Show success toast
      setTimeout(() => {
        addToast(`"${report?.title || 'Report'}" downloaded successfully as ${format.toUpperCase()}`, 'success');
      }, 100);
      
    } catch (error) {
      console.error('Export error:', error);
      addToast(`Error generating ${format.toUpperCase()}: ${error.message}`, 'error');
    }
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      const updatedReports = reports.filter(r => r.id !== reportId);
      setReports(updatedReports);
      localStorage.setItem('ledgerly_reports', JSON.stringify(updatedReports));
      addToast('Report deleted successfully', 'success');
    }
  };

  const handleViewReport = (report) => {
    if (report.status === 'completed') {
      // Create a preview of the report
      const reportData = generateReportData(report);
      const content = generateHTMLContent(reportData);
      
      // Open in new tab
      const newWindow = window.open();
      newWindow.document.write(content);
      newWindow.document.close();
    } else {
      setGeneratingReport(report);
      setShowProgressModal(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <ReportHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onCreateReport={handleCreateReport}
          onExport={() => handleExport('pdf')}
          isDarkMode={isDarkMode}
        />

        {/* Alert Banner for Processing Reports */}
        {reports.some(r => r.status === 'processing') && (
          <div className={`rounded-lg p-4 border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center">
              <AlertCircle className={`w-5 h-5 mr-3 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  Reports are being generated
                </p>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {reports.filter(r => r.status === 'processing').length} report(s) in progress
                </p>
              </div>
              <button 
                onClick={() => setShowProgressModal(true)}
                className="ml-auto text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View Progress
              </button>
            </div>
          </div>
        )}

        {/* Stats Component */}
        <ReportStats />

        {/* Report Type Filter */}
        <ReportTypeFilter reportType={reportType} onReportTypeChange={setReportType} isDarkMode={isDarkMode} />

        {/* Report Cards Component */}
        <ReportCards 
          onGenerateReport={handleGenerateReport}
          reports={reports}
          onDeleteReport={handleDeleteReport}
          onViewReport={handleViewReport}
          onExport={handleExport}
          isDarkMode={isDarkMode}
        />

        {/* Charts Component */}
        <ReportCharts />

        {/* Generated Reports List - USING THE SEPARATE COMPONENT */}
        <GeneratedReportsList
          reports={reports}
          onLoadReports={loadReports}
          onExport={handleExport}
          onViewReport={handleViewReport}
          onDeleteReport={handleDeleteReport}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Modals */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveReport}
        isDarkMode={isDarkMode}
      />

      <ReportProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        report={generatingReport}
        reports={reports.filter(r => r.status === 'processing')}
        isDarkMode={isDarkMode}
      />
    </DashboardLayout>
  );
};

export default Reports;
