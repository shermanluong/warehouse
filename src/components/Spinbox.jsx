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
    <div className="flex items-center space-x-4">
      <button
        className="w-12 h-12 text-2xl bg-blue-600 text-white rounded-full hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
        onClick={decrement}
        aria-label="Decrease"
        type="button"
      >
        –
      </button>
  
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="w-20 h-12 text-2xl text-center border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-300 transition"
        aria-label="Box count"
      />
  
      <button
        className="w-12 h-12 text-2xl bg-blue-600 text-white rounded-full hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
        onClick={increment}
        aria-label="Increase"
        type="button"
      >
        +
      </button>
    </div>
  )
}

export default Spinbox;
