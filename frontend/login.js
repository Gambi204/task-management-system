const API_BASE = "http://127.0.0.1:8000";

document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const loginData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem("user", JSON.stringify(data));

    if (data.role === "supervisor") {
      window.location.href = "supervisor.html";
    } else {
      window.location.href = "employee.html";
    }
  } catch (error) {
    document.getElementById("message").textContent = error.message;
  }
});