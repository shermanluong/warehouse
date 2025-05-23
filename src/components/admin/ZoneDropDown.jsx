import { useState, useRef, useEffect } from "react";

export default function ZoneDropdown({ selectedZones, setSelectedZones }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const zones = [
    "Zone1", "Zone2", "Zone3", "Zone4", "Zone5", "Zone6", "Zone7", "Zone8", "Zone9", "Zone10",
    "Zone11", "Zone12", "Zone13", "Zone14", "Zone15", "Zone16", "NEWY", "Central Coast",
    "WOOL", "ACT", "PickUp", "BONDI", "Wollongong", "Ramsgate", "Warwick Farm", "Kingscross",
    "Kiama", "Berry", "Canberra Sat", "Mona Vale", "Manly", "Marrickville", "Haig", "Gosford"
  ];

  const toggleSelect = (zone) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const toggleSelectAll = () => {
    if (selectedZones.length === zones.length) {
      setSelectedZones([]);
    } else {
      setSelectedZones([...zones]);
    }
  };

  const isAllSelected = selectedZones.length === zones.length;

  // Close dropdown when clicking outside
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
        className="w-full px-4 py-2 border rounded-md bg-gray-100 text-left shadow-sm"
      >
        {selectedZones.length === 0
          ? "Select Zones"
          : `${selectedZones.length} zone(s) selected`}
      </button>

      {open && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="px-4 py-2 border-b">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-5 h-5"
              />
              <span>Select All</span>
            </label>
          </div>

          {zones.map((zone) => (
            <div key={zone} className="px-4 py-2 hover:bg-gray-50">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedZones.includes(zone)}
                  onChange={() => toggleSelect(zone)}
                  className="w-5 h-5"
                />
                <span>{zone}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
