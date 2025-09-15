if(typeof API_BASE == "undefined"){
    console.log("api base not loaded")
}
let currentRecordId = null;

        // Open update form with existing data
function openUpdateForm(id) {
    // currentRecordId = recordData.id;
    // id INTEGER PRIMARY KEY AUTOINCREMENT,
    // project_id INTEGER,
    // name TEXT NOT NULL,
    // description TEXT,
    // start_date TEXT,
    // end_date TEXT,
    // status TEXT DEFAULT 'not_started',
    // occurances_id INTEGER
    // Populate form fields
    recordData = null;
    fetch(`${API_BASE}/task/${id}`)
    .then((response)=> response.json())
    .then((recordData)=>{ 
        console.log(recordData)
        document.getElementById('recordId').value = recordData.id || 1;
        document.getElementById('projectId').value = recordData.project_id || '';
        document.getElementById('recordName').value = recordData.name || '';
        document.getElementById('recordDescription').value = recordData.description || '';
        document.getElementById('startDate').value = recordData.start_date || '';
        document.getElementById('endDate').value = recordData.end_date || '';
        document.getElementById('recordStatus').value = recordData.status || 'not_started';
        document.getElementById('occurancesId').value = recordData.occurances_id || '';
        document.getElementById('updatePopupOverlay').classList.add('show');
        document.body.style.overflow = 'hidden';
    })
    .catch((e)=>{console.log(e)});
    
    
    // Show popup
    
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

// Handle form submission
document.getElementById('updateForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading spinner
    const spinner = document.getElementById('updateSpinner');
    spinner.style.display = 'inline-block';
    
    // Get form data
    const formData = new FormData(this);
    const recordData = Object.fromEntries(formData.entries());
    
    // Convert empty strings to null for optional fields
    ['description', 'start_date', 'end_date', 'occurances_id'].forEach(field => {
        if (recordData[field] === '') {
            recordData[field] = null;
        }
    });
    
    // Convert numeric fields
    recordData.id = parseInt(recordData.id);
    recordData.project_id = parseInt(recordData.project_id);
    if (recordData.occurances_id) {
        recordData.occurances_id = parseInt(recordData.occurances_id);
    }
    
    console.log('Updating record:', recordData);
    
    try {
        // Simulate API call
        await simulateUpdateAPI(recordData);
        
        showToast('success', 'Record updated successfully!');
        closeUpdateForm();
        
        // Optionally refresh the page or update the UI
        setTimeout(() => {
            // You could refresh specific elements here
            // location.reload(); // or update specific parts of the page
        }, 1000);
        
    } catch (error) {
        showToast('error', 'Failed to update record: ' + error.message);
    } finally {
        spinner.style.display = 'none';
    }
});

// Delete record
async function deleteRecord() {
    if (!currentRecordId) return;
    
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        return;
    }
    
    const spinner = document.getElementById('deleteSpinner');
    spinner.style.display = 'inline-block';
    
    try {
        await simulateDeleteAPI(currentRecordId);
        showToast('success', 'Record deleted successfully!');
        closeUpdateForm();
        
        // Optionally refresh the page or remove the element
        setTimeout(() => {
            // location.reload(); // or remove specific elements
        }, 1000);
        
    } catch (error) {
        showToast('error', 'Failed to delete record: ' + error.message);
    } finally {
        spinner.style.display = 'none';
    }
}

// Simulate API calls (replace with your actual API calls)
async function simulateUpdateAPI(data) {
    // Replace this with your actual API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success/failure
            if (Math.random() > 0.1) { // 90% success rate for demo
                resolve({ success: true, data: data });
            } else {
                reject(new Error('Network error'));
            }
        }, 1500);
    });
}

async function simulateDeleteAPI(id) {
    // Replace this with your actual API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve({ success: true, deleted_id: id });
            } else {
                reject(new Error('Failed to delete'));
            }
        }, 1000);
    });
}

// Toast notifications
function showToast(type, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: '✓',
        error: '✕'
    };
    
    toast.innerHTML = `
        <span style="font-size: 18px;">${iconMap[type]}</span>
        <span>${message}</span>
        <button onclick="removeToast(this)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #999; padding: 0; width: 20px; height: 20px;">&times;</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        removeToast(toast.querySelector('button'));
    }, duration);
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

// Validate dates
document.getElementById('startDate').addEventListener('change', function() {
    const startDate = this.value;
    const endDateInput = document.getElementById('endDate');
    
    if (startDate && endDateInput.value && startDate > endDateInput.value) {
        showToast('error', 'Start date cannot be after end date');
        this.value = '';
    }
});

document.getElementById('endDate').addEventListener('change', function() {
    const endDate = this.value;
    const startDateInput = document.getElementById('startDate');
    
    if (endDate && startDateInput.value && endDate < startDateInput.value) {
        showToast('error', 'End date cannot be before start date');
        this.value = '';
    }
});