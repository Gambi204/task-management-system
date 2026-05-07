const API_BASE = "http://127.0.0.1:8000";
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "employee") {
  window.location.href = "login.html";
}

document.getElementById("welcome").textContent = `Welcome, ${user.full_name}`;

document.addEventListener("DOMContentLoaded", loadMyTasks);

async function loadMyTasks() {
  const response = await fetch(`${API_BASE}/tasks/employee/${user.user_id}`);
  const tasks = await response.json();

  const taskList = document.getElementById("taskList");
  const alertBox = document.getElementById("alertBox");

  taskList.innerHTML = "";

  alertBox.textContent = `Notification: You have ${tasks.length} assigned task(s).`;

  tasks.forEach(task => {
    taskList.innerHTML += `
      <div class="task-card">
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><strong>Status:</strong> ${task.status}</p>

        ${
          task.file_path
            ? `<a href="${API_BASE}/${task.file_path}" target="_blank">View Supporting File</a>`
            : `<p>No file uploaded</p>`
        }

        ${getActionButton(task)}
      </div>
    `;
  });
}

function getActionButton(task) {
  if (task.status === "Assigned") {
    return `<button onclick="updateStatus(${task.id}, 'In Progress')">Start Task</button>`;
  }

  if (task.status === "In Progress") {
    return `<button onclick="updateStatus(${task.id}, 'Resolved/Completed')">Mark Resolved</button>`;
  }

  if (task.status === "Resolved/Completed") {
    return `<p>Waiting for supervisor confirmation.</p>`;
  }

  if (task.status === "Done") {
    return `<p>Task closed.</p>`;
  }

  return "";
}

async function updateStatus(taskId, newStatus) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: newStatus,
      changed_by: user.full_name
    })
  });

  if (response.ok) {
    alert("Task updated successfully");
    loadMyTasks();
  } else {
    const error = await response.json();
    alert(error.detail);
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}