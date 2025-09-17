export const addClick=(id, _function)=>{
    const refreshButton = document.getElementById(id);
    refreshButton.addEventListener('click', _function)
}