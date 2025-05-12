import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';

export default function ToteSelector({ orderId }) {
  const [selectedTotes, setSelectedTotes] = useState([]); // now stores tote objects
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

  useEffect(() => {
    const fetchAssignedTotes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/picker/assigned-totes/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json(); // expecting array of { name: string }
        console.log(data);
        setSelectedTotes(data);
      } catch (error) {
        console.error("Failed to load assigned totes:", error);
      }
    };
  
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
      setSelectedTotes([...selectedTotes, tote]);
      assignToteToOrder(tote._id);
    }
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemove = (toteId) => {
    setSelectedTotes((prev) => prev.filter((t) => t._id !== toteId));
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && searchTerm === "") {
      const lastTote = selectedTotes[selectedTotes.length - 1];
      if (lastTote) {
        removeToteFromOrder(lastTote._id);
        setSelectedTotes((prev) => prev.slice(0, -1));
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
      setSelectedTotes((prev) => prev.filter((t) => t._id !== toteId));
  
      // Refresh available totes
      fetchAvailableTotes(); // Make sure this function is in scope
    } catch (err) {
      console.error("Error removing tote:", err.response?.data || err.message);
    }
  };

  return (
    <div className="mt-4 relative" ref={wrapperRef}>
      <div
        className="w-full border border-gray-300 rounded-md px-2 py-1 flex flex-wrap items-center gap-1 min-h-[42px] bg-white cursor-text"
        onClick={handleInputClick}
      >
        {selectedTotes.map((tote) => (
          <span
            key={tote._id}
            className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
          >
            {tote.name}
            <button
              className="ml-1 text-blue-600 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(tote._id);
                removeToteFromOrder(tote._id);
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
          placeholder="Select Totes"
        />
      </div>

      {isDropdownOpen && (
       <div className="absolute left-0 right-0 bottom-full mb-1 border rounded shadow bg-white max-h-40 overflow-y-auto z-10">
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
