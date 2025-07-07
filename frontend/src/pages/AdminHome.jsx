import React from "react";

const AdminHome = () => {
  return (
    <div className="space-y-10">
      {/* Add Task Section */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add Task</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Patient ID"
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Assigned To (User ID)"
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Description"
            className="border rounded p-2 col-span-2"
          />
          <input
            type="date"
            placeholder="Due Date"
            className="border rounded p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded col-span-2 hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Add Assignment Section */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Assign Patient to User</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Patient ID"
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Assign To (User ID)"
            className="border rounded p-2"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded col-span-2 hover:bg-green-700"
          >
            Assign
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminHome;
