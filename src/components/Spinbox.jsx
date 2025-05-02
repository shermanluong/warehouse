import { useEffect } from 'react';

function Spinbox({value, max, OnValueChange}) {
  const min = 1;
  const step = 1;

  const increment = () => {
    if (value < max) {
      OnValueChange(value + step);
    }
  };

  const decrement = () => {
    if (value > min) {
      OnValueChange( value - step);
    }
  };

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      OnValueChange(newValue);
    }
  };

  useEffect(() => {
    // Ensure that the value doesn't exceed max or go below min when the component mounts
    if (value < min) {
      OnValueChange(min);
    } else if (value > max) {
      OnValueChange(max);
    }
  }, [value, min, max, OnValueChange]);

  return (
    <div className="flex items-center space-x-2">
      <button
        className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={decrement}
      >
        -
      </button>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="w-16 text-center p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <button
        className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={increment}
      >
        +
      </button>
    </div>
  );
}

export default Spinbox;
