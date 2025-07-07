const Sidebar = ({ selected, onSelect }) => {
  const menuItems = [
    { text: "Dashboard", isTextOnly: true },
    { text: "Home", key: "home" },
    { text: "Follow ups", key: "followups" },
    { text: "Prediction", key: "prediction" },
  ];

  return (
    <nav
      style={{
        width: 220,
        backgroundColor: "#f8f9fa",
        height: "calc(100vh - 70px)",
        paddingTop: 25,
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        userSelect: "none",
      }}
    >
      <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
        {menuItems.map((item) =>
          item.isTextOnly ? (
            <li
              key={item.text}
              style={{
                padding: "15px 30px",
                fontWeight: "700",
                fontSize: 18,
                color: "#6c757d",
                borderBottom: "1px solid #dee2e6",
                cursor: "default",
              }}
            >
              {item.text}
            </li>
          ) : (
            <li
              key={item.key}
              onClick={() => onSelect(item.key)}
              style={{
                padding: "12px 30px",
                cursor: "pointer",
                backgroundColor:
                  selected === item.key ? "#007bff" : "transparent",
                color: selected === item.key ? "white" : "#343a40",
                fontWeight: selected === item.key ? "600" : "normal",
                transition: "background-color 0.25s",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                if (selected !== item.key)
                  e.currentTarget.style.backgroundColor = "#e9ecef";
              }}
              onMouseLeave={(e) => {
                if (selected !== item.key)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {item.text}
            </li>
          )
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
