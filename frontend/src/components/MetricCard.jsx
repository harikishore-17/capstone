// components/MetricCard.jsx
import React from "react";

const MetricCard = ({
  icon,
  label,
  value,
  color = "bg-blue-100",
  textColor = "text-blue-800",
}) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm ${color} flex items-center`}>
      <div className="text-3xl mr-4">{icon}</div>
      <div>
        <p className={`text-sm font-medium ${textColor}`}>{label}</p>
        <p className={`text-xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;
