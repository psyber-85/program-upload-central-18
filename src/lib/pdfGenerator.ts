import { Invoice, Quotation, PurchaseOrder, Payment, Payslip } from './dal/types';
import { format } from 'date-fns';

// Template background image path
const TEMPLATE_BG = '/images/document-template.png';

// Position coordinates for text overlay (in mm for A4)
const POSITIONS = {
  // Document type and info (top section after header)
  docTitle: { top: '215px', left: '50px' },
  docNumber: { top: '215px', right: '50px' },
  docDate: { top: '235px', right: '50px' },
  
  // Recipient section
  attnLabel: { top: '280px', left: '50px' },
  recipientName: { top: '300px', left: '50px' },
  recipientEmail: { top: '320px', left: '50px' },
  recipientTitle: { top: '340px', left: '50px' },
  
  // Table area
  tableHeader: { top: '390px', left: '50px', right: '50px' },
  tableContent: { top: '430px', left: '50px', right: '50px' },
  
  // Footer area
  footerLeft: { bottom: '130px', left: '50px' },
  total: { bottom: '130px', right: '50px' },
  signature: { bottom: '80px', right: '50px' },
};

function generateTemplateStyles(): string {
  return `
    <style>
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        @page { 
          size: A4; 
          margin: 0; 
        }
      }
      * { 
        box-sizing: border-box; 
        margin: 0; 
        padding: 0; 
      }
      body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        font-size: 12px; 
        color: #333;
        width: 210mm;
        height: 297mm;
        position: relative;
        background-image: url('${TEMPLATE_BG}');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;
      }
      .overlay {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .doc-title {
        position: absolute;
        top: ${POSITIONS.docTitle.top};
        left: ${POSITIONS.docTitle.left};
        font-size: 24px;
        font-weight: bold;
        color: #1a1a1a;
      }
      .doc-number {
        position: absolute;
        top: ${POSITIONS.docNumber.top};
        right: ${POSITIONS.docNumber.right};
        font-size: 14px;
        font-weight: bold;
        color: #333;
        text-align: right;
      }
      .doc-date {
        position: absolute;
        top: ${POSITIONS.docDate.top};
        right: ${POSITIONS.docDate.right};
        font-size: 12px;
        color: #666;
        text-align: right;
      }
      .attn-label {
        position: absolute;
        top: ${POSITIONS.attnLabel.top};
        left: ${POSITIONS.attnLabel.left};
        font-size: 11px;
        font-weight: bold;
        color: #666;
        text-transform: uppercase;
      }
      .recipient-name {
        position: absolute;
        top: ${POSITIONS.recipientName.top};
        left: ${POSITIONS.recipientName.left};
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      .recipient-email {
        position: absolute;
        top: ${POSITIONS.recipientEmail.top};
        left: ${POSITIONS.recipientEmail.left};
        font-size: 12px;
        color: #666;
      }
      .recipient-title {
        position: absolute;
        top: ${POSITIONS.recipientTitle.top};
        left: ${POSITIONS.recipientTitle.left};
        font-size: 12px;
        color: #666;
      }
      .table-container {
        position: absolute;
        top: ${POSITIONS.tableContent.top};
        left: ${POSITIONS.tableContent.left};
        right: ${POSITIONS.tableContent.right};
        width: calc(100% - 100px);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        background: #1a1a1a;
        color: white;
        padding: 10px 12px;
        text-align: left;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
      th:last-child {
        text-align: right;
        width: 120px;
      }
      td {
        padding: 10px 12px;
        border-bottom: 1px solid #e5e5e5;
        font-size: 12px;
      }
      td:last-child {
        text-align: right;
      }
      .footer-left {
        position: absolute;
        bottom: ${POSITIONS.footerLeft.bottom};
        left: ${POSITIONS.footerLeft.left};
        font-size: 10px;
        color: #666;
        line-height: 1.6;
        max-width: 300px;
      }
      .total-section {
        position: absolute;
        bottom: ${POSITIONS.total.bottom};
        right: ${POSITIONS.total.right};
        text-align: right;
      }
      .total-label {
        font-size: 14px;
        color: #333;
        margin-bottom: 5px;
      }
      .total-amount {
        font-size: 20px;
        font-weight: bold;
        color: #1a1a1a;
      }
      .signature-area {
        position: absolute;
        bottom: ${POSITIONS.signature.bottom};
        right: ${POSITIONS.signature.right};
        text-align: right;
        font-size: 11px;
        color: #666;
      }
      .signature-line {
        border-top: 1px solid #333;
        width: 150px;
        margin-left: auto;
        margin-bottom: 5px;
      }
    </style>
  `;
}

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================
// INVOICE PDF
// ============================================
export function generateInvoicePDF(invoice: Invoice): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      ${generateTemplateStyles()}
    </head>
    <body>
      <div class="overlay">
        <div class="doc-title">INVOICE</div>
        <div class="doc-number">${invoice.invoiceNumber}</div>
        <div class="doc-date">Date: ${format(new Date(invoice.issueDate), 'dd MMM yyyy')}</div>
        
        <div class="attn-label">ATTN TO:</div>
        <div class="recipient-name">${invoice.clientName || 'N/A'}</div>
        <div class="recipient-email">${invoice.clientEmail || ''}</div>
        <div class="recipient-title">${invoice.reference || ''}</div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}${item.quantity > 1 ? ` (x${item.quantity})` : ''}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer-left">
          All prices are in MYR (Malaysian Ringgit).<br>
          SST: Not Registered
        </div>
        
        <div class="total-section">
          <div class="total-label">Total</div>
          <div class="total-amount">${formatCurrency(invoice.total)}</div>
        </div>
        
        <div class="signature-area">
          <div class="signature-line"></div>
          Authorized Signature
        </div>
      </div>
    </body>
    </html>
  `;

  printDocument(html, `Invoice_${invoice.invoiceNumber}`);
}

// ============================================
// QUOTATION PDF
// ============================================
export function generateQuotationPDF(quotation: Quotation): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quotation.quotationNumber}</title>
      ${generateTemplateStyles()}
    </head>
    <body>
      <div class="overlay">
        <div class="doc-title">QUOTATION</div>
        <div class="doc-number">${quotation.quotationNumber}</div>
        <div class="doc-date">Date: ${format(new Date(quotation.issueDate), 'dd MMM yyyy')}</div>
        
        <div class="attn-label">ATTN TO:</div>
        <div class="recipient-name">${quotation.clientName || 'N/A'}</div>
        <div class="recipient-email">${quotation.clientEmail || ''}</div>
        <div class="recipient-title">${quotation.reference || ''}</div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.items.map(item => `
                <tr>
                  <td>${item.description}${item.quantity > 1 ? ` (x${item.quantity})` : ''}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer-left">
          All prices are in MYR (Malaysian Ringgit).<br>
          SST: Not Registered<br>
          ${quotation.validUntil ? `Valid until: ${format(new Date(quotation.validUntil), 'dd MMM yyyy')}` : ''}
        </div>
        
        <div class="total-section">
          <div class="total-label">Total</div>
          <div class="total-amount">${formatCurrency(quotation.total)}</div>
        </div>
        
        <div class="signature-area">
          <div class="signature-line"></div>
          Authorized Signature
        </div>
      </div>
    </body>
    </html>
  `;

  printDocument(html, `Quotation_${quotation.quotationNumber}`);
}

// ============================================
// PURCHASE ORDER PDF
// ============================================
export function generatePOPDF(po: PurchaseOrder): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order ${po.poNumber}</title>
      ${generateTemplateStyles()}
    </head>
    <body>
      <div class="overlay">
        <div class="doc-title">PURCHASE ORDER</div>
        <div class="doc-number">${po.poNumber}</div>
        <div class="doc-date">Date: ${format(new Date(po.createdAt), 'dd MMM yyyy')}</div>
        
        <div class="attn-label">VENDOR:</div>
        <div class="recipient-name">${po.vendorName}</div>
        <div class="recipient-email">${po.vendorEmail || ''}</div>
        <div class="recipient-title">${po.vendorAddress || ''}</div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              ${po.items.map(item => `
                <tr>
                  <td>${item.description}${item.quantity > 1 ? ` (x${item.quantity})` : ''}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer-left">
          All prices are in MYR (Malaysian Ringgit).<br>
          ${po.expectedDelivery ? `Expected Delivery: ${format(new Date(po.expectedDelivery), 'dd MMM yyyy')}` : ''}
          ${po.notes ? `<br>Notes: ${po.notes}` : ''}
        </div>
        
        <div class="total-section">
          <div class="total-label">Total</div>
          <div class="total-amount">${formatCurrency(po.total)}</div>
        </div>
        
        <div class="signature-area">
          <div class="signature-line"></div>
          Authorized by: ${po.creatorName || 'N/A'}
        </div>
      </div>
    </body>
    </html>
  `;

  printDocument(html, `PO_${po.poNumber}`);
}

// ============================================
// PAYMENT PDF
// ============================================
export function generatePaymentPDF(payment: Payment): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment ${payment.paymentNumber}</title>
      ${generateTemplateStyles()}
    </head>
    <body>
      <div class="overlay">
        <div class="doc-title">PAYMENT</div>
        <div class="doc-number">${payment.paymentNumber}</div>
        <div class="doc-date">Date: ${format(new Date(payment.paymentDate), 'dd MMM yyyy')}</div>
        
        <div class="attn-label">PAID TO:</div>
        <div class="recipient-name">${payment.vendorName}</div>
        <div class="recipient-email">Method: ${payment.paymentMethod}</div>
        <div class="recipient-title">${payment.reference ? `Ref: ${payment.reference}` : ''}</div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Payment to ${payment.vendorName}${payment.notes ? ` - ${payment.notes}` : ''}</td>
                <td>${formatCurrency(payment.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer-left">
          All amounts in MYR (Malaysian Ringgit).<br>
          Payment Method: ${payment.paymentMethod}
          ${payment.reference ? `<br>Reference: ${payment.reference}` : ''}
        </div>
        
        <div class="total-section">
          <div class="total-label">Total Paid</div>
          <div class="total-amount">${formatCurrency(payment.amount)}</div>
        </div>
        
        <div class="signature-area">
          <div class="signature-line"></div>
          Authorized by: ${payment.creatorName || 'N/A'}
        </div>
      </div>
    </body>
    </html>
  `;

  printDocument(html, `Payment_${payment.paymentNumber}`);
}

