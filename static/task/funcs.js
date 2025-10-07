//to prevent circular imports some functions moved:

export const createTaskForm =(updateOrCreate ="update",location="taskUpdateOverlay")=>{
  // outer div
  const updateTaskDiv = document.createElement("div");
  updateTaskDiv.className = "update-task";
  updateTaskDiv.onclick = (event) => event.stopPropagation();

  // header
  const taskHeader = document.createElement("div");
  taskHeader.className = "task-header";

  const closeBtn = document.createElement("button");
  closeBtn.className = "task-close";
  closeBtn.id = "updateFormbutton";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", ()=>{
    closeUpdateForm();

  })