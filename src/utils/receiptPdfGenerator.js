// src/utils/receiptPdfGenerator.js - FIXED VERSION
import jsPDF from 'jspdf';

export const generateReceiptPDF = (receiptData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = margin;

  // Store info
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGENDS', pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  doc.text('123 Business Street', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('City, State 12345', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Tel: (555) 123-4567', pageWidth / 2, yPos, { align: 'center' });

  // Separator
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Receipt info
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt #: ${receiptData.id}`, margin, yPos);
  doc.text(`Date: ${receiptData.date}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  
  // Customer info
  if (receiptData.customerName) {
    doc.text('Customer:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.customerName, margin + 25, yPos);
    yPos += 8;
  }
  
  // Email
  if (receiptData.customerEmail) {
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.customerEmail, margin + 20, yPos);
    yPos += 8;
  }
  
  // Payment method
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  
  let paymentText = receiptData.paymentMethod || 'Cash';
  if (receiptData.paymentMethodDetails) {
    paymentText += ` (${receiptData.paymentMethodDetails})`;
  }
  
  const paymentLines = doc.splitTextToSize(paymentText, 70);
  if (paymentLines.length > 1) {
    doc.text(paymentLines[0], margin + 42, yPos);
    doc.text(paymentLines[1], margin + 42, yPos + 5);
    yPos += 13;
  } else {
    doc.text(paymentText, margin + 42, yPos);
    yPos += 8;
  }

  // Separator
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Items header
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin, yPos);
  doc.text('Qty', margin + 110, yPos);
  doc.text('Price', margin + 130, yPos);
  doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
  
  // Items
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.1);
  
  const items = receiptData.items || [];
  items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
      
      // Redraw header on new page
      doc.setFont('helvetica', 'bold');
      doc.text('Description', margin, yPos);
      doc.text('Qty', margin + 110, yPos);
      doc.text('Price', margin + 130, yPos);
      doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
      yPos += 8;
      doc.setFont('helvetica', 'normal');
    }
    
    // Item description
    const description = item.name || 'Item';
    const descLines = doc.splitTextToSize(description, 60);
    
    let itemStartY = yPos;
    
    if (descLines.length > 1) {
      doc.text(descLines[0], margin, yPos);
      doc.text(descLines.slice(1).join(' '), margin, yPos + 5);
      yPos += 10; // Extra space for multi-line description
    } else {
      doc.text(description, margin, yPos);
      yPos += 8;
    }
    
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const amount = quantity * price;
    
    // Align quantity, price, and amount with the start of the item description
    doc.text(quantity.toString(), margin + 110, itemStartY);
    doc.text(`$${price.toFixed(2)}`, margin + 130, itemStartY);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - margin, itemStartY, { align: 'right' });
    
    // Draw line between items
    if (index < items.length - 1) {
      yPos += 2;
      doc.setLineWidth(0.1);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
    }
  });

  // Separator
  yPos += 10;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Totals
  doc.setFont('helvetica', 'normal');
  const subtotal = receiptData.subtotal || 0;
  const tax = receiptData.tax || 0;
  const total = receiptData.total || 0;
  
  doc.text('Subtotal:', pageWidth - margin - 80, yPos);
  doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Tax (8.5%):', pageWidth - margin - 80, yPos);
  doc.text(`$${tax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOTAL:', pageWidth - margin - 80, yPos);
  doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  // Notes
  if (receiptData.notes) {
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(receiptData.notes, pageWidth - 2 * margin);
    
    let notesY = yPos + 5;
    notesLines.forEach(line => {
      if (notesY > 280) {
        doc.addPage();
        notesY = margin;
      }
      doc.text(line, margin, notesY);
      notesY += 5;
    });
  }

  // Footer
  yPos = Math.max(yPos + 20, doc.internal.pageSize.height - 20);
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  if (yPos < doc.internal.pageSize.height - 30) {
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    yPos += 3;
    doc.text('Thank you for your purchase!', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Please retain this receipt for your records', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Generated by Legends POS System', pageWidth / 2, yPos, { align: 'center' });
  }

  return doc;
};