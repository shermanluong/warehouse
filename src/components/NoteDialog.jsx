import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';

const NoteDialog = ({ isOpen, onClose, onSubmit, defaultNote = '' }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote(defaultNote); // Reset or preload when dialog opens
    }
  }, [isOpen, defaultNote]);

  const handleConfirm = () => {
    onSubmit({ note });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4">Add Note</Dialog.Title>

          {/* Note input field */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your note here..."
            rows={5}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Action buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default NoteDialog;
