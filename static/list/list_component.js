export const  List=(items = [], title = "", className = "")=> {
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

  // Keep track of current items
  let currentItems = [...items];
  let isCollapsed = false;

  // Header container for title and buttons
  const headerContainer = document.createElement("div");
  Object.assign(headerContainer.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  });

  // Title if provided
  let titleElement;
  if (title) {
    titleElement = document.createElement("h3");
    titleElement.textContent = title;
    Object.assign(titleElement.style, {
      margin: "0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      borderBottom: "2px solid #f0f0f0",
      paddingBottom: "8px",
      flex: "1"
    });
    headerContainer.appendChild(titleElement);
  }

  // Button container (now just for fold button)
  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  });

  // Fold/unfold button
  const foldButton = document.createElement("button");
  foldButton.textContent = "−";
  Object.assign(foldButton.style, {
    padding: "6px 10px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#6c757d",
    background: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "32px"
  });

  foldButton.addEventListener("mouseenter", () => {
    foldButton.style.background = "#e9ecef";
    foldButton.style.borderColor = "#adb5bd";
  });
  foldButton.addEventListener("mouseleave", () => {
    foldButton.style.background = "#f8f9fa";
    foldButton.style.borderColor = "#dee2e6";
  });

  buttonContainer.appendChild(foldButton);
  headerContainer.appendChild(buttonContainer);
  container.appendChild(headerContainer);

  // Add item input
  const addInput = document.createElement("input");
  addInput.type = "text";
  addInput.placeholder = "Type to add an item, then press Enter...";
  Object.assign(addInput.style, {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    marginBottom: "12px",
    outline: "none",
    transition: "border-color 0.2s ease",
    fontFamily: "Arial, sans-serif"
  });

  addInput.addEventListener("focus", () => {
    addInput.style.borderColor = "#007bff";
    addInput.style.boxShadow = "0 0 0 2px rgba(0, 123, 255, 0.25)";
  });

  addInput.addEventListener("blur", () => {
    addInput.style.borderColor = "#dee2e6";
    addInput.style.boxShadow = "none";
  });

  addInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && addInput.value.trim()) {
      
      currentItems.push(addInput.value.trim());
      addInput.value = "";
      renderItems();
      updateEmptyState();
    }
  });

  container.appendChild(addInput);

  // Content container (what gets hidden/shown)
  const contentContainer = document.createElement("div");
  contentContainer.className = "list-content";
  
  // List container
  const listContainer = document.createElement("ul");
  Object.assign(listContainer.style, {
    listStyle: "none",
    padding: "0",
    margin: "0"
  });

  // Function to render items
  function renderItems() {
    listContainer.innerHTML = "";
    
    currentItems.forEach((item, index) => {
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
        transition: "all 0.2s ease",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      });

      const itemText = document.createElement("span");
      itemText.textContent = String(item["name"]);
      listItem.appendChild(itemText);

      // Delete button for each item
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      Object.assign(deleteBtn.style, {
        background: "none",
        border: "none",
        color: "#dc3545",
        fontSize: "16px",
        cursor: "pointer",
        padding: "0",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: "0.7",
        transition: "opacity 0.2s ease"
      });

      deleteBtn.addEventListener("mouseenter", () => {
        deleteBtn.style.opacity = "1";
        deleteBtn.style.background = "#f8d7da";
      });
      deleteBtn.addEventListener("mouseleave", () => {
        deleteBtn.style.opacity = "0.7";
        deleteBtn.style.background = "none";
      });

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentItems.splice(index, 1);
        renderItems();
        updateEmptyState();
      });

      listItem.appendChild(deleteBtn);

      // Hover effects for list item
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
  }

  // Function to update empty state
  function updateEmptyState() {
    const existingEmpty = contentContainer.querySelector(".empty-message");
    if (existingEmpty) {
      existingEmpty.remove();
    }

    if (currentItems.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = "No items in this list";
      Object.assign(emptyMessage.style, {
        textAlign: "center",
        color: "#6c757d",
        fontStyle: "italic",
        padding: "20px",
        fontSize: "14px"
      });
      contentContainer.appendChild(emptyMessage);
      listContainer.style.display = "none";
    } else {
      listContainer.style.display = "block";
      contentContainer.appendChild(listContainer);
    }
  }
const collapseToggle =  () => {
    isCollapsed = !isCollapsed;
    
    if (isCollapsed) {
      contentContainer.style.display = "none";
      addInput.style.display = "none";
      foldButton.textContent = "+";
      foldButton.title = "Expand list";
      if (titleElement) {
        titleElement.style.borderBottom = "none";
        titleElement.style.paddingBottom = "0";
      }
    } else {
      contentContainer.style.display = "block";
      addInput.style.display = "block";
      foldButton.textContent = "−";
      foldButton.title = "Collapse list";
      if (titleElement) {
        titleElement.style.borderBottom = "2px solid #f0f0f0";
        titleElement.style.paddingBottom = "8px";
      }
    }
  }
  // Fold/unfold functionality
  foldButton.addEventListener("click", collapseToggle);

  // Initial render
  renderItems();
  updateEmptyState();
  contentContainer.appendChild(listContainer);
  container.appendChild(contentContainer);
  collapseToggle()
  return container;
}