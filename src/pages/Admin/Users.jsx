import Layout from '../../layouts/layout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserDialog from '../../components/UserDialog';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");
    const [showDialog, setShowDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/user`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res?.data);
            setUsers(res?.data || []);
          } catch (err) {
            console.error('Failed to fetch users:', err);
          }
        };
    
        fetchUsers();
    }, []); 

    const openUserDialog = (item) => {
        setSelectedUser(item);
        setShowDialog(true);
    };

    const handleAddUser  = async ({ userName, realName, role }) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/user`, 
                { 
                    userName   : userName,
                    realName   : realName, 
                    role: role
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res?.data);
          } catch (err) {
            console.error('Failed to add new user:', err);
          }
    };

    const handleDeleteUser = async (id) => {
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_API_URL}/user/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res);
          } catch (err) {
            console.error('Failed to delete user:', err);
          }
    }

    return (
        <Layout headerTitle={"Users"}>
            <div className="flex mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                <div className="w-full bg-white shadow-md rounded-lg">
                {/* Filters and actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b border-gray-400">
                    <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 sm:mb-0">
                        {/* Count Select */}
                        <select className="border border-gray-400 rounded-md px-4 py-2 mb-2 sm:mb-0">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>

                        {/* Search Input */}
                        <input
                        type="text"
                        placeholder="Search User"
                        className="border border-gray-400 rounded-md px-4 py-2 w-full sm:w-48 mb-2 sm:mb-0"
                        />
                    </div>

                    {/* Add New User Button */}
                    <button 
                        onClick={() => openUserDialog(null)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">
                        + Add New User
                    </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-400">
                                    <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Username</th>
                                    <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700">Role</th>
                                    <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Active</th>
                                    <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => ( 
                                    <tr key={user._id} className="border-b border-gray-400">
                                        <td className="px-4 py-6 text-sm">{user.realName}</td>
                                        <td className="px-4 py-6 text-sm hidden sm:table-cell">{user.userName}</td>
                                        <td className="px-4 py-6 text-sm">{user.role}</td>
                                        <td className="px-4 py-6 text-sm hidden sm:table-cell">{user.active ? "Active" : "Disabled"}</td>
                                        <td className="px-4 py-6 text-sm">
                                            <button
                                                onClick={() => openUserDialog(user)} 
                                                className="text-blue-600 hover:underline">
                                                    Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)} 
                                                className="text-red-600 hover:underline ml-4"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center p-4">
                    <span>Showing 0 to 0 of 0 entries</span>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">◀</button>
                        <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">▶</button>
                    </div>
                    </div>
                </div>
            </div>
            {showDialog  && (
                <UserDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    user={selectedUser}
                    onSubmit={handleAddUser}
                />
            )}
        </Layout>
    )
}
