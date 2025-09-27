export function List(items = [], title = "", className = "") {
  const container = document.createElement("div");
  container.className = `list ${className}`;
  
  Object.assign(container.style, {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    width: "100%",
    fontFamily: "Arial, sans-serif",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  });

  // Title if provided
  if (title) {
    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    Object.assign(titleElement.style, {
      margin: "0 0 12px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      borderBottom: "2px solid #f0f0f0",
      paddingBottom: "8px"
    });
    container.appendChild(titleElement);
  }

  // List container
  const listContainer = document.createElement("ul");
  Object.assign(listContainer.style, {
    listStyle: "none",
    padding: "0",
    margin: "0"
  });

  // Add items
  items.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.className = "list-item";
    
    Object.assign(listItem.style, {
      padding: "10px 12px",
      marginBottom: "6px",
      background: "#f8f9fa",
      borderRadius: "6px",
      border: "1px solid #e9ecef",
      fontSize: "14px",
      color: "#495057",
      cursor: "pointer",
      transition: "all 0.2s ease"
    });

    // Handle different item types
    if (typeof item === "string") {
      listItem.textContent = item;
    } else if (typeof item === "object" && item.text) {
      listItem.textContent = item.text;
      if (item.id) listItem.id = item.id;
      if (item.className) listItem.className += ` ${item.className}`;
    } else {
      listItem.textContent = String(item);
    }

    // Hover effects
    listItem.addEventListener("mouseenter", () => {
      Object.assign(listItem.style, {
        background: "#e9ecef",
        borderColor: "#dee2e6",
        transform: "translateX(2px)"
      });
    });

    listItem.addEventListener("mouseleave", () => {
      Object.assign(listItem.style, {
        background: "#f8f9fa",
        borderColor: "#e9ecef",
        transform: "translateX(0)"
      });
    });

    listContainer.appendChild(listItem);
  });

  // Empty state
  if (items.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.textContent = "No items in this list";
    Object.assign(emptyMessage.style, {
      textAlign: "center",
      color: "#6c757d",
      fontStyle: "italic",
      padding: "20px",
      fontSize: "14px"
    });
    container.appendChild(emptyMessage);
  } else {
    container.appendChild(listContainer);
  }

  return container;
}

export const showList=(location)=>{
    const sampleTasks = [
  { text: "Review project proposal", id: "task-1", className: "priority-high" },
  { text: "Update website landing page", id: "task-2", className: "priority-medium" },
  { text: "Schedule team meeting for next week", id: "task-3", className: "priority-low" },
  { text: "Fix navigation bug on mobile", id: "task-4", className: "priority-high" },
  { text: "Write documentation for new API", id: "task-5", className: "priority-medium" },
  { text: "Order office supplies", id: "task-6", className: "priority-low" },
  { text: "Prepare quarterly presentation", id: "task-7", className: "priority-high" },
  { text: "Test payment integration", id: "task-8", className: "priority-medium" },
  { text: "Clean up old database entries", id: "task-9", className: "priority-low" },
  { text: "Plan summer company retreat", id: "task-10", className: "priority-medium" }
];
const devLocation = document.getElementById(location);
devLocation.replaceChildren(List(sampleTasks), "samples", "classsssname");
}

// Usage examples:
/*
// Simple string array
const simpleList = List(["Item 1", "Item 2", "Item 3"], "My Tasks");

// Object array with IDs
const objectList = List([
  { text: "Task 1", id: "task-1" },
  { text: "Task 2", id: "task-2", className: "priority-high" },
  { text: "Task 3", id: "task-3" }
], "Priority Tasks");

// Empty list
const emptyList = List([], "Empty List");

// Append to DOM
document.body.appendChild(simpleList);
*/