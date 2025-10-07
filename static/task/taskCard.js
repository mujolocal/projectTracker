import {getStatusColor} from '../utilities/utilities.js';
import { createTaskForm } from './taskForm.js';
import { API_BASE } from '../utilities/constants.js';
import { Note } from '../note/note.js';

export const  openTaskUpdateForm=( id)=> {
    createTaskForm()
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
    }
}



export const  createTaskCard=(task)=> {
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