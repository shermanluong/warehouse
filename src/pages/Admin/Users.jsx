import Layout from '../../layouts/layout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserDialog from '../../components/admin/UserDialog';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination and search state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let userData = res?.data || [];
        setTotalCount(userData.length);

        // Filter by search text
        if (searchText) {
          userData = userData.filter(
            (u) =>
              (u.realName && u.realName.toLowerCase().includes(searchText.toLowerCase())) ||
              (u.userName && u.userName.toLowerCase().includes(searchText.toLowerCase()))
          );
        }

        setTotalCount(userData.length);

        // Pagination
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setUsers(userData.slice(start, end));
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
    // eslint-disable-next-line
  }, [pageSize, currentPage, searchText, showDialog]);

  const openUserDialog = (item) => {
    setSelectedUser(item);
    setShowDialog(true);
  };

  const handleAddUser = async ({ userName, realName, role }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user`,
        {
          userName: userName,
          realName: realName,
          role: role
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDialog(false);
    } catch (err) {
      console.error('Failed to add new user:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/user/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.filter((user) => user._id !== id));
      setTotalCount((prev) => prev - 1);
      setConfirmDeleteUserId(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setConfirmDeleteUserId(null);
    }
  };

  // Handle page changes
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
    // eslint-disable-next-line
  }, [totalPages]);

  return (
    <Layout headerTitle={"Users"}>
      <div className="flex mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="w-full bg-white shadow-md rounded-lg">
          {/* Filters and actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 sm:mb-0">
              {/* Count Select */}
              <select
                className="border border-gray-300 rounded-md px-4 py-2 mb-2 sm:mb-0"
                value={pageSize}
                onChange={e => {
                  setCurrentPage(1);
                  setPageSize(Number(e.target.value));
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search User"
                className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-48 mb-2 sm:mb-0"
                value={searchText}
                onChange={e => {
                  setCurrentPage(1);
                  setSearchText(e.target.value);
                }}
              />
            </div>
            {/* Add New User Button */}
            <button
              onClick={() => openUserDialog(null)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto"
            >
              + Add New User
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Username</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Active</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(user => (
                  <tr key={user._id} className="border-b border-gray-100">
                    <td className="px-4 py-4 text-sm">{user.realName}</td>
                    <td className="px-4 py-4 text-sm hidden sm:table-cell">{user.userName}</td>
                    <td className="px-4 py-4 text-sm">{user.role}</td>
                    <td className="px-4 py-4 text-sm hidden sm:table-cell">{user.active ? "Active" : "Disabled"}</td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() => openUserDialog(user)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteUserId(user._id)}
                        className="text-red-600 hover:underline ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-100">
            <span>
              Showing {users.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} to {users.length > 0 ? ((currentPage - 1) * pageSize + users.length) : 0} of {totalCount} entries
            </span>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ◀
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDialog && (
        <UserDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          user={selectedUser}
          onSubmit={handleAddUser}
        />
      )}

      {/* Confirmation Dialog with BLUR background */}
      {confirmDeleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-[320px]">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this user?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setConfirmDeleteUserId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                onClick={() => handleDeleteUser(confirmDeleteUserId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}