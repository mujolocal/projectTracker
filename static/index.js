import {addClick} from './utilities/utilities.js';
import {renderIndependentTasksList, getIndependentTasks} from './task/task.js';
import { createTask, showTask } from './task/task.js';
import { createList, showList } from './list/list.js';
import { createLoginForm } from './authentication/authentication.js';
// let tasks = [];

const loadTasks = async()=> {
    try {
        getIndependentTasks().then(()=>renderIndependentTasksList())
        
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

$(document).ready(function() {
    if (localStorage.getItem('access_token')) {
        loadTasks();
        document.addEventListener('DOMContentLoaded', () => {
        addClick("refreshButton", loadTasks);
        addClick('showTasksButton', loadTasks);
        addClick("newTaskButton", createTask );
        addClick('showListsButton', ()=>{showList("independent-tasks-container")});
        addClick("newListButton", createList );
        })
    }
    createLoginForm();
    
});



