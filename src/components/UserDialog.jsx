import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';

const UserDialog = ({ isOpen, onClose, user, onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [userName, setUserName] = useState('');
  const [realName, setRealName] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form fields when user prop changes
  useEffect(() => {
    console.log(user);
    if (user) {
      setUserName(user.userName || '');
      setRealName(user.realName || '');
      setSelectedRole(user.role || '');
    } else {
      // Reset form when creating a new user
      setUserName('');
      setRealName('');
      setSelectedRole('');
    }
    setErrors({});
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!userName.trim()) {
      newErrors.userName = 'Username is required';
    }
    
    if (!realName.trim()) {
      newErrors.realName = 'Name is required';
    }
    
    if (!selectedRole) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      userName: userName.trim(),
      realName: realName.trim(),
      role: selectedRole
    });
    onClose();
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    // Clear error when user selects a role
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    // Clear error when user types in the field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Blurred Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all" aria-hidden="true" />
      {/* Centered Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-gray-100">
          {/* Title */}
          <Dialog.Title className="text-xl font-semibold mb-6 text-center text-gray-800">
            {user ? "Edit User" : "Add User"}
          </Dialog.Title>
          
          {/* Form */}
          <form
            className="space-y-5"
            onSubmit={e => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            <div>
              <input
                type="text"
                placeholder="Username"
                className={`border rounded-md p-3 w-full focus:ring-2 focus:ring-blue-400 transition ${errors.userName ? 'border-red-500' : 'border-gray-300'}`}
                value={userName}
                onChange={handleInputChange(setUserName, 'userName')}
                autoFocus
              />
              {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className={`border rounded-md p-3 w-full focus:ring-2 focus:ring-blue-400 transition ${errors.realName ? 'border-red-500' : 'border-gray-300'}`}
                value={realName}
                onChange={handleInputChange(setRealName, 'realName')}
              />
              {errors.realName && <p className="text-red-500 text-xs mt-1">{errors.realName}</p>}
            </div>
            
            <div>
              <select 
                onChange={handleRoleChange}
                value={selectedRole}
                className={`border rounded-md px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 transition ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a role</option>
                <option value="picker">Picker</option>
                <option value="packer">Packer</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          
            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!userName.trim() || !realName.trim() || !selectedRole}
                className={`px-5 py-2 text-sm rounded text-white transition 
                  ${(!userName.trim() || !realName.trim() || !selectedRole) 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Confirm
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default UserDialog;