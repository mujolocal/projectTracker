console.log("we got this");

let currentProject = null;
let tasks = [];
let updates = [];
let independentTasks = []


async function loadProjects() {
    try {
        // const project_response = await fetch(`${API_BASE}/projects`);
        // const projects = await project_response.json();
        const task_response = await fetch(`${API_BASE}/independenttask`);
        independentTasks = await task_response.json();
        // renderProjects(projects);
        renderIndependentTasksList();
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projects-container').innerHTML = 
            '<div class="empty-state"><h3>Error loading projects</h3><p>Make sure the server is running on port 8000</p></div>';
    }
}

function removeTask(id){
    console.log(`the task to be removed is ${id}`)
    tasks.pop(id)
    rendertasksList();
    
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No projects yet</h3>
                <p>Create your first project to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="projects-grid">
            ${projects.map(project => `
                <div class="project-card">
                    <div class="project-header">
                        <div>
                            <div class="project-title">${project.name}</div>
                            <div class="project-date">Started: ${formatDate(project.date_created)}</div>
                        </div>
                        <span class="status-badge status-${project.completion_status.replace('_', '-')}">
                            ${project.completion_status.replace('_', ' ')}
                        </span>
                    </div>

                    <div class="tasks-section">
                        <div class="section-title">Tasks (${project.tasks.length})</div>
                        ${project.tasks.slice(0, 3).map(task => `
                            <button class="task-item"  onclick="openUpdateForm(${task.id})">
                                <div>
                                    <div>${task.name}</div>
                                    ${task.start_date || task.end_date ? `
                                        <div class="task-dates">
                                            ${task.start_date ? formatDate(task.start_date) : 'Not started'} - 
                                            ${task.end_date ? formatDate(task.end_date) : 'Ongoing'}
                                        </div>
                                    ` : ''}
                                </div>
                                <span class="status-badge status-${task.status.replace('_', '-')}">${task.status.replace('_', ' ')}</span>
                            </button>
                        `).join('')}
                        ${project.tasks.length > 3 ? `<div style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">+${project.tasks.length - 3} more</div>` : ''}
                    </div>

                    <div class="updates-section">
                        <div class="section-title">Recent Updates (${project.updates.length})</div>
                        ${project.updates.slice(0, 2).map(update => `
                            <div class="update-item">
                                <div class="update-date">${formatDate(update.date)}</div>
                                <div>${update.note}</div>
                            </div>
                        `).join('')}
                        ${project.updates.length > 2 ? `<div style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">+${project.updates.length - 2} more</div>` : ''}
                    </div>

                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn small-btn" onclick="editProject(${project.id})">Edit</button>
                        <button class="btn btn-danger small-btn" onclick="deleteProject(${project.id})">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}


function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function openNewProjectModal() {
    currentProject = null;
    tasks = [];
    updates = [];
    document.getElementById('projectModalTitle').textContent = 'New Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectDateCreated').value = new Date().toISOString().split('T')[0];
    rendertasksList();
    // renderUpdatesList();
    document.getElementById('projectModal').style.display = 'block';
}

const orchestrateNewProject=(event)=>{
    event.preventDefault();
    const formData = new FormData(event.target);
    const jsonData = Object.fromEntries(formData.entries());
    jsonData["tasks"] = tasks;
    jsonData["updates"] = updates;
    console.log(jsonData);
    fetch(`${API_BASE}/orchestrateProjects`,{
        method: "POST"
        ,headers:{"Content-Type":"application/json"}
        , body:JSON.stringify(jsonData)
    }).then((r)=>{
        showPopup('success', 'Your project has been created. now go get it done', 'good for you');
        closeProjectModal()
        loadProjects()
    }).catch((e)=>{
        showPopup('error', 'Something failed:', `${e}`);
    })
}


async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`);
        const project = await response.json();
        
        currentProject = project;
        tasks = [...project.tasks];
        updates = [...project.updates];
        
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDateCreated').value = project.date_created;
        document.getElementById('projectStatus').value = project.completion_status;
        
        rendertasksList();
        // renderUpdatesList();
        document.getElementById('projectModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project details');
    }
}

function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}

function createTask(isProjectTask=true) {
    let newTask = {}
    newTask.name = prompt('task name:');
    if (newTask.name) {
        newTask.startDate = prompt('Start date (YYYY-MM-DD, optional):');
        newTask.endDate = prompt('End date (YYYY-MM-DD, optional):');
        newTask.status = prompt('Status (not_started/in_progress/completed):', 'not_started');
        newTask.description = prompt('Description', 'None');
       if(isProjectTask){ 
            tasks.push({
                "name":newTask.name,
                start_date: newTask.startDate || null,
                end_date: newTask.endDate || null,
                status: newTask.status || 'not_started',
                description: newTask.description
                });
                rendertasksList();
        }else{
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
}

function addUpdate() {
    const note = prompt('Update note:');
    if (note) {
        const date = prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        
        updates.push({
            id: Date.now(), // Temporary ID for new updates
            note,
            date: date || new Date().toISOString().split('T')[0]
        });
        // renderUpdatesList();
    }
}

function rendertasksList() {
    const container = document.getElementById('tasksList');
    container.innerHTML = tasks.map((task, index) => `
        <div class="list-item">
            <div>
                <strong>${task.name}</strong>
                <div style="font-size: 0.8rem; color: #6c757d;">
                    ${task.start_date ? formatDate(task.start_date) : 'No start'} - 
                    ${task.end_date ? formatDate(task.end_date) : 'No end'} | 
                    Status: ${task.status.replace('_', ' ')}
                </div>
                <p>
                    ${task.description}
                </p>
            </div>
            <button  class="btn btn-danger small-btn" type="button" onclick="removetask(${index})">Remove</button>
        </div>
    `).join('') || '<div style="text-align: center; color: #6c757d; padding: 1rem;">No tasks added yet</div>';
}


function renderIndependentTasksList() {
    const container = document.getElementById("independent-tasks-container");
    container.innerHTML = independentTasks.map((task, index) => `
        <div  onclick="openUpdateForm('${task.id}')" style="
            background: #fff;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        
        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'; this.style.borderColor='#007bff';" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.1)'; this.style.borderColor='#e1e5e9';">
            
            <div style="display: flex;  justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h4 style="margin: 0; color: #2c3e50; font-size: 1.1rem; font-weight: 600;">
                    ${task.name}
                </h4>
                <span class="status-badge" style="
                    background: ${getStatusColor(task.status)};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-transform: capitalize;
                ">
                    ${task.status.replace('_', ' ')}
                </span>
            </div>
            
            <div style="display: flex; justify-content:space-between; align-items: center; gap: 16px; margin-bottom: 12px; color: #6c757d; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <p>Start Date: </p>
                    <span>${task.start_date ? formatDate(task.start_date) : 'No start'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <p>End Date: </p>
                    <span>${task.end_date ? formatDate(task.end_date) : 'No end'}</span>
                </div>
            </div>
            
            <p style="
                margin: 0;
                color: #495057;
                line-height: 1.4;
                font-size: 0.9rem;
            ">
                ${task.description || 'No description provided'}
            </p>
        </div>
        
    `).join('') || `
        <div style="
            text-align: center;
            color: #6c757d;
            padding: 3rem 1rem;
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            margin: 1rem 0;
        ">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">No tasks added yet</div>
            <div style="font-size: 0.9rem;">Add your first task to get started</div>
        </div>
    `;
}

// Helper function for status colors
function getStatusColor(status) {
    const statusColors = {
        'not_started': '#6c757d',
        'in_progress': '#007bff', 
        'completed': '#28a745',
        'on_hold': '#ffc107',
        'cancelled': '#dc3545'
    };
    return statusColors[status] || '#6c757d';
}

$(document).ready(function() {
    console.log("ready steady");
    loadProjects();
});