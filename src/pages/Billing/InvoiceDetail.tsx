// // import React, { useEffect, useState } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { apiClient } from '../../utils/api';
// // import { Invoice } from '../../types';
// // import LoadingSpinner from '../../components/Common/LoadingSpinner';
// // import { ArrowLeftIcon, PrinterIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
// // import toast from 'react-hot-toast';

// // const InvoiceDetail: React.FC = () => {
// //   const { id } = useParams<{ id: string }>();
// //   const navigate = useNavigate();
// //   const [invoice, setInvoice] = useState<Invoice | null>(null);
// //   const [loading, setLoading] = useState(true);

// //   const fetchInvoice = () => {
// //     if (id) {
// //         setLoading(true);
// //         apiClient.getInvoiceById(id)
// //             .then(res => setInvoice(res.data))
// //             .catch(() => toast.error("Invoice not found"))
// //             .finally(() => setLoading(false));
// //     }
// //   };

// //   useEffect(() => {
// //     fetchInvoice();
// //   }, [id]);

// //   const handleMarkPaid = async () => {
// //     if(!invoice) return;
// //     try {
// //         await apiClient.markInvoicePaid(invoice.id);
// //         toast.success("Marked as Paid");
// //         fetchInvoice();
// //     } catch(e) { toast.error("Failed to update status"); }
// //   };

// //   const handleSend = async () => {
// //     if(!invoice) return;
// //     try {
// //         await apiClient.sendInvoice(invoice.id);
// //         toast.success(`Invoice sent to ${invoice.client?.email || 'client'}`);
// //         fetchInvoice(); // Update status to SENT
// //     } catch(e) { toast.error("Failed to send email"); }
// //   };

// //   if (loading) return <LoadingSpinner />;
// //   if (!invoice) return <div>Not Found</div>;

// //   return (
// //     <div className="p-6 max-w-5xl mx-auto">
// //       <button onClick={() => navigate('/billing/invoices')} className="flex items-center text-gray-500 hover:text-gray-700 mb-4">
// //         <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to List
// //       </button>

// //       {/* Toolbar */}
// //       <div className="flex justify-between items-center mb-6">
// //         <div>
// //             <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
// //             <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium 
// //                 ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
// //                 {invoice.status}
// //             </span>
// //         </div>
// //         <div className="flex gap-2">
// //             {invoice.status !== 'PAID' && (
// //                 <button onClick={handleMarkPaid} className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50">
// //                     <CheckCircleIcon className="w-5 h-5 mr-2" /> Mark Paid
// //                 </button>
// //             )}
// //             <button onClick={handleSend} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
// //                 <EnvelopeIcon className="w-5 h-5 mr-2" /> Send to Client
// //             </button>
// //         </div>
// //       </div>

// //       {/* Invoice Paper */}
// //       <div className="bg-white shadow-lg rounded-lg p-10 border border-gray-200">
// //         <div className="flex justify-between mb-10">
// //             <div>
// //                 <h2 className="text-xl font-bold text-gray-800">AUDIT FIRM INC.</h2>
// //                 <p className="text-gray-500">123 Audit Street</p>
// //                 <p className="text-gray-500">New York, NY 10001</p>
// //             </div>
// //             <div className="text-right">
// //                 <h3 className="text-gray-600 uppercase tracking-wide">Billed To:</h3>
// //                 <p className="font-bold text-lg">{invoice.client?.name}</p>
// //                 <p className="text-gray-500">{invoice.client?.email}</p>
// //             </div>
// //         </div>

// //         <div className="grid grid-cols-2 gap-8 mb-10">
// //             <div>
// //                 <p className="text-gray-600">Engagement:</p>
// //                 <p className="font-medium">{invoice.engagement?.name || 'General Services'}</p>
// //             </div>
// //             <div className="text-right">
// //                 <div className="flex justify-end gap-8">
// //                     <div>
// //                         <p className="text-gray-600 text-sm">Issue Date</p>
// //                         <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
// //                     </div>
// //                     <div>
// //                         <p className="text-gray-600 text-sm">Due Date</p>
// //                         <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>

