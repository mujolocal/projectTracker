if(typeof API_BASE == "undefined"){
    console.log("api base not loaded")
}
let currentRecordId = null;

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

// Close update form
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

// Close popup on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeUpdateForm();
    }
});

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