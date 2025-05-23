import { useState } from 'react';

const SwitchButton = ({ isChecked = false, OnValueChange }) => {
  const toggleSwitch = () => OnValueChange(!isChecked);

  return (
    <div className="flex items-center space-x-4">
      <span className="text-xl font-bold">{isChecked ? 'Picking' : 'Packing'}</span>
      <button
        onClick={toggleSwitch}
        className={`w-16 h-8 flex items-center rounded-full p-1 transition-all duration-300 shadow-md border-2 ${
          isChecked ? 'bg-blue-600 border-blue-700' : 'bg-gray-300 border-gray-400'
        }`}
        aria-label="Toggle picking/packing mode"
      >
        <span
          className={`w-6 h-6 bg-white rounded-full transition-all duration-300 transform shadow ${
            isChecked ? 'translate-x-8' : 'translate-x-1'
          }`}
        ></span>
      </button>
    </div>
  );
};

export default SwitchButton;