// //         <table className="w-full mb-8">
// //             <thead>
// //                 <tr className="border-b-2 border-gray-300">
// //                     <th className="text-left py-2 font-bold text-gray-700">Description</th>
// //                     <th className="text-right py-2 font-bold text-gray-700">Hours/Qty</th>
// //                     <th className="text-right py-2 font-bold text-gray-700">Rate</th>
// //                     <th className="text-right py-2 font-bold text-gray-700">Amount</th>
// //                 </tr>
// //             </thead>
// //             <tbody>
// //                 {invoice.items.map((item, idx) => (
// //                     <tr key={idx} className="border-b border-gray-100">
// //                         <td className="py-3 text-gray-800">{item.description}</td>
// //                         <td className="py-3 text-right text-gray-600">{item.quantity}</td>
// //                         <td className="py-3 text-right text-gray-600">${item.rate}</td>
// //                         <td className="py-3 text-right font-medium">${item.amount.toLocaleString()}</td>
// //                     </tr>
// //                 ))}
// //             </tbody>
// //         </table>

// //         <div className="flex justify-end">
// //             <div className="w-1/3 space-y-2">
// //                 <div className="flex justify-between text-gray-600">
// //                     <span>Subtotal</span>
// //                     <span>${invoice.subtotal.toLocaleString()}</span>
// //                 </div>
// //                 <div className="flex justify-between text-gray-600">
// //                     <span>Tax (0%)</span>
// //                     <span>${invoice.taxAmount.toLocaleString()}</span>
// //                 </div>
// //                 <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
// //                     <span>Total</span>
// //                     <span>${invoice.totalAmount.toLocaleString()}</span>
// //                 </div>
// //             </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InvoiceDetail;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { apiClient } from '../../utils/api';
// import { Invoice } from '../../types';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import { ArrowLeftIcon, PrinterIcon, EnvelopeIcon, CheckCircleIcon, TrashIcon, PencilSquareIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const InvoiceDetail: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState<Invoice | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

//   const fetchInvoice = () => {
//     if (id) {
//         setLoading(true);
//         apiClient.getInvoiceById(id)
//             .then(res => setInvoice(res.data))
//             .catch(() => { toast.error("Invoice not found"); navigate('/billing/invoices'); })
//             .finally(() => setLoading(false));
//     }
//   };

//   useEffect(() => {
//     fetchInvoice();
//   }, [id]);

//   const handleDelete = async () => {
//     if (!invoice || !confirm('Are you sure? This cannot be undone.')) return;
//     try {
//         await apiClient.deleteInvoice(invoice.id);
//         toast.success('Invoice deleted');
//         navigate('/billing/invoices');
//     } catch(e) { toast.error('Failed to delete invoice'); }
//   };

//   const handleDownloadPDF = async () => {
//     if (!invoice) return;
//     try {
//         setActionLoading(true);
//         const blob = await apiClient.getInvoicePreview(invoice.id);
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', `Invoice_${invoice.invoiceNumber}.pdf`);
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         toast.success('PDF Downloaded');
//     } catch (e) {
//         toast.error('Failed to download PDF');
//     } finally {
//         setActionLoading(false);
//     }
//   };

//   // ... (handleMarkPaid and handleSend remain similar)
//   const handleMarkPaid = async () => {
//       if(!invoice) return;
//       try { await apiClient.markInvoicePaid(invoice.id); toast.success("Marked as Paid"); fetchInvoice(); } 
//       catch(e) { toast.error("Failed to update status"); }
//   };

//   const handleSend = async () => {
//       if(!invoice) return;
//       try { await apiClient.sendInvoice(invoice.id); toast.success(`Sent to ${invoice.client?.email}`); fetchInvoice(); } 
//       catch(e) { toast.error("Failed to send"); }
//   };

//   if (loading) return <LoadingSpinner />;
//   if (!invoice) return <div>Not Found</div>;

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <div className="flex justify-between items-center mb-4">
//         <button onClick={() => navigate('/billing/invoices')} className="flex items-center text-gray-500 hover:text-gray-700">
//             <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to List
//         </button>
//         <div className="space-x-2">
//             {invoice.status === 'DRAFT' && (
//                 <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1">
//                     Delete Draft
//                 </button>
//             )}
//         </div>
//       </div>

