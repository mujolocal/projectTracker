import {getStatusColor} from '../utilities/utilities.js';
import { API_BASE } from '../utilities/constants.js';
import { formatDate, addClick } from '../utilities/utilities.js';
import { showPopup } from '../utilities/popup.js';
import { Note } from '../note/note.js';


let currentRecordId = null;
let independentTasks = [];
let taskName = "";

export const showTask =()=>{

  console.log("show task");
}

export const  openTaskUpdateForm=( id)=> {
  if(id){  
    fetch(`${API_BASE}/task/${id}`)
    .then((response)=> response.json())
    .then((recordData)=>{ 
      document.getElementById('recurranceType').value = ""
      document.getElementById('recurringSection').style.display = "none";
      const newNote = Note();
      const oldNotes = recordData.notes.map(_note => Note(_note.id, _note.body, _note.created_at))
      document.getElementById('taskId').value = recordData.id || 1;
      document.getElementById('recordName').value = recordData.name || '';
      document.getElementById('recordDescription').value = recordData.description || '';
      document.getElementById('startDate').value = recordData.start_date || '';
      document.getElementById('endDate').value = recordData.end_date || '';
      document.getElementById('recordStatus').value = recordData.status || 'not_started';
      document.getElementById("newNote").replaceChildren(newNote);
      document.getElementById("notesSection").replaceChildren(...oldNotes);
      document.getElementById('taskUpdateOverlay').classList.add('show');
      document.body.style.overflow = 'hidden';
    })
    .catch((e)=>{console.log(e)});
  }else{
      const updateTaskButton =   document.getElementById("updateTaskButton");
      updateTaskButton.textContent = "Create Task";
      updateTaskButton.removeEventListener("click",updateTask)
      updateTaskButton.addEventListener("click", createFullTask);
      const newNote = Note();
      document.getElementById('taskId').value = "";
      document.getElementById('recordName').value = taskName;
      document.getElementById('recordDescription').value =  '';
      document.getElementById('startDate').value =  '';
      document.getElementById('endDate').value =  '';
      document.getElementById('recordStatus').value =  'not_started';
      document.getElementById("newNote").replaceChildren();
      document.getElementById('recurringSection').style.display = "block";
      document.getElementById('taskUpdateOverlay').classList.add('show');
      document.body.style.overflow = 'hidden';
  }
    
}

