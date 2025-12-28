import { Invoice, Quotation, PurchaseOrder, Payment, Payslip } from './dal/types';
import { format } from 'date-fns';

// Base64 encoded template image - embedded to ensure it loads in print window
// This is the document-template.png converted to base64
const TEMPLATE_BASE64 = 'URL_PLACEHOLDER';

// Accurate position coordinates based on template layout (A4: 794px × 1123px at 96dpi)
const POSITIONS = {
  // Document type and info - positioned below header, above table
  docTitle: { top: '178px', left: '48px' },
  docNumber: { top: '178px', right: '48px' },
  docDate: { top: '200px', right: '48px' },
  
  // Recipient section - between doc info and table (adjusted spacing)
  attnLabel: { top: '228px', left: '48px' },
  recipientName: { top: '248px', left: '48px' },
  recipientEmail: { top: '268px', left: '48px' },
  recipientTitle: { top: '288px', left: '48px' },
  
  // Table content area - aligned with template table body
  tableContent: { top: '365px', left: '55px', right: '55px' },
  
  // Total value - aligned with the "Total :" row in footer
  totalValue: { bottom: '198px', right: '75px' },
};

function generateTemplateStyles(): string {
  return `
    <style>
      @media print {
        html, body { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          margin: 0 !important;
          padding: 0 !important;
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
      html, body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        font-size: 12px; 
        color: #333;
        width: 210mm;
        min-height: 297mm;
        position: relative;
      }
      .page {
        width: 210mm;
        min-height: 297mm;
        position: relative;
        background-image: url('${TEMPLATE_BASE64}');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: top left;
      }
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .doc-title {
        position: absolute;
        top: ${POSITIONS.docTitle.top};
        left: ${POSITIONS.docTitle.left};
        font-size: 22px;
        font-weight: bold;
        color: #1a1a1a;
        letter-spacing: 1px;
      }
      .doc-number {
        position: absolute;
        top: ${POSITIONS.docNumber.top};
        right: ${POSITIONS.docNumber.right};
        font-size: 13px;
        font-weight: bold;
        color: #333;
        text-align: right;
      }
      .doc-date {
        position: absolute;
        top: ${POSITIONS.docDate.top};
        right: ${POSITIONS.docDate.right};
        font-size: 11px;
        color: #555;
        text-align: right;
      }
      .attn-label {
        position: absolute;
        top: ${POSITIONS.attnLabel.top};
        left: ${POSITIONS.attnLabel.left};
        font-size: 10px;
        font-weight: bold;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .recipient-name {
        position: absolute;
        top: ${POSITIONS.recipientName.top};
        left: ${POSITIONS.recipientName.left};
        font-size: 13px;
        font-weight: bold;
        color: #333;
      }
      .recipient-email {
        position: absolute;
        top: ${POSITIONS.recipientEmail.top};
        left: ${POSITIONS.recipientEmail.left};
        font-size: 11px;
        color: #555;
      }
      .recipient-title {
        position: absolute;
        top: ${POSITIONS.recipientTitle.top};
        left: ${POSITIONS.recipientTitle.left};
        font-size: 11px;
        color: #555;
      }
      .table-content {
        position: absolute;
        top: ${POSITIONS.tableContent.top};
        left: ${POSITIONS.tableContent.left};
        right: ${POSITIONS.tableContent.right};
        width: calc(100% - 110px);
      }
      .table-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 6px 0;
        border-bottom: 1px solid #e8e8e8;
        font-size: 11px;
      }
      .table-row:last-child {
        border-bottom: none;
      }
      .table-row .desc {
        flex: 1;
        max-width: 72%;
        color: #333;
        padding-right: 10px;
      }
      .table-row .cost {
        width: 140px;
        text-align: right;
        color: #333;
        font-weight: 500;
      }
      .table-row.section-header .desc {
        font-weight: bold;
        color: #1a1a1a;
      }
      .table-row.subtotal .desc,
      .table-row.subtotal .cost {
        font-weight: bold;
      }
      .total-value {
        position: absolute;
        bottom: ${POSITIONS.totalValue.bottom};
        right: ${POSITIONS.totalValue.right};
        font-size: 16px;
        font-weight: bold;
        color: #1a1a1a;
        text-align: right;
      }
    </style>
  `;
}

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper to load image as base64
async function getTemplateBase64(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('/images/document-template.png');
      }
    };
    img.onerror = () => {
      resolve('/images/document-template.png');
    };
    img.src = '/images/document-template.png';
  });
}