//       {/* Toolbar */}
//       <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
//         <div>
//             <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
//             <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium 
//                 ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
//                   invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                 {invoice.status}
//             </span>
//         </div>
//         <div className="flex gap-2">
//             <button onClick={handleDownloadPDF} disabled={actionLoading} className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50">
//                 {actionLoading ? <LoadingSpinner size="sm"/> : <DocumentArrowDownIcon className="w-5 h-5 mr-2" />} PDF
//             </button>
//             {invoice.status !== 'PAID' && (
//                 <button onClick={handleMarkPaid} className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50">
//                     <CheckCircleIcon className="w-5 h-5 mr-2" /> Mark Paid
//                 </button>
//             )}
//             <button onClick={handleSend} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//                 <EnvelopeIcon className="w-5 h-5 mr-2" /> Send to Client
//             </button>
//         </div>
//       </div>

//       {/* Invoice Paper UI (Same as before) */}
//       <div className="bg-white shadow-lg rounded-lg p-10 border border-gray-200">
//         <div className="flex justify-between mb-10">
//             <div>
//                 <h2 className="text-xl font-bold text-gray-800">AUDIT FIRM INC.</h2>
//                 <p className="text-gray-500">123 Audit Street</p>
//                 <p className="text-gray-500">New York, NY 10001</p>
//             </div>
//             <div className="text-right">
//                 <h3 className="text-gray-600 uppercase tracking-wide">Billed To:</h3>
//                 <p className="font-bold text-lg">{invoice.client?.name}</p>
//                 <p className="text-gray-500">{invoice.client?.email}</p>
//             </div>
//         </div>

//         <div className="grid grid-cols-2 gap-8 mb-10">
//             <div>
//                 <p className="text-gray-600">Engagement:</p>
//                 <p className="font-medium">{invoice.engagement?.name || 'General Services'}</p>
//             </div>
//             <div className="text-right">
//                 <div className="flex justify-end gap-8">
//                     <div>
//                         <p className="text-gray-600 text-sm">Issue Date</p>
//                         <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
//                     </div>
//                     <div>
//                         <p className="text-gray-600 text-sm">Due Date</p>
//                         <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <table className="w-full mb-8">
//             <thead>
//                 <tr className="border-b-2 border-gray-300">
//                     <th className="text-left py-2 font-bold text-gray-700">Description</th>
//                     <th className="text-right py-2 font-bold text-gray-700">Hours/Qty</th>
//                     <th className="text-right py-2 font-bold text-gray-700">Rate</th>
//                     <th className="text-right py-2 font-bold text-gray-700">Amount</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {invoice.items.map((item, idx) => (
//                     <tr key={idx} className="border-b border-gray-100">
//                         <td className="py-3 text-gray-800">{item.description}</td>
//                         <td className="py-3 text-right text-gray-600">{item.quantity}</td>
//                         <td className="py-3 text-right text-gray-600">${item.rate}</td>
//                         <td className="py-3 text-right font-medium">${item.amount.toLocaleString()}</td>
//                     </tr>
//                 ))}
//             </tbody>
//         </table>

