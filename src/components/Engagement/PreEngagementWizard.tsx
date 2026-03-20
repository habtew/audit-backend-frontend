import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  BanknotesIcon 
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Client, PreEngagement } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Called when final engagement is created
  clients: Client[];
}

const steps = [
  { id: 1, name: 'Client Info', icon: UserGroupIcon },
  { id: 2, name: 'Independence', icon: ShieldCheckIcon },
  { id: 3, name: 'Risk Check', icon: DocumentTextIcon },
  { id: 4, name: 'Terms', icon: BanknotesIcon },
  { id: 5, name: 'Finalize', icon: CheckCircleIcon },
];

const PreEngagementWizard: React.FC<Props> = ({ isOpen, onClose, onSuccess, clients }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preEngagement, setPreEngagement] = useState<PreEngagement | null>(null);

  // Forms for each step
  const step1Form = useForm(); // Basic Info
  const step2Form = useForm(); // Independence
  const step3Form = useForm(); // Risk
  const step4Form = useForm(); // Terms
  const step5Form = useForm(); // Final Engagement Creation

  // --- Step 1: Create Draft ---
  const handleStep1 = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.createPreEngagement({
        clientId: data.clientId,
        financialFramework: data.financialFramework || "IFRS",
        auditPeriodStart: new Date(data.auditPeriodStart).toISOString(),
        auditPeriodEnd: new Date(data.auditPeriodEnd).toISOString(),
      });
      setPreEngagement(res.data);
      setCurrentStep(2);
      toast.success("Draft Created");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Independence ---
  const handleStep2 = async (data: any) => {
    if (!preEngagement) return;
    setLoading(true);
    try {
      await api.declareIndependence(preEngagement.id, {
        isIndependent: true,
        safeguardsApplied: data.safeguardsApplied || "No prior relationship."
      });
      setCurrentStep(3);
      toast.success("Independence Declared");
    } catch (e) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Risk Assessment ---
  const handleStep3 = async (data: any) => {
    if (!preEngagement) return;
    setLoading(true);
    try {
      await api.patchPreEngagementAssessment(preEngagement.id, {
        integrityCheckResult: data.integrityCheckResult,
        competenceCheckResult: data.competenceCheckResult,
        managementAcknowledged: true
      });
      setCurrentStep(4);
      toast.success("Risk Assessment Updated");
    } catch (e) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4: Terms & Approval ---
  const handleStep4 = async (data: any) => {
    if (!preEngagement) return;
    setLoading(true);
    try {
      // 1. Save Terms
      await api.updatePreEngagementTerms(preEngagement.id, {
        agreedFee: Number(data.agreedFee),
        currency: data.currency || "USD",
        termsAgreed: true
      });
      
      // 2. Approve (Auto-approve for demo/partner)
      await api.reviewPreEngagement(preEngagement.id, 'APPROVED');
      
      setCurrentStep(5);
      toast.success("Pre-Engagement Approved!");
    } catch (e) {
      toast.error("Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 5: Create Actual Engagement ---
  const handleStep5 = async (data: any) => {
    if (!preEngagement) return;
    setLoading(true);
    try {
      // Backend automatically links if we provide correct data? 
      // User prompt shows create engagement takes clientId. 
      // Ideally backend links via logic or we pass preEngagementId if supported.
      // Based on prompt, we just call create engagement normally now that pre-reqs are met.
      
      await api.createEngagement({
        clientId: preEngagement.clientId,
        name: data.name,
        description: data.description,
        type: data.type || "AUDIT",
        yearEnd: preEngagement.auditPeriodEnd, // Use same year end
        startDate: preEngagement.auditPeriodStart,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        budgetHours: Number(data.budgetHours)
      });
      
      toast.success("Engagement Created Successfully!");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Failed to create engagement");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={() => {}}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">New Engagement Workflow</h2>
            <div className="mt-4 flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                return (
                  <div key={step.id} className={`flex flex-col items-center bg-white px-2 ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'border-indigo-600 bg-indigo-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 font-medium">{step.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {currentStep === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Client & Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Client</label>
                    <select {...step1Form.register('clientId')} required className="input">
                      <option value="">Select Client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" {...step1Form.register('auditPeriodStart')} required className="input" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" {...step1Form.register('auditPeriodEnd')} required className="input" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Framework</label>
                    <select {...step1Form.register('financialFramework')} className="input">
                      <option value="IFRS">IFRS</option>
                      <option value="GAAP">GAAP</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">Create Draft</button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
                <h3 className="text-lg font-medium">Step 2: Independence Declaration</h3>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800 mb-4">
                  Review the firm's independence policy. Confirm there are no conflicts of interest.
                </div>
                <div>
                  <label className="label">Safeguards Applied</label>
                  <textarea 
                    {...step2Form.register('safeguardsApplied')} 
                    defaultValue="No prior relationship with client."
                    className="input" 
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" required className="h-4 w-4 text-indigo-600 rounded" />
                   <span className="text-sm">I declare that I am independent of this client.</span>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="submit" disabled={loading} className="btn-primary">Confirm Independence</button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
                <h3 className="text-lg font-medium">Step 3: Risk Assessment</h3>
                <div>
                  <label className="label">Integrity Check Result</label>
                  <input {...step3Form.register('integrityCheckResult')} defaultValue="Background checks clear." className="input" />
                </div>
                <div>
                  <label className="label">Competence Check Result</label>
                  <input {...step3Form.register('competenceCheckResult')} defaultValue="Firm has capacity and expertise." className="input" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="submit" disabled={loading} className="btn-primary">Submit Assessment</button>
                </div>
              </form>
            )}

            {currentStep === 4 && (
              <form onSubmit={step4Form.handleSubmit(handleStep4)} className="space-y-4">
                <h3 className="text-lg font-medium">Step 4: Terms & Approval</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Agreed Fee</label>
                    <input type="number" {...step4Form.register('agreedFee')} required className="input" />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select {...step4Form.register('currency')} className="input">
                      <option value="USD">USD</option>
                      <option value="ETB">ETB</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                   <input type="checkbox" required className="h-4 w-4 text-indigo-600 rounded" />
                   <span className="text-sm">Client has agreed to the Engagement Letter terms.</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve Pre-Engagement</button>
                </div>
              </form>
            )}

            {currentStep === 5 && (
              <form onSubmit={step5Form.handleSubmit(handleStep5)} className="space-y-4">
                <h3 className="text-lg font-bold text-green-700">✓ Pre-Engagement Approved</h3>
                <p className="text-sm text-gray-500">You can now create the final Engagement file.</p>
                
                <div>
                  <label className="label">Engagement Name</label>
                  <input {...step5Form.register('name')} required className="input" placeholder="e.g. Audit 2025 - Financials" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input {...step5Form.register('description')} className="input" placeholder="Statutory Financial Audit" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="label">Type</label>
                     <select {...step5Form.register('type')} className="input">
                       <option value="AUDIT">Audit</option>
                       <option value="REVIEW">Review</option>
                     </select>
                  </div>
                  <div>
                    <label className="label">Budget Hours</label>
                    <input type="number" {...step5Form.register('budgetHours')} defaultValue={150} className="input" />
                  </div>
                   <div>
                    <label className="label">Planned End Date</label>
                    <input type="date" {...step5Form.register('endDate')} required className="input" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button type="submit" disabled={loading} className="btn-primary w-full">Create Engagement File</button>
                </div>
              </form>
            )}

          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PreEngagementWizard;