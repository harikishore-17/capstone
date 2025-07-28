const Sidebar = ({ selected, onSelect }) => {
  const menuItems = [
    { text: "Dashboard", isTextOnly: true },
    { text: "Home", key: "home", icon: "🏠" },
    { text: "Follow ups", key: "followups", icon: "📋" },
    { text: "Prediction", key: "prediction", icon: "🔮" },
  ];

  return (
    <nav className="w-64 bg-white h-full pt-6 shadow-xl border-r border-gray-100">
      <ul className="space-y-1 px-4">
        {menuItems.map((item) =>
          item.isTextOnly ? (
            <li
              key={item.text}
              className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2"
            >
              {item.text}
            </li>
          ) : (
            <li key={item.key}>
              <button
                onClick={() => onSelect(item.key)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  selected === item.key
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
                {selected === item.key && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            </li>
          )
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
