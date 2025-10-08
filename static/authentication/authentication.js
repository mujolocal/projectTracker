import { API_BASE } from "../utilities/constants.js";

function closeUpdateForm(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('popup-close')) {
        return;
    }
    
    document.getElementById('taskUpdateOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentRecordId = null;
    resetTaskButton();
}

// function createUser(id, email, password) {
//   return fetch("/auth/create", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ id, email, password })
//   })
//     .then(res => {
//       if (!res.ok) return res.json().then(err => Promise.reject(err.detail || "Failed to create user"));
//       return res.json();
//     });
// }

function loginUser(id, password) {
  return fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id, password })
  })
    .then(res => {
      if (!res.ok) return res.json().then(err => Promise.reject(err.detail || "Invalid credentials"));
      return res.json();
    });
}

const login =()=>{
    const userName = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    loginUser(userName, password)
    .then(data => console.log("Logged in:", data))
  .catch(err => console.error("Login error:", err));

}

export const createLoginForm = (location = "taskUpdateOverlay") => {

  const loginDiv = document.createElement("div");
  loginDiv.className = "update-task";
  loginDiv.onclick = (event) => event.stopPropagation();

  const header = document.createElement("div");
  header.className = "form-header";

  const title = document.createElement("h3");
  title.className = "form-title";
  title.textContent = "Login";

  header.appendChild(title);
  loginDiv.appendChild(header);

  const formContainer = document.createElement("div");
  formContainer.className = "form-container";


  const form = document.createElement("form");
  form.id = "loginForm";

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

  formContainer.appendChild(form);
  loginDiv.appendChild(formContainer);

  const formActions = document.createElement("div");
  formActions.className = "form-actions";

  const loginBtn = document.createElement("button");
  loginBtn.type = "submit";
  loginBtn.id = "loginButton";
  loginBtn.className = "btn btn-primary";
  loginBtn.addEventListener("click", login)
  const loginSpinner = document.createElement("span");
  loginSpinner.className = "loading-spinner";
  loginSpinner.id = "loginSpinner";
  loginBtn.appendChild(loginSpinner);
  loginBtn.appendChild(document.createTextNode(" Login"));

  formActions.appendChild(loginBtn);

  loginDiv.appendChild(formActions);

  document.getElementById(location).replaceChildren(loginDiv);
  document.getElementById('taskUpdateOverlay').classList.add('show');
};
