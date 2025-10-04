import { addClick } from "../utilities/utilities.js";

export const createTaskForm =(updateTask=()=>{},closeUpdateForm=()=>{}, location="taskUpdateOverlay")=>{
    // outer div
    const updateTaskDiv = document.createElement("div");
    updateTaskDiv.className = "form-card";
    updateTaskDiv.onclick = (event) => event.stopPropagation();

    // header
    const taskHeader = document.createElement("div");
    taskHeader.className = "form-header";

    const closeBtn = document.createElement("button");
    closeBtn.className = "task-close";
    closeBtn.id = "updateFormXbutton";
    closeBtn.innerHTML = "&times;";

    const taskTitle = document.createElement("h3");
    taskTitle.className = "task-title";
    taskTitle.textContent = "Update Task";

    taskHeader.appendChild(closeBtn);
    taskHeader.appendChild(taskTitle);
    updateTaskDiv.appendChild(taskHeader);

    // form container
    const formContainer = document.createElement("div");
    formContainer.className = "form-container";

    // form
    const form = document.createElement("form");
    form.id = "updateForm";

    // hidden input
    const taskId = document.createElement("input");
    taskId.type = "hidden";
    taskId.id = "taskId";
    taskId.name = "id";
    form.appendChild(taskId);

    // Name
    const nameGroup = document.createElement("div");
    nameGroup.className = "form-group full-width";
    const nameLabel = document.createElement("label");
    nameLabel.className = "form-label required";
    nameLabel.htmlFor = "recordName";
    nameLabel.textContent = "Name";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "recordName";
    nameInput.name = "name";
    nameInput.className = "form-input";
    nameInput.required = true;
    nameInput.maxLength = 255;
    nameInput.readOnly = true;
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    // Description
    const descGroup = document.createElement("div");
    descGroup.className = "form-group full-width";
    const descLabel = document.createElement("label");
    descLabel.className = "form-label";
    descLabel.htmlFor = "recordDescription";
    descLabel.textContent = "Description";
    const descInput = document.createElement("textarea");
    descInput.id = "recordDescription";
    descInput.name = "description";
    descInput.className = "form-textarea";
    descInput.placeholder = "Enter task description...";
    descGroup.appendChild(descLabel);
    descGroup.appendChild(descInput);
    form.appendChild(descGroup);

    // Start Date
    const startGroup = document.createElement("div");
    startGroup.className = "form-group";
    const startLabel = document.createElement("label");
    startLabel.className = "form-label";
    startLabel.htmlFor = "startDate";
    startLabel.textContent = "Start Date";
    const startInput = document.createElement("input");
    startInput.type = "date";
    startInput.id = "startDate";
    startInput.name = "start_date";
    startInput.className = "form-input";
    startGroup.appendChild(startLabel);
    startGroup.appendChild(startInput);
    form.appendChild(startGroup);

    // End Date
    const endGroup = document.createElement("div");
    endGroup.className = "form-group";
    const endLabel = document.createElement("label");
    endLabel.className = "form-label";
    endLabel.htmlFor = "endDate";
    endLabel.textContent = "End Date";
    const endInput = document.createElement("input");
    endInput.type = "date";
    endInput.id = "endDate";
    endInput.name = "end_date";
    endInput.className = "form-input";
    endGroup.appendChild(endLabel);
    endGroup.appendChild(endInput);
    form.appendChild(endGroup);

    // Recurring Section
    const recurringSection = document.createElement("div");
    recurringSection.className = "form-group-row full-width";
    recurringSection.style.display = "none";
    recurringSection.id = "recurringSection";
    const recurringInner = document.createElement("div");
    recurringInner.style.display = "flex";
    recurringInner.style.flexDirection = "column";
    const recurringLabel = document.createElement("label");
    recurringLabel.className = "form-label";
    recurringLabel.htmlFor = "recurrance";
    recurringLabel.textContent = "Recurrance:";
    const recurringSelect = document.createElement("select");
    recurringSelect.id = "recurranceType";
    recurringSelect.name = "recurranceType";
    recurringSelect.className = "form-select";
    const optNone = document.createElement("option");
    optNone.value = "";
    optNone.selected = true;
    optNone.textContent = "None";
    const optDaily = document.createElement("option");
    optDaily.value = "daily";
    optDaily.textContent = "Daily";
    recurringSelect.appendChild(optNone);
    recurringSelect.appendChild(optDaily);
    recurringInner.appendChild(recurringLabel);
    recurringInner.appendChild(recurringSelect);
    recurringSection.appendChild(recurringInner);
    form.appendChild(recurringSection);

    // Status
    const statusGroup = document.createElement("div");
    statusGroup.className = "form-group full-width";
    const statusLabel = document.createElement("label");
    statusLabel.className = "form-label";
    statusLabel.htmlFor = "recordStatus";
    statusLabel.textContent = "Status";
    const statusSelect = document.createElement("select");
    statusSelect.id = "recordStatus";
    statusSelect.name = "status";
    statusSelect.className = "form-select";
    [
        { value: "not_started", text: "Not Started" },
        { value: "in_progress", text: "In Progress" },
        { value: "completed", text: "Completed" },
        { value: "on_hold", text: "On Hold" },
        { value: "cancelled", text: "Canceled" },
        { value: "failed", text: "Failed" }
    ].forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        statusSelect.appendChild(option);
    });
    statusGroup.appendChild(statusLabel);
    statusGroup.appendChild(statusSelect);
    form.appendChild(statusGroup);

    // newNote + notesSection
    const newNote = document.createElement("div");
    newNote.id = "newNote";
    form.appendChild(newNote);

    const notesSection = document.createElement("div");
    notesSection.id = "notesSection";
    form.appendChild(notesSection);

    // put form inside container
    formContainer.appendChild(form);
    updateTaskDiv.appendChild(formContainer);

    // form actions
    const formActions = document.createElement("div");
    formActions.className = "form-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.id = "closeUpdateTaskButton";
    cancelBtn.className = "btn btn-danger";
    const cancelSpinner = document.createElement("span");
    cancelSpinner.className = "loading-spinner";
    cancelSpinner.id = "deleteSpinner";
    cancelBtn.appendChild(cancelSpinner);
    cancelBtn.appendChild(document.createTextNode(" Cancel"));

    const updateBtn = document.createElement("button");
    updateBtn.type = "button";
    updateBtn.id = "updateTaskButton";
    updateBtn.className = "btn btn-primary";
    const updateSpinner = document.createElement("span");
    updateSpinner.className = "loading-spinner";
    updateSpinner.id = "updateSpinner";
    updateBtn.appendChild(updateSpinner);
    updateBtn.appendChild(document.createTextNode(" Update Task"));

    formActions.appendChild(cancelBtn);
    formActions.appendChild(updateBtn);

    updateTaskDiv.appendChild(formActions);
    // This is wrong it should return  the object and the onlicks should be setup earlier with their ... may fix later.
    // document.getElementById(location).replaceChildren(updateTaskDiv);
    return updateTaskDiv

    // const updateTaskButton = document.getElementById('updateTaskButton')
    // updateTaskButton.addEventListener('click', updateTask);
    // addClick("taskUpdateOverlay",closeUpdateForm );
    // addClick("updateFormXbutton",closeUpdateForm );
    // addClick("closeUpdateTaskButton",closeUpdateForm );
}