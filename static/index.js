import  {API_BASE} from './utilities/constants.js';
import { showPopup } from './utilities/popup.js';
import {addClick} from './utilities/utilities.js';
import {renderIndependentTasksList, getIndependentTasks} from './task/task.js';

let currentProject = null;
let tasks = [];
// let updates = [];



const loadProjects = async()=> {
    try {
        getIndependentTasks().then(()=>renderIndependentTasksList())
        
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function removeTask(id){
    console.log(`the task to be removed is ${id}`)
    tasks.pop(id)
    rendertasksList();
    
}
function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}


function createTask() {
    let newTask = {}
    newTask.name = prompt('task name:');
    if (newTask.name) {
        newTask.startDate = prompt('Start date (YYYY-MM-DD, optional):');
        newTask.endDate = prompt('End date (YYYY-MM-DD, optional):');
        newTask.status = prompt('Status (not_started/in_progress/completed):', 'not_started');
        newTask.description = prompt('Description', 'None');
        fetch(`${API_BASE}/task`,{
            method: "POST"
            ,headers:{"Content-Type":"application/json"}
            , body:JSON.stringify(newTask)
        }).then((r)=>{
            showPopup('success', 'Your project has been created. now go get it done', 'good for you');
            closeProjectModal()
            loadProjects()
        }).catch((e)=>{
            showPopup('error', 'Something failed:', `${e}`);
        })
    renderIndependentTasksList()   
        
    }
}






$(document).ready(function() {
    loadProjects();
});



document.addEventListener('DOMContentLoaded', () => {
    addClick("refreshButton", loadProjects)
    addClick("newTaskButton", createTask )

})