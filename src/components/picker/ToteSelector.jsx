import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';

export default function ToteSelector({orderId}) {
  const [selectedTotes, setSelectedTotes] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTotes, setAvailableTotes] = useState([]);
  const token = localStorage.getItem("token");

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fetch available totes from backend
  useEffect(() => {
    const fetchAvailableTotes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/picker/totes`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setAvailableTotes(data); // assuming { _id, name }
      } catch (error) {
        console.error("Failed to load totes:", error);
      }
    };

    fetchAvailableTotes();
  }, []);

  const filteredTotes = availableTotes.filter(
    (tote) =>
      tote.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTotes.includes(tote.name)
  );

  const handleSelect = (tote) => {
    if (!selectedTotes.includes(tote.name)) {
      setSelectedTotes([...selectedTotes, tote.name]);
      // Update the database when a new tote is selected
      assignToteToOrder(tote._id);
    }
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemove = (tote) => {
    setSelectedTotes(selectedTotes.filter((t) => t !== tote));
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && searchTerm === "") {
      setSelectedTotes((prev) => prev.slice(0, -1));
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const assignToteToOrder = async (toteId) => {
    console.log(toteId);
    console.log(orderId)
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/picker/assign-tote`,
        { toteId, orderId }, // orderId should be available in the component
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Tote assigned successfully.");
    } catch (err) {
      console.error("Error assigning tote:", err.response?.data || err.message);
    }
  };  

  return (
    <div className="max-w-md mx-auto mt-6 relative" ref={wrapperRef}>
      <label className="block mb-2 font-semibold">Select Totes:</label>
      <div
        className="w-full border rounded px-2 py-1 flex flex-wrap items-center gap-1 min-h-[42px] bg-white shadow-sm cursor-text"
        onClick={handleInputClick}
      >
        {selectedTotes.map((tote) => (
          <span
            key={tote}
            className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
          >
            {tote}
            <button
              className="ml-1 text-blue-600 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(tote);
              }}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-none focus:outline-none py-1 px-1 min-w-[60px]"
          placeholder="Search totes..."
        />
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 border mt-1 rounded shadow bg-white max-h-40 overflow-y-auto z-10">
          {filteredTotes.length > 0 ? (
            filteredTotes.map((tote) => (
              <div
                key={tote._id}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(tote)}
              >
                {tote.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
