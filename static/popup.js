const popupConfig = {
            success: {
                icon: '✓',
                title: 'Success!',
                message: 'Operation completed successfully!',
                headerClass: 'success',
                primaryBtnText: 'Great!',
                primaryBtnClass: 'success'
            },
            error: {
                icon: '✕',
                title: 'Error!',
                message: 'Something went wrong. Please try again.',
                headerClass: 'error',
                primaryBtnText: 'Try Again',
                primaryBtnClass: 'primary'
            },
            warning: {
                icon: '⚠',
                title: 'Warning!',
                message: 'Please review your action before proceeding.',
                headerClass: 'warning',
                primaryBtnText: 'Understood',
                primaryBtnClass: 'primary'
            },
            info: {
                icon: 'ℹ',
                title: 'Information',
                message: 'Here is some important information for you.',
                headerClass: 'info',
                primaryBtnText: 'OK',
                primaryBtnClass: 'primary'
            }
};

        // Show popup function
function showPopup(type, customTitle = null, customMessage = null, showSecondary = false) {
    const config = popupConfig[type];
    if (!config) return;

    const overlay = document.getElementById('popupOverlay');
    const header = document.getElementById('popupHeader');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');
    const primaryBtn = document.getElementById('popupPrimaryBtn');
    const secondaryBtn = document.getElementById('popupSecondaryBtn');

    // Set content
    icon.textContent = config.icon;
    title.textContent = customTitle || config.title;
    message.textContent = customMessage || config.message;
    
    // Set styles
    header.className = `popup-header ${config.headerClass}`;
    primaryBtn.textContent = config.primaryBtnText;
    primaryBtn.className = `popup-btn ${config.primaryBtnClass}`;
    
    // Show/hide secondary button
    secondaryBtn.style.display = showSecondary ? 'inline-block' : 'none';

    // Show popup
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

        // Close popup function
function closePopup(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    const overlay = document.getElementById('popupOverlay');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

        // Toast notification function
function showToast(type, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${iconMap[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="removeToast(this)">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toast.querySelector('.toast-close'));
    }, duration);
}

// Remove toast function
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
        closePopup();
    }
});

// Example functions for SQLite integration
function handleSQLiteSuccess(message = "Data saved successfully!") {
    showPopup('success', 'Database Updated', message);
    showToast('success', message);
}

function handleSQLiteError(error = "Database operation failed") {
    showPopup('error', 'Database Error', `Error: ${error}. Please check your connection and try again.`);
    showToast('error', 'Database operation failed');
}