function closeUpdateForm(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    document.getElementById('taskUpdateOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentRecordId = null;
    resetTaskButton();
}

const createTaskForm =(location="taskUpdateOverlay")=>{
  // outer div
  const updateTaskDiv = document.createElement("div");
  updateTaskDiv.className = "update-task";
  updateTaskDiv.onclick = (event) => event.stopPropagation();

  // header
  const taskHeader = document.createElement("div");
  taskHeader.className = "task-header";

  const closeBtn = document.createElement("button");
  closeBtn.className = "task-close";
  closeBtn.id = "updateFormXbutton";
  closeBtn.innerHTML = "&times;";

  const taskTitle = document.createElement("h3");
  taskTitle.className = "task-title";
  taskTitle.textContent = "Update Task";

  taskHeader.appendChild(closeBtn);
  taskHeader.appendChild(taskTitle);
  updateTaskDiv.appendChild(taskHeader);

  // form container
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";

  // form
  const form = document.createElement("form");
  form.id = "updateForm";

  // hidden input
  const taskId = document.createElement("input");
  taskId.type = "hidden";
  taskId.id = "taskId";
  taskId.name = "id";
  form.appendChild(taskId);

  // Name
  const nameGroup = document.createElement("div");
  nameGroup.className = "form-group full-width";
  const nameLabel = document.createElement("label");
  nameLabel.className = "form-label required";
  nameLabel.htmlFor = "recordName";
  nameLabel.textContent = "Name";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = "recordName";
  nameInput.name = "name";
  nameInput.className = "form-input";
  nameInput.required = true;
  nameInput.maxLength = 255;
  nameInput.readOnly = true;
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);

  // Description
  const descGroup = document.createElement("div");
  descGroup.className = "form-group full-width";
  const descLabel = document.createElement("label");
  descLabel.className = "form-label";
  descLabel.htmlFor = "recordDescription";
  descLabel.textContent = "Description";
  const descInput = document.createElement("textarea");
  descInput.id = "recordDescription";
  descInput.name = "description";
  descInput.className = "form-textarea";
  descInput.placeholder = "Enter task description...";
  descGroup.appendChild(descLabel);
  descGroup.appendChild(descInput);
  form.appendChild(descGroup);

  // Start Date
  const startGroup = document.createElement("div");
  startGroup.className = "form-group";
  const startLabel = document.createElement("label");
  startLabel.className = "form-label";
  startLabel.htmlFor = "startDate";
  startLabel.textContent = "Start Date";
  const startInput = document.createElement("input");
  startInput.type = "date";
  startInput.id = "startDate";
  startInput.name = "start_date";
  startInput.className = "form-input";
  startGroup.appendChild(startLabel);
  startGroup.appendChild(startInput);
  form.appendChild(startGroup);

  // End Date
  const endGroup = document.createElement("div");
  endGroup.className = "form-group";
  const endLabel = document.createElement("label");
  endLabel.className = "form-label";
  endLabel.htmlFor = "endDate";
  endLabel.textContent = "End Date";
  const endInput = document.createElement("input");
  endInput.type = "date";
  endInput.id = "endDate";
  endInput.name = "end_date";
  endInput.className = "form-input";
  endGroup.appendChild(endLabel);
  endGroup.appendChild(endInput);
  form.appendChild(endGroup);

  // Recurring Section
  const recurringSection = document.createElement("div");
  recurringSection.className = "form-group-row full-width";
  recurringSection.style.display = "none";
  recurringSection.id = "recurringSection";
  const recurringInner = document.createElement("div");
  recurringInner.style.display = "flex";
  recurringInner.style.flexDirection = "column";
  const recurringLabel = document.createElement("label");
  recurringLabel.className = "form-label";
  recurringLabel.htmlFor = "recurrance";
  recurringLabel.textContent = "Recurrance:";
  const recurringSelect = document.createElement("select");
  recurringSelect.id = "recurranceType";
  recurringSelect.name = "recurranceType";
  recurringSelect.className = "form-select";
  const optNone = document.createElement("option");
  optNone.value = "";
  optNone.selected = true;
  optNone.textContent = "None";
  const optDaily = document.createElement("option");
  optDaily.value = "daily";
  optDaily.textContent = "Daily";
  recurringSelect.appendChild(optNone);
  recurringSelect.appendChild(optDaily);
  recurringInner.appendChild(recurringLabel);
  recurringInner.appendChild(recurringSelect);
  recurringSection.appendChild(recurringInner);
  form.appendChild(recurringSection);

  // Status
  const statusGroup = document.createElement("div");
  statusGroup.className = "form-group full-width";
  const statusLabel = document.createElement("label");
  statusLabel.className = "form-label";
  statusLabel.htmlFor = "recordStatus";
  statusLabel.textContent = "Status";
  const statusSelect = document.createElement("select");
  statusSelect.id = "recordStatus";
  statusSelect.name = "status";
  statusSelect.className = "form-select";
  [
    { value: "not_started", text: "Not Started" },
    { value: "in_progress", text: "In Progress" },
    { value: "completed", text: "Completed" },
    { value: "on_hold", text: "On Hold" },
    { value: "cancelled", text: "Canceled" },
    { value: "failed", text: "Failed" }
  ].forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    statusSelect.appendChild(option);
  });
  statusGroup.appendChild(statusLabel);
  statusGroup.appendChild(statusSelect);
  form.appendChild(statusGroup);

  // newNote + notesSection
  const newNote = document.createElement("div");
  newNote.id = "newNote";
  form.appendChild(newNote);

  const notesSection = document.createElement("div");
  notesSection.id = "notesSection";
  form.appendChild(notesSection);

  // put form inside container
  formContainer.appendChild(form);
  updateTaskDiv.appendChild(formContainer);

  // form actions
  const formActions = document.createElement("div");
  formActions.className = "form-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.id = "closeUpdateTaskButton";
  cancelBtn.className = "btn btn-danger";
  const cancelSpinner = document.createElement("span");
  cancelSpinner.className = "loading-spinner";
  cancelSpinner.id = "deleteSpinner";
  cancelBtn.appendChild(cancelSpinner);
  cancelBtn.appendChild(document.createTextNode(" Cancel"));

  const updateBtn = document.createElement("button");
  updateBtn.type = "button";
  updateBtn.id = "updateTaskButton";
  updateBtn.className = "btn btn-primary";
  const updateSpinner = document.createElement("span");
  updateSpinner.className = "loading-spinner";
  updateSpinner.id = "updateSpinner";
  updateBtn.appendChild(updateSpinner);
  updateBtn.appendChild(document.createTextNode(" Update Task"));

  formActions.appendChild(cancelBtn);
  formActions.appendChild(updateBtn);

  updateTaskDiv.appendChild(formActions);
  document.getElementById("location").replaceChildren(updateTaskDiv);
}

function updateTask(){
    createTaskForm();
    let task = {
        taskId: document.getElementById('taskId').value,
        status: document.getElementById('recordStatus').value,
        newNote: document.getElementById('newNoteId').value,
        description: document.getElementById("recordDescription").value,
    };
    fetch(`${API_BASE}/task`,{
        method: "PUT"
        ,headers:{"Content-Type":"application/json"}
        , body:JSON.stringify(task)
    }).then((r)=>{
        if(!r.ok){
            throw new Error("failed to update")
        }
        showPopup('success', 'yay you updated the status of this thing', 'good for you');
        closeUpdateForm();

    }).catch((e)=>{
        showPopup('error', 'Something failed:', `${e}`);
    })
}


