import { Invoice, Quotation, PurchaseOrder } from './dal/types';
import { format } from 'date-fns';

const COMPANY_INFO = {
  name: 'AIHQ Sdn Bhd',
  address: '123 Tech Street, Kuala Lumpur, Malaysia',
  phone: '+60 3-1234 5678',
  email: 'finance@theaihq.net',
};

function generatePDFStyles(): string {
  return `
    <style>
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; padding: 40px; background: #fff; }
      .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
      .company-info { }
      .company-name { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
      .company-details { color: #666; font-size: 11px; line-height: 1.6; }
      .doc-info { text-align: right; }
      .doc-type { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
      .doc-number { font-size: 14px; color: #333; }
      .doc-date { color: #666; margin-top: 5px; }
      .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .party { width: 45%; }
      .party-title { font-size: 10px; font-weight: bold; color: #1e40af; text-transform: uppercase; margin-bottom: 8px; }
      .party-name { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
      .party-details { color: #666; line-height: 1.6; font-size: 11px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #1e40af; color: white; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
      th:last-child { text-align: right; }
      td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
      td:last-child { text-align: right; }
      .qty-col { text-align: center; width: 80px; }
      .price-col { text-align: right; width: 120px; }
      .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
      .total-box { width: 300px; }
      .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
      .total-row.grand { font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 2px solid #1e40af; border-top: 2px solid #1e40af; background: #f0f7ff; padding: 12px 8px; margin-top: 10px; }
      .notes { margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
      .notes-title { font-weight: bold; margin-bottom: 10px; color: #1e40af; }
      .footer { margin-top: 40px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
      .status-draft { background: #fef3c7; color: #92400e; }
      .status-sent { background: #dbeafe; color: #1e40af; }
      .status-paid { background: #d1fae5; color: #065f46; }
      .status-accepted { background: #d1fae5; color: #065f46; }
      .status-rejected { background: #fee2e2; color: #991b1b; }
      .status-converted { background: #e9d5ff; color: #6b21a8; }
    </style>
  `;
}

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusClass(status: string): string {
  const statusLower = status.toLowerCase();
  return `status-${statusLower}`;
}

