const API_BASE = "http://127.0.0.1:8000";
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "supervisor") {
  window.location.href = "login.html";
}

document.getElementById("welcome").textContent = `Welcome, ${user.full_name}`;

document.addEventListener("DOMContentLoaded", function () {
  loadEmployees();
  loadTasks();
});

document.getElementById("employeeForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const employeeData = {
    full_name: document.getElementById("fullName").value,
    email: document.getElementById("employeeEmail").value,
    password: document.getElementById("employeePassword").value,
    role: "employee"
  };

  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employeeData)
  });

  if (response.ok) {
    alert("Employee created successfully");
    document.getElementById("employeeForm").reset();
    loadEmployees();
  } else {
    const error = await response.json();
    alert(error.detail);
  }
});

async function loadEmployees() {
  const response = await fetch(`${API_BASE}/employees`);
  const employees = await response.json();

  const select = document.getElementById("employeeSelect");
  select.innerHTML = `<option value="">Select employee</option>`;

  employees.forEach(employee => {
    select.innerHTML += `
      <option value="${employee.id}">
        ${employee.full_name}
      </option>
    `;
  });
}

document.getElementById("taskForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData();

  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("employee_id", document.getElementById("employeeSelect").value);

  const file = document.getElementById("file").files[0];

  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    body: formData
  });

  if (response.ok) {
    alert("Task assigned successfully");
    document.getElementById("taskForm").reset();
    loadTasks();
  } else {
    const error = await response.json();
    alert(error.detail);
  }
});

async function loadTasks() {
  const response = await fetch(`${API_BASE}/tasks`);
  const tasks = await response.json();

  const taskList = document.getElementById("taskList");
  const alertBox = document.getElementById("alertBox");

  taskList.innerHTML = "";

  const awaitingReview = tasks.filter(task => task.status === "Resolved/Completed").length;

  alertBox.textContent = `Notification: ${awaitingReview} task(s) awaiting supervisor review.`;

  tasks.forEach(task => {
    taskList.innerHTML += `
      <div class="task-card">
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Assigned Employee ID:</strong> ${task.employee_id}</p>

        ${
          task.file_path
            ? `<a href="${API_BASE}/${task.file_path}" target="_blank">View Supporting File</a>`
            : `<p>No file uploaded</p>`
        }

        ${
          task.status === "Resolved/Completed"
            ? `<button onclick="markDone(${task.id})">Confirm Done</button>`
            : ""
        }
      </div>
    `;
  });
}

async function markDone(taskId) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "Done",
      changed_by: user.full_name
    })
  });

  if (response.ok) {
    alert("Task marked as Done");
    loadTasks();
  } else {
    const error = await response.json();
    alert(error.detail);
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}