function createFullTask(){
    let task = {
        name: document.getElementById("recordName").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        description: document.getElementById("recordDescription").value,
        status: document.getElementById('recordStatus').value,
        recurranceType: document.getElementById('recurranceType').value
    };
    fetch(`${API_BASE}/task`,{
        method: "POST"
        ,headers:{"Content-Type":"application/json"}
        , body:JSON.stringify(task)
    }).then((r)=>{
        if(!r.ok){
            throw new Error("failed to update")
        }
        showPopup('success', 'yay you updated the status of this thing', 'good for you');
        closeUpdateForm();

    }).catch((e)=>{
        showPopup('error', 'Something failed:', `${e}`);
    }).finally(()=>{
      resetTaskButton()
    })
}

const resetTaskButton=()=>{
  const updateTaskButton =   document.getElementById("updateTaskButton");
      updateTaskButton.textContent = "Update Task";
      updateTaskButton.removeEventListener("click",createFullTask)
      updateTaskButton.addEventListener("click", updateTask);
}

export const getIndependentTasks = async()=>{
    const task_response = await fetch(`${API_BASE}/task`);
    independentTasks = await task_response.json();
}


export const  renderIndependentTasksList=()=> {
    const container = document.getElementById("independent-tasks-container");
    const tasks = independentTasks.map((task, index) => createTaskCard(task));
    container.replaceChildren(...tasks);
}
export function createTask() {
    let newTask = {}
    newTask.name = prompt('task name:');
    newTask.recurring = prompt('Is task recurring or would you like to add details (leave blank for no) :');
    //if new task name but not recurring just make the task
    //if new task recurring then open the task box

    if (newTask.name && newTask.recurring) {
      taskName = newTask.name;
      openTaskUpdateForm();
    }else if(newTask.name){
        fetch(`${API_BASE}/task`,{
            method: "POST"
            ,headers:{"Content-Type":"application/json"}
            , body:JSON.stringify(newTask)
        }).then((r)=>{
            showPopup('success', 'Your Task has been created', 'now you should probably start it!');
            // getIndependentTasks().then(()=>renderIndependentTasksList())
        }).catch((e)=>{
            showPopup('error', 'Something failed:', `${e}`);
        })
    // renderIndependentTasksList()   
        
    }
}


const  createTaskCard=(task)=> {
  const div = document.createElement("div");

  // parent styles
  Object.assign(div.style, {
    background: "#fff",
    border: "1px solid #e1e5e9",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  });

  // hover effects
  div.addEventListener("mouseover", () => {
    div.style.transform = "translateY(-1px)";
    div.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    div.style.borderColor = "#007bff";
  });
  div.addEventListener("mouseout", () => {
    div.style.transform = "translateY(0)";
    div.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
    div.style.borderColor = "#e1e5e9";
  });
  div.addEventListener('click', ()=>{
    openTaskUpdateForm(task.id)
  })

  // -------- HEADER ROW --------
  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  });

  const title = document.createElement("h4");
  title.textContent = task.name;
  Object.assign(title.style, {
    margin: "0",
    color: "#2c3e50",
    fontSize: "1.1rem",
    fontWeight: "600",
  });

  const status = document.createElement("span");
  status.textContent = task.status.replace("_", " ");
  status.className = "status-badge";
  Object.assign(status.style, {
    background: getStatusColor(task.status),
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "500",
    textTransform: "capitalize",
  });

  header.appendChild(title);
  header.appendChild(status);

  // -------- DATES ROW --------
  const dates = document.createElement("div");
  Object.assign(dates.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
    color: "#6c757d",
    fontSize: "0.85rem",
  });

  const start = document.createElement("div");
  Object.assign(start.style, { display: "flex", alignItems: "center", gap: "4px" });
  start.innerHTML = `<p>Start Date: </p><span>${task.start_date ? formatDate(task.start_date) : "No start"}</span>`;

  const end = document.createElement("div");
  Object.assign(end.style, { display: "flex", alignItems: "center", gap: "4px" });
  end.innerHTML = `<p>End Date: </p><span>${task.end_date ? formatDate(task.end_date) : "No end"}</span>`;

  dates.appendChild(start);
  dates.appendChild(end);

  // -------- DESCRIPTION --------
  const desc = document.createElement("p");
  desc.textContent = task.description || "No description provided";
  Object.assign(desc.style, {
    margin: "0",
    color: "#495057",
    lineHeight: "1.4",
    fontSize: "0.9rem",
  });


  // append everything to main card
  div.appendChild(header);
  div.appendChild(dates);
  div.appendChild(desc);

  return div;
}

const updateTaskButton = document.getElementById('updateTaskButton')
// updateTaskButton.addEventListener('click', updateTask);
// addClick("taskUpdateOverlay",closeUpdateForm );
// addClick("updateFormXbutton",closeUpdateForm );
// addClick("closeUpdateTaskButton",closeUpdateForm );
