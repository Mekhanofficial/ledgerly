// src/utils/receiptPdfGenerator.js
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
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Receipt info
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt #: ${receiptData.id}`, margin, yPos);
  doc.text(`Date: ${receiptData.date}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Payment Method:', margin, yPos);
  doc.text(receiptData.paymentMethod || 'Cash', pageWidth - margin, yPos, { align: 'right' });

  if (receiptData.customerEmail) {
    yPos += 8;
    doc.text('Customer Email:', margin, yPos);
    const email = receiptData.customerEmail;
    doc.setFont('helvetica', 'normal');
    doc.text(email, margin + 45, yPos);
    yPos += 5;
  }

  // Separator
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

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
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    
    // Item description
    const description = item.name || 'Item';
    const descLines = doc.splitTextToSize(description, 60);
    
    if (descLines.length > 1) {
      doc.text(descLines[0], margin, yPos);
      doc.text(descLines.slice(1).join(' '), margin, yPos + 5);
      yPos += 5;
    } else {
      doc.text(description, margin, yPos);
    }
    
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const amount = quantity * price;
    
    doc.text(quantity.toString(), margin + 110, yPos);
    doc.text(`$${price.toFixed(2)}`, margin + 130, yPos);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 8;
    
    // Draw line between items
    if (index < items.length - 1) {
      doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
      yPos += 4;
    }
  });

  // Separator
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Totals
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - margin - 80, yPos);
  doc.text(`$${(receiptData.subtotal || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Tax (8.5%):', pageWidth - margin - 80, yPos);
  doc.text(`$${(receiptData.tax || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOTAL:', pageWidth - margin - 80, yPos);
  doc.text(`$${(receiptData.total || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

  // Notes
  if (receiptData.notes) {
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(receiptData.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos + 5);
  }

  // Footer
  yPos = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  yPos += 3;
  doc.text('Thank you for your purchase!', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Please retain this receipt for your records', pageWidth / 2, yPos, { align: 'center' });

  return doc;
};