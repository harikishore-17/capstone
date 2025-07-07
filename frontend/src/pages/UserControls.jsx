const UserControls = () => {
  return (
    <div className="space-y-10">
      {/* Add User Section */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            className="border rounded p-2"
          />
          <input
            type="email"
            placeholder="Email"
            className="border rounded p-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded p-2"
          />
          <select className="border rounded p-2">
            <option value="">Select Role</option>
            <option value="nurse">Nurse</option>

            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded col-span-2 hover:bg-blue-700"
          >
            Add User
          </button>
        </form>
      </div>

      {/* Delete User Section */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Delete User</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="User Email or ID"
            className="border rounded p-2"
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded col-span-2 hover:bg-red-700"
          >
            Delete User
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserControls;
