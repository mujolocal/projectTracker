import {getStatusColor} from './utilities.js';
import { API_BASE } from './constants.js';
import { formatDate } from './utilities.js';

let currentRecordId = null;
let independentTasks = []

function openUpdateForm(id) {
    recordData = null;
    fetch(`${API_BASE}/task/${id}`)
    .then((response)=> response.json())
    .then((recordData)=>{ 
        document.getElementById('taskId').value = recordData.id || 1;
        document.getElementById('recordName').value = recordData.name || '';
        document.getElementById('recordDescription').value = recordData.description || '';
        document.getElementById('startDate').value = recordData.start_date || '';
        document.getElementById('endDate').value = recordData.end_date || '';
        document.getElementById('recordStatus').value = recordData.status || 'not_started';
        document.getElementById('updatePopupOverlay').classList.add('show');
        document.body.style.overflow = 'hidden';
    })
    .catch((e)=>{console.log(e)});
    
    
}

function closeUpdateForm(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    document.getElementById('updatePopupOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentRecordId = null;
}

function removeToast(closeBtn) {
    const toast = closeBtn.parentElement;
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}


function updateTask(){
    let task = {
        taskId: document.getElementById('taskId').value,
        status: document.getElementById('recordStatus').value
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