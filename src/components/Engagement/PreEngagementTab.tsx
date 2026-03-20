import React from 'react';
import { PreEngagement } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const PreEngagementTab: React.FC<{ data?: PreEngagement }> = ({ data }) => {
  if (!data) return <div className="text-gray-500 p-6">No Pre-Engagement record found.</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Client Acceptance & Continuance</h3>
          <p className="text-sm text-gray-500">ISA 220 Compliance Record</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {data.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Engagement Terms</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Framework:</dt>
              <dd className="font-medium">{data.financialFramework}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Audit Period:</dt>
              <dd className="font-medium">{new Date(data.auditPeriodStart).toLocaleDateString()} - {new Date(data.auditPeriodEnd).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Agreed Fee:</dt>
              <dd className="font-medium">{data.currency} {data.agreedFee?.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Checklist Results</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span>Integrity Check: <span className="text-gray-600">{data.integrityCheckResult || 'Completed'}</span></span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span>Competence: <span className="text-gray-600">{data.competenceCheckResult || 'Verified'}</span></span>
            </li>
            <li className="flex items-center gap-2">
              {data.termsAgreed ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <XCircleIcon className="h-5 w-5 text-red-500" />}
              <span>Terms Agreed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreEngagementTab;