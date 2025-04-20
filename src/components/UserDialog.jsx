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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4">
            {user ? "Edit User" : "Add User"}
          </Dialog.Title>
          
          <div className='flex flex-col'>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                className={`border rounded-md p-2 w-full ${errors.userName ? 'border-red-500' : ''}`}
                value={userName}
                onChange={handleInputChange(setUserName, 'userName')}
              />
              {errors.userName && <p className="text-red-500 text-sm mt-1">{errors.userName}</p>}
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                className={`border rounded-md p-2 w-full ${errors.realName ? 'border-red-500' : ''}`}
                value={realName}
                onChange={handleInputChange(setRealName, 'realName')}
              />
              {errors.realName && <p className="text-red-500 text-sm mt-1">{errors.realName}</p>}
            </div>
            
            <div className="mb-4">
              <select 
                onChange={handleRoleChange}
                value={selectedRole}
                className={`border rounded-md px-4 py-2 w-full ${errors.role ? 'border-red-500' : 'border-gray-400'}`}
              >
                <option value="">Select a role</option>
                <option value="picker">Picker</option>
                <option value="packer">Packer</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!userName.trim() || !realName.trim() || !selectedRole}
              className={`px-4 py-2 text-sm text-white rounded ${
                (!userName.trim() || !realName.trim() || !selectedRole) 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default UserDialog;