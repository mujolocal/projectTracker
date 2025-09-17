export const addClick=(id, _function)=>{
    const refreshButton = document.getElementById(id);
    refreshButton.addEventListener('click', _function)
}

export function formatDate(dateString) {
     return new Date(dateString).toLocaleDateString();
 }

 export function getStatusColor(status) {
    const statusColors = {
        'not_started': '#6c757d',
        'in_progress': '#007bff', 
        'completed': '#28a745',
        'on_hold': '#ffc107',
        'cancelled': '#dc3545'
    };
    return statusColors[status] || '#6c757d';
}