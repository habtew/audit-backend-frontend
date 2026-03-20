import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  CalculatorIcon, 
  MapIcon, 
  ExclamationTriangleIcon, 
  UserGroupIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';
import MaterialityForm from './MaterialityForm';
import StrategyForm from './StrategyForm';
import RiskRegister from './RiskRegister';
import FraudForm from './FraudForm';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

interface Props {
  engagementId: string;
  onComplete: () => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const PlanningTab: React.FC<Props> = ({ engagementId, onComplete }) => {
  const [completing, setCompleting] = useState(false);

  const handleCompletePhase = async () => {
    // 1. Confirmation
    if (!confirm("Are you sure you want to complete the Planning Phase? This will lock planning forms and move to Execution.")) return;
    
    try {
      setCompleting(true);
      
      // 2. Call API
      await api.completePlanningPhase(engagementId);
      
      // 3. Success handling
      toast.success("Planning Phase Completed! Moving to Execution.");
      onComplete();
      
    } catch (error: any) {
      console.error("Completion Error:", error);
      
      const responseData = error?.response?.data;
      
      // 4. Robust Error Parsing
      if (responseData?.message && typeof responseData.message === 'object') {
        // Backend returned { message: { message: "...", errors: [...] } }
        const { message, errors } = responseData.message;
        
        toast.error(message || "Validation Failed", { duration: 4000 });
        
        if (Array.isArray(errors)) {
          // Display each specific error from the list
          errors.forEach((err: string) => {
            setTimeout(() => toast.error(err, { icon: '❌' }), 300);
          });
        }
      } else if (typeof responseData?.message === 'string') {
        // Standard string error
        toast.error(responseData.message);
      } else {
        // Fallback
        toast.error("Failed to complete planning phase. Check console.");
      }
    } finally {
      setCompleting(false);
    }
  };

  const tabs = [
    { name: 'Materiality', icon: CalculatorIcon, component: <MaterialityForm engagementId={engagementId} /> },
    { name: 'Strategy', icon: MapIcon, component: <StrategyForm engagementId={engagementId} /> },
    { name: 'Risk Assessment', icon: ExclamationTriangleIcon, component: <RiskRegister engagementId={engagementId} /> },
    { name: 'Fraud Brainstorming', icon: UserGroupIcon, component: <FraudForm engagementId={engagementId} /> },
  ];

  return (
    <div className="mt-4">
      {/* Header & Complete Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg font-bold text-gray-900">Audit Planning Phase</h2>
          <p className="text-sm text-gray-500">Complete all sections below to proceed to Execution.</p>
        </div>
        <button
          onClick={handleCompletePhase}
          disabled={completing}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium text-sm"
        >
          <CheckBadgeIcon className="h-5 w-5 mr-2" />
          {completing ? 'Validating...' : 'Complete Planning Phase'}
        </button>
      </div>

      <Tab.Group>
        <div className="flex flex-col md:flex-row gap-6">
          <Tab.List className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 min-w-[220px] overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 text-left flex items-center transition-all focus:outline-none whitespace-nowrap',
                    selected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                  )
                }
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            {tabs.map((tab, idx) => (
              <Tab.Panel key={idx} className="focus:outline-none animate-fadeIn">
                {tab.component}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
};

export default PlanningTab;