export function generateInvoicePDF(invoice: Invoice): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      ${generatePDFStyles()}
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="company-details">
            ${COMPANY_INFO.address}<br>
            ${COMPANY_INFO.phone}<br>
            ${COMPANY_INFO.email}
          </div>
        </div>
        <div class="doc-info">
          <div class="doc-type">INVOICE</div>
          <div class="doc-number">${invoice.invoiceNumber}</div>
          <div class="doc-date">
            Issue Date: ${format(new Date(invoice.issueDate), 'dd MMM yyyy')}<br>
            ${invoice.dueDate ? `Due Date: ${format(new Date(invoice.dueDate), 'dd MMM yyyy')}` : ''}
          </div>
          <div style="margin-top: 10px;">
            <span class="status-badge ${getStatusClass(invoice.status)}">${invoice.status}</span>
          </div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-title">Bill To</div>
          <div class="party-name">${invoice.clientName || 'N/A'}</div>
          <div class="party-details">
            ${invoice.clientAddress || ''}<br>
            ${invoice.clientEmail ? `Email: ${invoice.clientEmail}` : ''}<br>
            ${invoice.clientPhone ? `Phone: ${invoice.clientPhone}` : ''}
          </div>
        </div>
        <div class="party" style="text-align: right;">
          <div class="party-title">Reference</div>
          <div class="party-details">
            ${invoice.reference || 'N/A'}<br>
            ${invoice.paymentTerms ? `Terms: ${invoice.paymentTerms}` : ''}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="qty-col">Qty</th>
            <th class="price-col">Unit Price</th>
            <th class="price-col">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="qty-col">${item.quantity}</td>
              <td class="price-col">${formatCurrency(item.unitPrice)}</td>
              <td class="price-col">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
          <div class="total-row grand">
            <span>Total Due</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <div class="notes-title">Notes / Terms & Conditions</div>
          <div>${invoice.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        Thank you for your business!<br>
        ${COMPANY_INFO.name} • ${COMPANY_INFO.email}
      </div>
    </body>
    </html>
  `;

  printDocument(html, `Invoice_${invoice.invoiceNumber}`);
}

export function generateQuotationPDF(quotation: Quotation): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quotation.quotationNumber}</title>
      ${generatePDFStyles()}
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="company-details">
            ${COMPANY_INFO.address}<br>
            ${COMPANY_INFO.phone}<br>
            ${COMPANY_INFO.email}
          </div>
        </div>
        <div class="doc-info">
          <div class="doc-type">QUOTATION</div>
          <div class="doc-number">${quotation.quotationNumber}</div>
          <div class="doc-date">
            Issue Date: ${format(new Date(quotation.issueDate), 'dd MMM yyyy')}<br>
            ${quotation.validUntil ? `Valid Until: ${format(new Date(quotation.validUntil), 'dd MMM yyyy')}` : ''}
          </div>
          <div style="margin-top: 10px;">
            <span class="status-badge ${getStatusClass(quotation.status)}">${quotation.status}</span>
          </div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-title">Prepared For</div>
          <div class="party-name">${quotation.clientName || 'N/A'}</div>
          <div class="party-details">
            ${quotation.clientAddress || ''}<br>
            ${quotation.clientEmail ? `Email: ${quotation.clientEmail}` : ''}<br>
            ${quotation.clientPhone ? `Phone: ${quotation.clientPhone}` : ''}
          </div>
        </div>
        <div class="party" style="text-align: right;">
          <div class="party-title">Reference</div>
          <div class="party-details">
            ${quotation.reference || 'N/A'}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="qty-col">Qty</th>
            <th class="price-col">Unit Price</th>
            <th class="price-col">Total</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="qty-col">${item.quantity}</td>
              <td class="price-col">${formatCurrency(item.unitPrice)}</td>
              <td class="price-col">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(quotation.total)}</span>
          </div>
          <div class="total-row grand">
            <span>Total</span>
            <span>${formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </div>

      ${quotation.notes ? `
        <div class="notes">
          <div class="notes-title">Notes / Terms & Conditions</div>
          <div>${quotation.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        This quotation is valid until ${quotation.validUntil ? format(new Date(quotation.validUntil), 'dd MMM yyyy') : '30 days from issue date'}.<br>
        ${COMPANY_INFO.name} • ${COMPANY_INFO.email}
      </div>
    </body>
    </html>
  `;

  printDocument(html, `Quotation_${quotation.quotationNumber}`);
}

export function generatePOPDF(po: PurchaseOrder): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order ${po.poNumber}</title>
      ${generatePDFStyles()}
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="company-details">
            ${COMPANY_INFO.address}<br>
            ${COMPANY_INFO.phone}<br>
            ${COMPANY_INFO.email}
          </div>
        </div>
        <div class="doc-info">
          <div class="doc-type">PURCHASE ORDER</div>
          <div class="doc-number">${po.poNumber}</div>
          <div class="doc-date">
            Issue Date: ${format(new Date(po.createdAt), 'dd MMM yyyy')}<br>
            ${po.expectedDelivery ? `Expected Delivery: ${format(new Date(po.expectedDelivery), 'dd MMM yyyy')}` : ''}
          </div>
          <div style="margin-top: 10px;">
            <span class="status-badge ${getStatusClass(po.status)}">${po.status}</span>
          </div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-title">Vendor</div>
          <div class="party-name">${po.vendorName}</div>
          <div class="party-details">
            ${po.vendorAddress || ''}<br>
            ${po.vendorEmail ? `Email: ${po.vendorEmail}` : ''}
          </div>
        </div>
        <div class="party" style="text-align: right;">
          <div class="party-title">Ship To</div>
          <div class="party-details">
            ${COMPANY_INFO.address}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="qty-col">Qty</th>
            <th class="price-col">Unit Price</th>
            <th class="price-col">Total</th>
          </tr>
        </thead>
        <tbody>
          ${po.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="qty-col">${item.quantity}</td>
              <td class="price-col">${formatCurrency(item.unitPrice)}</td>
              <td class="price-col">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <div class="total-row grand">
            <span>Total</span>
            <span>${formatCurrency(po.total)}</span>
          </div>
        </div>
      </div>

      ${po.notes ? `
        <div class="notes">
          <div class="notes-title">Notes</div>
          <div>${po.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        Authorized by: ${po.creatorName || 'N/A'}<br>
        ${COMPANY_INFO.name} • ${COMPANY_INFO.email}
      </div>
    </body>
    </html>
  `;

  printDocument(html, `PO_${po.poNumber}`);
}

function printDocument(html: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}