console.log("we got this");
const API_BASE = 'http://localhost:8000';
let currentProject = null;
let features = [];
let updates = [];

// Load projects on page load
// document.addEventListener('DOMContentLoaded', loadProjects);

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projects-container').innerHTML = 
            '<div class="empty-state"><h3>Error loading projects</h3><p>Make sure the server is running on port 8000</p></div>';
    }
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
                            <div class="project-date">Started: ${formatDate(project.date_started)}</div>
                        </div>
                        <span class="status-badge status-${project.completion_status.replace('_', '-')}">
                            ${project.completion_status.replace('_', ' ')}
                        </span>
                    </div>

                    <div class="features-section">
                        <div class="section-title">Features (${project.features.length})</div>
                        ${project.features.slice(0, 3).map(feature => `
                            <div class="feature-item">
                                <div>
                                    <div>${feature.name}</div>
                                    ${feature.start_date || feature.end_date ? `
                                        <div class="feature-dates">
                                            ${feature.start_date ? formatDate(feature.start_date) : 'Not started'} - 
                                            ${feature.end_date ? formatDate(feature.end_date) : 'Ongoing'}
                                        </div>
                                    ` : ''}
                                </div>
                                <span class="status-badge status-${feature.status.replace('_', '-')}">${feature.status.replace('_', ' ')}</span>
                            </div>
                        `).join('')}
                        ${project.features.length > 3 ? `<div style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">+${project.features.length - 3} more</div>` : ''}
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
    features = [];
    updates = [];
    document.getElementById('projectModalTitle').textContent = 'New Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectDateStarted').value = new Date().toISOString().split('T')[0];
    renderFeaturesList();
    // renderUpdatesList();
    document.getElementById('projectModal').style.display = 'block';
}

const orchestrateNewProject=(event)=>{
    event.preventDefault();
    const formData = new FormData(event.target);
    const jsonData = Object.fromEntries(formData.entries());
    jsonData["features"] = features;
    jsonData["updates"] = updates;
    console.log(jsonData);
    fetch("http://127.0.0.1:8000/orchestrateProjects",{
        method: "POST"
        ,headers:{"Content-Type":"application/json"}
        , body:JSON.stringify(jsonData)
    })
}


async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`);
        const project = await response.json();
        
        currentProject = project;
        features = [...project.features];
        updates = [...project.updates];
        
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDateStarted').value = project.date_started;
        document.getElementById('projectStatus').value = project.completion_status;
        
        renderFeaturesList();
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

function addFeature() {
    const name = prompt('Feature name:');
    if (name) {
        const startDate = prompt('Start date (YYYY-MM-DD, optional):');
        const endDate = prompt('End date (YYYY-MM-DD, optional):');
        const status = prompt('Status (not_started/in_progress/completed):', 'not_started');
        
        features.push({
            id: Date.now(), // Temporary ID for new features
            name,
            start_date: startDate || null,
            end_date: endDate || null,
            status: status || 'not_started'
        });
        renderFeaturesList();
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

function renderFeaturesList() {
    const container = document.getElementById('featuresList');
    container.innerHTML = features.map((feature, index) => `
        <div class="list-item">
            <div>
                <strong>${feature.name}</strong>
                <div style="font-size: 0.8rem; color: #6c757d;">
                    ${feature.start_date ? formatDate(feature.start_date) : 'No start'} - 
                    ${feature.end_date ? formatDate(feature.end_date) : 'No end'} | 
                    Status: ${feature.status.replace('_', ' ')}
                </div>
            </div>
            <button  class="btn btn-danger small-btn" onclick="removeFeature(${index})">Remove</button>
        </div>
    `).join('') || '<div style="text-align: center; color: #6c757d; padding: 1rem;">No features added yet</div>';
}