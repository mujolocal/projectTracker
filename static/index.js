import {addClick} from './utilities/utilities.js';
import {renderIndependentTasksList, getIndependentTasks} from './task/task.js';
import { createTask } from './task/task.js';
import { showList } from './list/list.js';
// let tasks = [];

const loadTasks = async()=> {
    try {
        getIndependentTasks().then(()=>renderIndependentTasksList())
        
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

$(document).ready(function() {
    loadTasks();
});

document.addEventListener('DOMContentLoaded', () => {
    addClick("refreshButton", loadTasks);
    addClick("taskButton", createTask );
    addClick('listButton', ()=>showList("independent-tasks-container"));

})

