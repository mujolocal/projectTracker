function closeUpdateForm(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    document.getElementById('taskUpdateOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentRecordId = null;
    resetTaskButton();
}

export const createLoginForm = (location = "taskUpdateOverlay") => {
    console.log("the login form loaded")
  // outer div
  const loginDiv = document.createElement("div");
  loginDiv.className = "login-form";
  loginDiv.onclick = (event) => event.stopPropagation();

  // header
  const header = document.createElement("div");
  header.className = "form-header";

  const closeBtn = document.createElement("button");
  closeBtn.className = "form-close";
  closeBtn.id = "loginFormXbutton";
  closeBtn.innerHTML = "&times;";

  const title = document.createElement("h3");
  title.className = "form-title";
  title.textContent = "Login";

  header.appendChild(closeBtn);
  header.appendChild(title);
  loginDiv.appendChild(header);

  // form container
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";

  // form
  const form = document.createElement("form");
  form.id = "loginForm";

  // Username
  const userGroup = document.createElement("div");
  userGroup.className = "form-group full-width";
  const userLabel = document.createElement("label");
  userLabel.className = "form-label required";
  userLabel.htmlFor = "username";
  userLabel.textContent = "Username";
  const userInput = document.createElement("input");
  userInput.type = "text";
  userInput.id = "username";
  userInput.name = "username";
  userInput.className = "form-input";
  userInput.required = true;
  userGroup.appendChild(userLabel);
  userGroup.appendChild(userInput);
  form.appendChild(userGroup);

  // Password
  const passGroup = document.createElement("div");
  passGroup.className = "form-group full-width";
  const passLabel = document.createElement("label");
  passLabel.className = "form-label required";
  passLabel.htmlFor = "password";
  passLabel.textContent = "Password";
  const passInput = document.createElement("input");
  passInput.type = "password";
  passInput.id = "password";
  passInput.name = "password";
  passInput.className = "form-input";
  passInput.required = true;
  passGroup.appendChild(passLabel);
  passGroup.appendChild(passInput);
  form.appendChild(passGroup);

  // put form inside container
  formContainer.appendChild(form);
  loginDiv.appendChild(formContainer);

  // form actions
  const formActions = document.createElement("div");
  formActions.className = "form-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.id = "closeLoginButton";
  cancelBtn.className = "btn btn-danger";
  const cancelSpinner = document.createElement("span");
  cancelSpinner.className = "loading-spinner";
  cancelSpinner.id = "loginCancelSpinner";
  cancelBtn.appendChild(cancelSpinner);
  cancelBtn.appendChild(document.createTextNode(" Cancel"));

  const loginBtn = document.createElement("button");
  loginBtn.type = "submit";
  loginBtn.id = "loginButton";
  loginBtn.className = "btn btn-primary";
  const loginSpinner = document.createElement("span");
  loginSpinner.className = "loading-spinner";
  loginSpinner.id = "loginSpinner";
  loginBtn.appendChild(loginSpinner);
  loginBtn.appendChild(document.createTextNode(" Login"));

  formActions.appendChild(cancelBtn);
  formActions.appendChild(loginBtn);

  loginDiv.appendChild(formActions);

  // replace target location
  document.getElementById(location).replaceChildren(loginDiv);
};
