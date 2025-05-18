import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';

export default function ToteSelector({ orderId, assignedTotes, onAssignedTotesChange}) {
  const selectedTotes = assignedTotes;
  const updateTotes = onAssignedTotesChange;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTotes, setAvailableTotes] = useState([]);
  const token = localStorage.getItem("token");

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const fetchAvailableTotes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/picker/totes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAvailableTotes(data); // assumes { _id, name }
    } catch (error) {
      console.error("Failed to load totes:", error);
    }
  };

  useEffect(() => {
    fetchAvailableTotes();
  }, []);

  const fetchAssignedTotes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/picker/assigned-totes/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json(); // expecting array of { name: string }
      updateTotes(data);
      onAssignedTotesChange?.(data); // notify parent
    } catch (error) {
      console.error("Failed to load assigned totes:", error);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchAssignedTotes();
    }
  }, [orderId]);

  const filteredTotes = availableTotes.filter(
    (tote) =>
      tote.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTotes.some((t) => t._id === tote._id)
  );

  const handleSelect = (tote) => {
    if (!selectedTotes.some((t) => t._id === tote._id)) {
      updateTotes([...selectedTotes, tote]);
      assignToteToOrder(tote._id);
    }
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemove = (toteId) => {
    updateTotes((prev) => prev.filter((t) => t._id !== toteId));
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && searchTerm === "") {
      const lastTote = selectedTotes[selectedTotes.length - 1];
      if (lastTote) {
        removeToteFromOrder(lastTote._id);
        updateTotes((prev) => prev.slice(0, -1));
      }
    }
  };

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
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/picker/assign-tote`,
        { toteId, orderId },
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

  const removeToteFromOrder = async (toteId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/picker/remove-tote`,
        { toteId, orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Remove from selected list
      updateTotes((prev) => prev.filter((t) => t._id !== toteId));
  
      // Refresh available totes
      fetchAvailableTotes(); // Make sure this function is in scope
    } catch (err) {
      console.error("Error removing tote:", err.response?.data || err.message);
    }
  };

  return (
    <div className="mt-6 relative" ref={wrapperRef}>
      <div
        className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 min-h-[48px] bg-white cursor-text shadow"
        onClick={handleInputClick}
      >
        {selectedTotes.map((tote) => (
          <span
            key={tote._id}
            className="flex items-center bg-blue-100 text-blue-900 text-lg px-3 py-1 rounded-2xl font-bold mr-2 mb-2"
          >
            {tote.name}
            <button
              className="ml-2 text-blue-600 hover:text-red-600 text-xl font-bold"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(tote._id);
                removeToteFromOrder(tote._id);
              }}
              aria-label={`Remove ${tote.name}`}
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
          className="flex-1 border-none focus:outline-none py-2 px-2 text-lg min-w-[80px] bg-transparent"
          placeholder="Select Totes…"
        />
      </div>
  
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 mt-1 border border-blue-200 rounded-xl shadow-xl bg-white max-h-52 overflow-y-auto z-20">
          {filteredTotes.length > 0 ? (
            filteredTotes.map((tote) => (
              <div
                key={tote._id}
                className="px-5 py-3 hover:bg-blue-100 cursor-pointer text-lg"
                onClick={() => handleSelect(tote)}
              >
                {tote.name}
              </div>
            ))
          ) : (
            <div className="px-5 py-3 text-gray-500 text-lg">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
