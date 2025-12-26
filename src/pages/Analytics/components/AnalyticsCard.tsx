import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string; // Tailwind color class like 'text-blue-600'
  subtext?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon: Icon, color = 'text-primary-600', subtext }) => {
  return (
    <div className="bg-white overflow-hidden rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;