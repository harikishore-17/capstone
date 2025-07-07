import React from "react";

const dummyPatients = [
  {
    id: "P001",
    name: "John Doe",
    condition: "Pneumonia",
    risk: "High",
    assignedTo: "User01",
  },
  {
    id: "P002",
    name: "Jane Smith",
    condition: "Heart Failure",
    risk: "Medium",
    assignedTo: "User02",
  },
];

const AllPatients = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">All Patients</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Patient ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Condition</th>
            <th className="p-2 text-left">Risk</th>
            <th className="p-2 text-left">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {dummyPatients.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.condition}</td>
              <td className="p-2 text-red-600 font-bold">{p.risk}</td>
              <td className="p-2">{p.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllPatients;
