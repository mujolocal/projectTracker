
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


export const getIndependentTasks = async()=>{
    const access_name = localStorage.getItem('access_name'); 
    const access_token = localStorage.getItem('access_token');

    const task_response = await fetch(`${API_BASE}/task`,{method: "GET",
            headers:{
              "Content-Type": "application/json",
              "username": access_name,
              "token": access_token
            }});
    independentTasks = await task_response.json();
}


export const  renderIndependentTasksList=()=> {
    console.log("rendering tasks")
    const container = document.getElementById("independent-tasks-container");
    const tasks = independentTasks.map((task, index) => createTaskCard(task));
    container.replaceChildren(...tasks);
}





const updateTaskButton = document.getElementById('updateTaskButton')
// updateTaskButton.addEventListener('click', updateTask);
addClick("taskUpdateOverlay",closeUpdateForm );
// addClick("updateFormbutton",closeUpdateForm );
// addClick("closeUpdateTaskButton",closeUpdateForm );
