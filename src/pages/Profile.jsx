import React, { useEffect, useState } from 'react';
import Layout from "../layouts/layout";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/getProfile`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(res?.data);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile(); // Call the function on page load
  }, []); // Empty dependency array = run once on mount

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/saveProfile`,
        {
          realName: profile.realName,
          userName: profile.userName,
          role: profile.role,
          active: profile.active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(res.data); // Optionally update local profile state with response
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      alert("Failed to update profile.");
      toast.error(err);
      setEditMode(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user/changePassword`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassword("");
      setShowPasswordForm(false);
      toast.success("Password changed!");
    } catch (err) {
      alert("Failed to change password.");
      toast.error(err);
    }
  };

  return (
    <Layout headerTitle="Profile">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <div className="space-y-4">
                    <div>
                    <label className="block text-gray-700">Name</label>
                    {editMode ? (
                        <input
                        type="text"
                        name="realName"
                        value={profile.realName}
                        onChange={handleChange}
                        className="input input-bordered w-full mt-1 border rounded px-2 py-1"
                        />
                    ) : (
                        <div className="mt-1">{profile.realName}</div>
                    )}
                    </div>
                    <div>
                    <label className="block text-gray-700">Username</label>
                    {editMode ? (
                        <input
                        type="text"
                        name="userName"
                        value={profile.userName}
                        onChange={handleChange}
                        className="input input-bordered w-full mt-1 border rounded px-2 py-1"
                        />
                    ) : (
                        <div className="mt-1">{profile.userName}</div>
                    )}
                    </div>
                    <div>
                    <label className="block text-gray-700">Role</label>
                    {editMode ? (
                        <input
                        type="text"
                        name="role"
                        value={profile.role}
                        onChange={handleChange}
                        className="input input-bordered w-full mt-1 border rounded px-2 py-1"
                        />
                    ) : (
                        <div className="mt-1">{profile.role}</div>
                    )}
                    </div>
                    <div>
                    <label className="block text-gray-700">Active</label>
                    {editMode ? (
                        <input
                        type="checkbox"
                        name="active"
                        checked={profile.active}
                        onChange={handleChange}
                        className="ml-2"
                        />
                    ) : (
                        <span className={`ml-2 px-2 py-1 rounded ${profile.active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {profile.active ? "Active" : "Inactive"}
                        </span>
                    )}
                    </div>
                </div>
                <div className="mt-6 flex gap-2">
                    {editMode ? (
                    <>
                        <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleSave}
                        >
                        Save
                        </button>
                        <button
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => setEditMode(false)}
                        >
                        Cancel
                        </button>
                    </>
                    ) : (
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => setEditMode(true)}
                    >
                        Edit
                    </button>
                    )}
                    <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded ml-auto"
                    onClick={() => setShowPasswordForm((s) => !s)}
                    >
                    Change Password
                    </button>
                </div>
                {showPasswordForm && (
                    <form className="mt-4 space-y-2" onSubmit={handlePasswordChange}>
                    <input
                        type="password"
                        placeholder="New Password"
                        className="input input-bordered w-full border rounded px-2 py-1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Save Password
                    </button>
                    </form>
                )}
            </div>
        </div>
    </Layout>
  );
}