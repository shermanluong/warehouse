import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const DropdownActionButton = ({ handleImport, handleDelete, handleDeleteAll, loading }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition disabled:opacity-50"
      >
        {loading ? (
          <ArrowPathIcon className="animate-spin h-5 w-5 text-white" />
        ) : (
          'Actions'
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <button
            onClick={() => {
              handleImport();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Import
          </button>
          <button
            onClick={() => {
              handleDelete();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => {
              handleDeleteAll();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-700"
          >
            Delete All
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownActionButton;