//         <div className="flex justify-end">
//             <div className="w-1/3 space-y-2">
//                 <div className="flex justify-between text-gray-600">
//                     <span>Subtotal</span>
//                     <span>${invoice.subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                     <span>Tax (0%)</span>
//                     <span>${invoice.taxAmount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
//                     <span>Total</span>
//                     <span>${invoice.totalAmount.toLocaleString()}</span>
//                 </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceDetail;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import { Invoice } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { ArrowLeftIcon, EnvelopeIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvoice = () => {
    if (id) {
        setLoading(true);
        apiClient.getInvoiceById(id)
            .then(res => setInvoice(res.data))
            .catch(() => { toast.error("Invoice not found"); navigate('/billing/invoices'); })
            .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDelete = async () => {
    if (!invoice || !confirm('Are you sure? This cannot be undone.')) return;
    try {
        await apiClient.deleteInvoice(invoice.id);
        toast.success('Invoice deleted');
        navigate('/billing/invoices');
    } catch(e) { toast.error('Failed to delete invoice'); }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
        setActionLoading(true);
        // Using the PDF endpoint directly
        const blob = await apiClient.downloadInvoicePdf(invoice.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('PDF Downloaded');
    } catch (e) {
        toast.error('Failed to download PDF');
    } finally {
        setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
      if(!invoice) return;
      try { await apiClient.markInvoicePaid(invoice.id); toast.success("Marked as Paid"); fetchInvoice(); } 
      catch(e) { toast.error("Failed to update status"); }
  };

  const handleSend = async () => {
      if(!invoice) return;
      try { 
        await apiClient.sendInvoice(invoice.id); 
        toast.success(`Sent to ${invoice.client?.email || 'client'}`); 
        fetchInvoice(); 
      } catch(e) { toast.error("Failed to send"); }
  };

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div>Not Found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate('/billing/invoices')} className="flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to List
        </button>
        <div className="space-x-2">
            {invoice.status === 'DRAFT' && (
                <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1">
                    Delete Draft
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
            <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium 
                ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                  invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {invoice.status}
            </span>
        </div>
        <div className="flex gap-2">
            <button onClick={handleDownloadPDF} disabled={actionLoading} className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50">
                {actionLoading ? <LoadingSpinner size="sm"/> : <DocumentArrowDownIcon className="w-5 h-5 mr-2" />} PDF
            </button>
            {invoice.status !== 'PAID' && (
                <button onClick={handleMarkPaid} className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50">
                    <CheckCircleIcon className="w-5 h-5 mr-2" /> Mark Paid
                </button>
            )}
            <button onClick={handleSend} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <EnvelopeIcon className="w-5 h-5 mr-2" /> Send to Client
            </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-10 border border-gray-200">
        <div className="flex justify-between mb-10">
            <div>
                <h2 className="text-xl font-bold text-gray-800">AUDIT FIRM INC.</h2>
                <p className="text-gray-500">123 Audit Street</p>
                <p className="text-gray-500">New York, NY 10001</p>
            </div>
            <div className="text-right">
                <h3 className="text-gray-600 uppercase tracking-wide">Billed To:</h3>
                <p className="font-bold text-lg">{invoice.client?.name}</p>
                <p className="text-gray-500">{invoice.client?.email}</p>
                {invoice.client?.address && <p className="text-gray-500">{invoice.client.address}</p>}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
                <p className="text-gray-600">Engagement:</p>
                <p className="font-medium">{invoice.engagement?.name || 'General Services'}</p>
            </div>
            <div className="text-right">
                <div className="flex justify-end gap-8">
                    <div>
                        <p className="text-gray-600 text-sm">Issue Date</p>
                        <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Due Date</p>
                        <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>

        <table className="w-full mb-8">
            <thead>
                <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 font-bold text-gray-700">Description</th>
                    <th className="text-right py-2 font-bold text-gray-700">Hours/Qty</th>
                    <th className="text-right py-2 font-bold text-gray-700">Rate</th>
                    <th className="text-right py-2 font-bold text-gray-700">Amount</th>
                </tr>
            </thead>
            <tbody>
                {/* Changed to use invoiceItems */}
                {invoice.invoiceItems && invoice.invoiceItems.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-gray-100">
                        <td className="py-3 text-gray-800">{item.description}</td>
                        <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-600">${Number(item.rate).toLocaleString()}</td>
                        <td className="py-3 text-right font-medium">${Number(item.amount).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="flex justify-end">
            <div className="w-1/3 space-y-2">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${Number(invoice.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${Number(invoice.tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                    <span>Total</span>
                    <span>${Number(invoice.total).toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        {invoice.notes && (
          <div className="mt-8 pt-4 border-t border-gray-100">
            <p className="text-gray-600 font-medium mb-1">Notes:</p>
            <p className="text-gray-500 text-sm">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;