// ============================================
// INVOICE PDF
// ============================================
export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  const templateBase64 = await getTemplateBase64();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      ${generateTemplateStyles().replace(TEMPLATE_BASE64, templateBase64)}
    </head>
    <body>
      <div class="page">
        <div class="overlay">
          <div class="doc-title">INVOICE</div>
          <div class="doc-number">${invoice.invoiceNumber}</div>
          <div class="doc-date">Date: ${format(new Date(invoice.issueDate), 'dd MMM yyyy')}</div>
          
          <div class="attn-label">ATTN TO:</div>
          <div class="recipient-name">${invoice.clientName || 'N/A'}</div>
          <div class="recipient-email">${invoice.clientEmail || ''}</div>
          <div class="recipient-title">${invoice.reference || ''}</div>
          
          <div class="table-content">
            ${invoice.items.map(item => `
              <div class="table-row">
                <span class="desc">${item.description}${item.quantity > 1 ? ` (×${item.quantity})` : ''}</span>
                <span class="cost">${formatCurrency(item.total)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-value">${formatCurrency(invoice.total)}</div>
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
export async function generateQuotationPDF(quotation: Quotation): Promise<void> {
  const templateBase64 = await getTemplateBase64();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quotation.quotationNumber}</title>
      ${generateTemplateStyles().replace(TEMPLATE_BASE64, templateBase64)}
    </head>
    <body>
      <div class="page">
        <div class="overlay">
          <div class="doc-title">QUOTATION</div>
          <div class="doc-number">${quotation.quotationNumber}</div>
          <div class="doc-date">Date: ${format(new Date(quotation.issueDate), 'dd MMM yyyy')}${quotation.validUntil ? `<br>Valid until: ${format(new Date(quotation.validUntil), 'dd MMM yyyy')}` : ''}</div>
          
          <div class="attn-label">ATTN TO:</div>
          <div class="recipient-name">${quotation.clientName || 'N/A'}</div>
          <div class="recipient-email">${quotation.clientEmail || ''}</div>
          <div class="recipient-title">${quotation.reference || ''}</div>
          
          <div class="table-content">
            ${quotation.items.map(item => `
              <div class="table-row">
                <span class="desc">${item.description}${item.quantity > 1 ? ` (×${item.quantity})` : ''}</span>
                <span class="cost">${formatCurrency(item.total)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-value">${formatCurrency(quotation.total)}</div>
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
export async function generatePOPDF(po: PurchaseOrder): Promise<void> {
  const templateBase64 = await getTemplateBase64();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order ${po.poNumber}</title>
      ${generateTemplateStyles().replace(TEMPLATE_BASE64, templateBase64)}
    </head>
    <body>
      <div class="page">
        <div class="overlay">
          <div class="doc-title">PURCHASE ORDER</div>
          <div class="doc-number">${po.poNumber}</div>
          <div class="doc-date">Date: ${format(new Date(po.createdAt), 'dd MMM yyyy')}${po.expectedDelivery ? `<br>Delivery: ${format(new Date(po.expectedDelivery), 'dd MMM yyyy')}` : ''}</div>
          
          <div class="attn-label">VENDOR:</div>
          <div class="recipient-name">${po.vendorName}</div>
          <div class="recipient-email">${po.vendorEmail || ''}</div>
          <div class="recipient-title">${po.vendorAddress || ''}</div>
          
          <div class="table-content">
            ${po.items.map(item => `
              <div class="table-row">
                <span class="desc">${item.description}${item.quantity > 1 ? ` (×${item.quantity})` : ''}</span>
                <span class="cost">${formatCurrency(item.total)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-value">${formatCurrency(po.total)}</div>
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
export async function generatePaymentPDF(payment: Payment): Promise<void> {
  const templateBase64 = await getTemplateBase64();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment ${payment.paymentNumber}</title>
      ${generateTemplateStyles().replace(TEMPLATE_BASE64, templateBase64)}
    </head>
    <body>
      <div class="page">
        <div class="overlay">
          <div class="doc-title">PAYMENT</div>
          <div class="doc-number">${payment.paymentNumber}</div>
          <div class="doc-date">Date: ${format(new Date(payment.paymentDate), 'dd MMM yyyy')}</div>
          
          <div class="attn-label">PAID TO:</div>
          <div class="recipient-name">${payment.vendorName}</div>
          <div class="recipient-email">Method: ${payment.paymentMethod}</div>
          <div class="recipient-title">${payment.reference ? `Ref: ${payment.reference}` : ''}</div>
          
          <div class="table-content">
            <div class="table-row">
              <span class="desc">Payment to ${payment.vendorName}${payment.notes ? ` - ${payment.notes}` : ''}</span>
              <span class="cost">${formatCurrency(payment.amount)}</span>
            </div>
          </div>
          
          <div class="total-value">${formatCurrency(payment.amount)}</div>
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
export async function generatePayslipPDF(payslip: Payslip, staffName: string): Promise<void> {
  const templateBase64 = await getTemplateBase64();
  const monthLabel = format(new Date(payslip.month + '-01'), 'MMMM yyyy');
  const additions = payslip.claimsTotal + payslip.trainingClaimsTotal;
  const deductions = payslip.epf + payslip.socso;
  const grossPay = payslip.baseSalary + additions;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip ${monthLabel}</title>
      ${generateTemplateStyles().replace(TEMPLATE_BASE64, templateBase64)}
    </head>
    <body>
      <div class="page">
        <div class="overlay">
          <div class="doc-title">PAYSLIP</div>
          <div class="doc-number">${monthLabel}</div>
          <div class="doc-date">Generated: ${format(new Date(), 'dd MMM yyyy')}</div>
          
          <div class="attn-label">EMPLOYEE:</div>
          <div class="recipient-name">${staffName}</div>
          <div class="recipient-email">Pay Period: ${monthLabel}</div>
          <div class="recipient-title"></div>
          
          <div class="table-content">
            <div class="table-row section-header">
              <span class="desc">EARNINGS</span>
              <span class="cost"></span>
            </div>
            <div class="table-row">
              <span class="desc">Base Salary</span>
              <span class="cost">${formatCurrency(payslip.baseSalary)}</span>
            </div>
            ${payslip.claimsTotal > 0 ? `
            <div class="table-row">
              <span class="desc">Claims Reimbursement</span>
              <span class="cost">+ ${formatCurrency(payslip.claimsTotal)}</span>
            </div>
            ` : ''}
            ${payslip.trainingClaimsTotal > 0 ? `
            <div class="table-row">
              <span class="desc">Training Claims</span>
              <span class="cost">+ ${formatCurrency(payslip.trainingClaimsTotal)}</span>
            </div>
            ` : ''}
            <div class="table-row subtotal">
              <span class="desc">Gross Pay</span>
              <span class="cost">${formatCurrency(grossPay)}</span>
            </div>
            <div class="table-row section-header">
              <span class="desc">DEDUCTIONS</span>
              <span class="cost"></span>
            </div>
            <div class="table-row">
              <span class="desc">EPF (Employee ${payslip.epf > 0 ? Math.round((payslip.epf / payslip.baseSalary) * 100) : 0}%)</span>
              <span class="cost">- ${formatCurrency(payslip.epf)}</span>
            </div>
            <div class="table-row">
              <span class="desc">SOCSO (Employee)</span>
              <span class="cost">- ${formatCurrency(payslip.socso)}</span>
            </div>
            <div class="table-row subtotal">
              <span class="desc">Total Deductions</span>
              <span class="cost">- ${formatCurrency(deductions)}</span>
            </div>
          </div>
          
          <div class="total-value">${formatCurrency(payslip.netPay)}</div>
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
    
    // Wait for base64 image to render then print
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
