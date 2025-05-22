import { useRef, useEffect, useState } from "react";

export default function DriverDropdown({
  drivers = [],
  selected = [],
  onChangeSelected = () => {},
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleSelect = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter((d) => d !== id)
      : [...selected, id];
    onChangeSelected(newSelected);
  };

  const toggleSelectAll = () => {
    const allIds = drivers.map((d) => d.teamMemberId);
    const newSelected =
      selected.length === drivers.length ? [] : [...allIds];
    onChangeSelected(newSelected);
  };

  const isAllSelected = selected.length === drivers.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-64" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 border rounded-md bg-gray-100 text-left transition"
      >
        {selected.length === 0
          ? "Select Drivers"
          : `${selected.length} driver(s) selected`}
      </button>

      {open && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="px-4 py-2 border-b">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <span>Select All</span>
            </label>
          </div>

          {drivers.map((driver) => (
            <div key={driver.teamMemberId} className="px-4 py-2 hover:bg-gray-200 rounded">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={selected.includes(driver.teamMemberId)}
                  onChange={() => toggleSelect(driver.teamMemberId)}
                />
                <span>
                  {driver.firstName} {driver.lastName}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
