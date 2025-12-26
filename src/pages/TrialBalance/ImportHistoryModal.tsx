import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { apiClient } from '../../utils/api';
import { ImportHistory } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  engagementId?: string;
}

const ImportHistoryModal: React.FC<Props> = ({ isOpen, onClose, engagementId }) => {
  const [history, setHistory] = useState<ImportHistory[]>([]);

  useEffect(() => {
    if (isOpen && engagementId) {
      apiClient.getImportHistory(engagementId).then(res => setHistory(res.data));
    }
  }, [isOpen, engagementId]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Import History</h3>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">File</th>
                <th className="p-2">Records</th>
                <th className="p-2">Status</th>
                <th className="p-2">User</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-b">
                  <td className="p-2">{new Date(h.importedAt).toLocaleString()}</td>
                  <td className="p-2">{h.fileName}</td>
                  <td className="p-2">{h.recordCount}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${h.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="p-2">{h.importedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportHistoryModal;