export function Note( id=0, body="", created_at="") {
  const container = document.createElement("div");
  container.className = "note";
  Object.assign(container.style, {
    background: "#fff8b3",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e0d890",
    width:'100%',
    fontFamily: "Arial, sans-serif",
    marginBottom:"20px",
  });

  const textarea = document.createElement("textarea");
  
  textarea.rows = 3;
  if(body){
    textarea.textContent = `${created_at}\n ${body}`;
    textarea.id = `note_${id}`;
    textarea.disabled = true;
    container.style.marginBottom = "5px"
    container.style.background = "#e0d890"
  }else{
      textarea.placeholder = "Notes updates Jokes whatever you need...";
      textarea.id ="newNoteId"
      
  }

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
