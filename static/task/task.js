import {getStatusColor} from '../utilities/utilities.js';
import { API_BASE } from '../utilities/constants.js';
import { formatDate, addClick } from '../utilities/utilities.js';
import { showPopup } from '../utilities/popup.js';
import { Note } from '../note/note.js';


let currentRecordId = null;
let independentTasks = []


export const  openTaskUpdateForm=(id)=> {
  
    fetch(`${API_BASE}/task/${id}`)
    .then((response)=> response.json())
    .then((recordData)=>{ 
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
    
}

function closeUpdateForm(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    document.getElementById('taskUpdateOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentRecordId = null;
}

// function removeToast(closeBtn) {
//     const toast = closeBtn.parentElement;
//     toast.style.animation = 'slideOut 0.3s ease forwards';
//     setTimeout(() => {
//         if (toast.parentElement) {
//             toast.parentElement.removeChild(toast);
//         }
//     }, 300);
// }


function updateTask(){
    let task = {
        taskId: document.getElementById('taskId').value,
        status: document.getElementById('recordStatus').value,
        newNote: document.getElementById('newNoteId').value
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



export const getIndependentTasks = async()=>{
    const task_response = await fetch(`${API_BASE}/independenttask`);
    independentTasks = await task_response.json();
}


export const  renderIndependentTasksList=()=> {
    const container = document.getElementById("independent-tasks-container");
    const tasks = independentTasks.map((task, index) => createTaskCard(task));
    container.replaceChildren(...tasks);
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
updateTaskButton.addEventListener('click', updateTask);
addClick("taskUpdateOverlay",closeUpdateForm );
addClick("updateFormXbutton",closeUpdateForm );
addClick("closeUpdateTaskButton",closeUpdateForm );
