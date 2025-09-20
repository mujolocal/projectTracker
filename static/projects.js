// function renderProjects(projects) {
//     const container = document.getElementById('projects-container');
    
//     if (projects.length === 0) {
//         container.innerHTML = `
//             <div class="empty-state">
//                 <h3>No projects yet</h3>
//                 <p>Create your first project to get started!</p>
//             </div>
//         `;
//         return;
//     }

//     container.innerHTML = `
//         <div class="projects-grid">
//             ${projects.map(project => `
//                 <div class="project-card">
//                     <div class="project-header">
//                         <div>
//                             <div class="project-title">${project.name}</div>
//                             <div class="project-date">Started: ${formatDate(project.date_created)}</div>
//                         </div>
//                         <span class="status-badge status-${project.completion_status.replace('_', '-')}">
//                             ${project.completion_status.replace('_', ' ')}
//                         </span>
//                     </div>

//                     <div class="tasks-section">
//                         <div class="section-title">Tasks (${project.tasks.length})</div>
//                         ${project.tasks.slice(0, 3).map(task => `
//                             <button class="task-item"  onclick="openUpdateForm(${task.id})">
//                                 <div>
//                                     <div>${task.name}</div>
//                                     ${task.start_date || task.end_date ? `
//                                         <div class="task-dates">
//                                             ${task.start_date ? formatDate(task.start_date) : 'Not started'} - 
//                                             ${task.end_date ? formatDate(task.end_date) : 'Ongoing'}
//                                         </div>
//                                     ` : ''}
//                                 </div>
//                                 <span class="status-badge status-${task.status.replace('_', '-')}">${task.status.replace('_', ' ')}</span>
//                             </button>
//                         `).join('')}
//                         ${project.tasks.length > 3 ? `<div style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">+${project.tasks.length - 3} more</div>` : ''}
//                     </div>

//                     <div class="updates-section">
//                         <div class="section-title">Recent Updates (${project.updates.length})</div>
//                         ${project.updates.slice(0, 2).map(update => `
//                             <div class="update-item">
//                                 <div class="update-date">${formatDate(update.date)}</div>
//                                 <div>${update.note}</div>
//                             </div>
//                         `).join('')}
//                         ${project.updates.length > 2 ? `<div style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">+${project.updates.length - 2} more</div>` : ''}
//                     </div>

//                     <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
//                         <button class="btn small-btn" onclick="editProject(${project.id})">Edit</button>
//                         <button class="btn btn-danger small-btn" onclick="deleteProject(${project.id})">Delete</button>
//                     </div>
//                 </div>
//             `).join('')}
//         </div>
//     `;
// }




// function openNewProjectModal() {
//     currentProject = null;
//     tasks = [];
//     updates = [];
//     document.getElementById('projectModalTitle').textContent = 'New Project';
//     document.getElementById('projectForm').reset();
//     document.getElementById('projectDateCreated').value = new Date().toISOString().split('T')[0];
//     rendertasksList();
//     // renderUpdatesList();
//     document.getElementById('projectModal').style.display = 'block';
// }

// const orchestrateNewProject=(event)=>{
//     event.preventDefault();
//     const formData = new FormData(event.target);
//     const jsonData = Object.fromEntries(formData.entries());
//     jsonData["tasks"] = tasks;
//     jsonData["updates"] = updates;
//     console.log(jsonData);
//     fetch(`${API_BASE}/orchestrateProjects`,{
//         method: "POST"
//         ,headers:{"Content-Type":"application/json"}
//         , body:JSON.stringify(jsonData)
//     }).then((r)=>{
//         showPopup('success', 'Your project has been created. now go get it done', 'good for you');
//         closeProjectModal()
//         loadProjects()
//     }).catch((e)=>{
//         showPopup('error', 'Something failed:', `${e}`);
//     })
// }


// async function editProject(projectId) {
//     try {
//         const response = await fetch(`${API_BASE}/projects/${projectId}`);
//         const project = await response.json();
        
//         currentProject = project;
//         tasks = [...project.tasks];
//         updates = [...project.updates];
        
//         document.getElementById('projectModalTitle').textContent = 'Edit Project';
//         document.getElementById('projectName').value = project.name;
//         document.getElementById('projectDateCreated').value = project.date_created;
//         document.getElementById('projectStatus').value = project.completion_status;
        
//         rendertasksList();
//         // renderUpdatesList();
//         document.getElementById('projectModal').style.display = 'block';
//     } catch (error) {
//         console.error('Error loading project:', error);
//         alert('Error loading project details');
//     }
// }

