import {addClick} from './utilities.js'


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
export const showPopup = (type, customTitle = null, customMessage = null, showSecondary = false) =>{
    const config = popupConfig[type];
    if (!config) return;

    const overlay = document.getElementById('popupOverlay');
    const header = document.getElementById('popupHeader');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');
    const primaryBtn = document.getElementById('popupPrimaryBtn');


    const secondaryBtn = document.getElementById('popupSecondaryBtn');
    addClick('popupPrimaryBtn',closePopup );
    addClick('popupCloseButton', closePopup);
    


    icon.textContent = config.icon;
    title.textContent = customTitle || config.title;
    message.textContent = customMessage || config.message;
    

    header.className = `popup-header ${config.headerClass}`;
    primaryBtn.textContent = config.primaryBtnText;
    primaryBtn.className = `popup-btn ${config.primaryBtnClass}`;
    

    secondaryBtn.style.display = showSecondary ? 'inline-block' : 'none';


    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePopup(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    const overlay = document.getElementById('popupOverlay');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close popup on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePopup();
    }
});