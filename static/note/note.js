export function Note() {
  const container = document.createElement("div");
  container.className = "note";
  Object.assign(container.style, {
    background: "#fff8b3",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e0d890",
    width:'100%',
    fontFamily: "Arial, sans-serif",
  });

  const textarea = document.createElement("textarea");
  textarea.rows = 6;
  textarea.placeholder = "Write your note here...";
  Object.assign(textarea.style, {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    border: "none",
    background: "transparent",
    outline: "none",
    resize: "none",
  });

  container.appendChild(textarea);
  return container;
}