// ============================================
// PAYSLIP PDF
// ============================================
export function generatePayslipPDF(payslip: Payslip, staffName: string): void {
  const monthLabel = format(new Date(payslip.month + '-01'), 'MMMM yyyy');
  const additions = payslip.claimsTotal + payslip.trainingClaimsTotal;
  const deductions = payslip.epf + payslip.socso;
  const grossPay = payslip.baseSalary + additions;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip ${monthLabel}</title>
      ${generateTemplateStyles()}
    </head>
    <body>
      <div class="overlay">
        <div class="doc-title">PAYSLIP</div>
        <div class="doc-number">${monthLabel}</div>
        <div class="doc-date">Generated: ${format(new Date(), 'dd MMM yyyy')}</div>
        
        <div class="attn-label">EMPLOYEE:</div>
        <div class="recipient-name">${staffName}</div>
        <div class="recipient-email">Pay Period: ${monthLabel}</div>
        <div class="recipient-title"></div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>EARNINGS</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>Base Salary</td>
                <td>${formatCurrency(payslip.baseSalary)}</td>
              </tr>
              ${payslip.claimsTotal > 0 ? `
              <tr>
                <td>Claims Reimbursement</td>
                <td>+ ${formatCurrency(payslip.claimsTotal)}</td>
              </tr>
              ` : ''}
              ${payslip.trainingClaimsTotal > 0 ? `
              <tr>
                <td>Training Claims</td>
                <td>+ ${formatCurrency(payslip.trainingClaimsTotal)}</td>
              </tr>
              ` : ''}
              <tr>
                <td><strong>Gross Pay</strong></td>
                <td><strong>${formatCurrency(grossPay)}</strong></td>
              </tr>
              <tr>
                <td><strong>DEDUCTIONS</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>EPF (Employee ${payslip.epf > 0 ? Math.round((payslip.epf / payslip.baseSalary) * 100) : 0}%)</td>
                <td>- ${formatCurrency(payslip.epf)}</td>
              </tr>
              <tr>
                <td>SOCSO (Employee)</td>
                <td>- ${formatCurrency(payslip.socso)}</td>
              </tr>
              <tr>
                <td><strong>Total Deductions</strong></td>
                <td><strong>- ${formatCurrency(deductions)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer-left">
          Employer Contributions (Info):<br>
          EPF (Employer): ${formatCurrency(payslip.employerEpf || 0)}<br>
          SOCSO (Employer): ${formatCurrency(payslip.employerSocso || 0)}
        </div>
        
        <div class="total-section">
          <div class="total-label">Net Pay</div>
          <div class="total-amount">${formatCurrency(payslip.netPay)}</div>
        </div>
        
        <div class="signature-area">
          <div class="signature-line"></div>
          Authorized Signature
        </div>
      </div>
    </body>
    </html>
  `;

  printDocument(html, `Payslip_${staffName}_${payslip.month}`);
}

// ============================================
// PRINT DOCUMENT HELPER
// ============================================
function printDocument(html: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for background image to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
