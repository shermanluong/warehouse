import { useState } from 'react';

const SwitchButton = ({ isChecked = false, OnValueChange }) => {
  const toggleSwitch = () => OnValueChange(!isChecked);

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm">{isChecked ? 'Picking' : 'Packing'}</span>
      <button
        onClick={toggleSwitch}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <span
          className={`w-4 h-4 bg-white rounded-full transition-all duration-300 transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`}
        ></span>
      </button>
    </div>
  );
};

export default SwitchButton;
