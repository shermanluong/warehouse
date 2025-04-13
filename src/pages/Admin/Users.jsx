import Layout from '../../layouts/layout';

export default function UsersPage() {
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
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">
                + Add New User
            </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="border-b border-gray-400">
                            <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700">Username</th>
                            <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700">Role</th>
                            <th className="px-4 py-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Example Rows */}
                        <tr className="border-b border-gray-400">
                            <td className="px-4 py-6 text-sm">John Doe</td>
                            <td className="px-4 py-6 text-sm">Admin</td>
                            <td className="px-4 py-6 text-sm">
                                <button className="text-blue-600 hover:underline">Edit</button>
                                <button className="text-red-600 hover:underline ml-4">Delete</button>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-400">
                            <td className="px-4 py-6 text-sm">Jane Smith</td>
                            <td className="px-4 py-6 text-sm">Picker</td>
                            <td className="px-4 py-6 text-sm">
                            <button className="text-blue-600 hover:underline">Edit</button>
                            <button className="text-red-600 hover:underline ml-4">Delete</button>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-400">
                            <td className="px-4 py-6 text-sm">Jane Smith</td>
                            <td className="px-4 py-6 text-sm">Packer</td>
                            <td className="px-4 py-6 text-sm">
                            <button className="text-blue-600 hover:underline">Edit</button>
                            <button className="text-red-600 hover:underline ml-4">Delete</button>
                            </td>
                        </tr>
                        {/* Add more rows here */}
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
    </Layout>
  )
}
