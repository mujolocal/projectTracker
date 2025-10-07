
import { API_BASE } from '../utilities/constants.js';
import { formatDate, addClick } from '../utilities/utilities.js';
import { showPopup } from '../utilities/popup.js';
import { Note } from '../note/note.js';
import { createTaskForm } from './taskForm.js';
import { createTaskCard } from './taskCard.js';
import { createTask as ct} from './taskForm.js';

export const createTask = ct;
let currentRecordId = null;
let independentTasks = [];
let taskName = "";

export const showTask =()=>{

  console.log("show task");
}

export const  openTaskForm=( id)=> {
    createTaskForm()
    const updateTaskButton =   document.getElementById("updateTaskButton");
    updateTaskButton.textContent = "Create Task";
    // updateTaskButton.removeEventListener("click",updateTask)
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

function closeUpdateForm(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    document.getElementById('taskUpdateOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentRecordId = null;
    resetTaskButton();
}

// function createFullTask(){
//     let task = {
//         name: document.getElementById("recordName").value,
//         startDate: document.getElementById("startDate").value,
//         endDate: document.getElementById("endDate").value,
//         description: document.getElementById("recordDescription").value,
//         status: document.getElementById('recordStatus').value,
//         recurranceType: document.getElementById('recurranceType').value
//     };
//     fetch(`${API_BASE}/task`,{
//         method: "POST"
//         ,headers:{"Content-Type":"application/json"}
//         , body:JSON.stringify(task)
//     }).then((r)=>{
//         if(!r.ok){
//             throw new Error("failed to update")
//         }
//         showPopup('success', 'yay you updated the status of this thing', 'good for you');
//         closeUpdateForm();

//     }).catch((e)=>{
//         showPopup('error', 'Something failed:', `${e}`);
//     }).finally(()=>{
//       // resetTaskButton()
//     })
// }

// const resetTaskButton=()=>{
//   const updateTaskButton =   document.getElementById("updateTaskButton");
//       updateTaskButton.textContent = "Update Task";
//       updateTaskButton.removeEventListener("click",createFullTask)
//       updateTaskButton.addEventListener("click", updateTask);
// }

export const getIndependentTasks = async()=>{
    const task_response = await fetch(`${API_BASE}/task`);
    independentTasks = await task_response.json();
}


export const  renderIndependentTasksList=()=> {
    const container = document.getElementById("independent-tasks-container");
    const tasks = independentTasks.map((task, index) => createTaskCard(task));
    container.replaceChildren(...tasks);
}





const updateTaskButton = document.getElementById('updateTaskButton')
// updateTaskButton.addEventListener('click', updateTask);
addClick("taskUpdateOverlay",closeUpdateForm );
// addClick("updateFormbutton",closeUpdateForm );
// addClick("closeUpdateTaskButton",closeUpdateForm );
