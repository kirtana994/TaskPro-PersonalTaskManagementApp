
const accessToken = sessionStorage.getItem("accessToken");

const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const taskFormContainer = document.getElementById("taskFormContainer");
const dashboardMessage = document.getElementById("dashboardMessage");

if (!accessToken) {
    window.location.replace("/login/");
} else {
    loadTasks();
}
// Function to make API requests with the access token.
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            ...options.headers
        }
    });

    if (response.status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        window.location.replace("/login/");
        throw new Error("Your login has expired. Please log in again.");
    }

    return response;
}

let messageTimer;

function showMessage(text, type = "success") {
    clearTimeout(messageTimer);

    dashboardMessage.className = `alert alert-${type}`;
    dashboardMessage.textContent = text;

    messageTimer = setTimeout(() => {
        dashboardMessage.textContent = "";
        dashboardMessage.className = "";
    }, 3000);
}

// Load tasks from the API and render them.
async function loadTasks() {
    taskList.innerHTML = `
        <div class="col-12 text-center py-4">Loading tasks...</div>
    `;

    const params = new URLSearchParams();

    const search = document.getElementById("searchInput").value.trim();
    const status = document.getElementById("statusFilter").value;
    const priority = document.getElementById("priorityFilter").value;
    const ordering = document.getElementById("sortOrder").value;

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (ordering) params.set("ordering", ordering);

    try {
        const response = await apiRequest(`/api/tasks/?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Unable to load tasks.");
        }

        const data = await response.json();

        // Handle both paginated and non-paginated DRF responses.
        const tasks = Array.isArray(data) ? data : data.results;

        renderTasks(tasks || []);
    } catch (error) {
        taskList.innerHTML = "";
        showMessage(error.message || "Something went wrong.", "danger");
    }
}

function renderTasks(tasks) {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="col-12">
                <div class="card card-body text-center text-muted">
                    No tasks found. Add your first task!
                </div>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const column = document.createElement("div");
        column.className = "col-md-6 col-lg-4";

        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm";

        const body = document.createElement("div");
        body.className = "card-body";

        // Use textContent for user-provided content to avoid injecting HTML.
        const title = document.createElement("h2");
        title.className = "h5";
        title.textContent = task.title;

        // If the task is completed, apply a strikethrough style to the title.
        if (task.status === "completed") {
            title.style.textDecoration = "line-through";
            title.style.opacity = "0.6";
        }

        const description = document.createElement("p");
        description.className = "text-muted";
        description.textContent = task.description || "No description provided.";

        const dueDate = document.createElement("p");

        const formattedDate = new Date(task.due_date + "T00:00:00")
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        dueDate.textContent = `Due: ${formattedDate}`;

        const priority = document.createElement("span");
        priority.className = "badge text-bg-warning me-2";
        priority.textContent = `Priority: ${task.priority}`;

        const status = document.createElement("span");
        status.className = `badge ${
            task.status === "completed" ? "text-bg-success" : "text-bg-secondary"
        }`;
        status.textContent = task.status;

        
        const actions = document.createElement("div");
        actions.className = "d-flex flex-wrap gap-2 mt-3";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-sm btn-outline-primary";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTask(task));

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.className = "btn btn-sm btn-outline-success";
        completeButton.textContent =
            task.status === "completed" ? "Mark Pending" : "Mark Complete";
        completeButton.addEventListener("click", () => toggleTaskStatus(task));

        
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-sm btn-outline-danger";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTask(task));

        actions.append(editButton, completeButton, deleteButton);
        body.append(title, description, dueDate, priority, status, actions);

        card.appendChild(body);
        column.appendChild(card);
        taskList.appendChild(column);

    });
}

// Open the task form.
document.getElementById("showTaskFormButton").addEventListener("click", () => {
    taskForm.reset();
    document.getElementById("taskId").value = "";
    document.getElementById("taskFormHeading").textContent = "Create a Task";
    taskFormContainer.classList.remove("d-none");
});

// Close the task form.
document.getElementById("cancelTaskButton").addEventListener("click", () => {
    taskFormContainer.classList.add("d-none");
});

// Create a task.
taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        due_date: document.getElementById("dueDate").value,
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value
    };

    if (!payload.title || !payload.due_date) {
        showMessage("Title and due date are required.", "danger");
        return;
    }

    
    const saveButton = document.getElementById("saveTaskButton");
    const taskId = document.getElementById("taskId").value;
    const isEditing = Boolean(taskId);

    saveButton.disabled = true;
    saveButton.textContent = isEditing ? "Updating..." : "Saving...";

    try {
        const url = isEditing
            ? `/api/tasks/${taskId}/`
            : "/api/tasks/";

        const response = await apiRequest(url, {
            method: isEditing ? "PATCH" : "POST",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errors = await response.json();
            showMessage(JSON.stringify(errors), "danger");
            return;
        }

        taskForm.reset();
        document.getElementById("taskId").value = "";
        taskFormContainer.classList.add("d-none");

        showMessage(
            isEditing
                ? "Task updated successfully!"
                : "Task created successfully!"
        );

        await loadTasks();
    } catch (error) {
        showMessage(error.message || "Unable to save task.", "danger");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Task";
    }
});


// Reload tasks when filters change.
["searchInput", "statusFilter", "priorityFilter", "sortOrder"].forEach(id => {
    document.getElementById(id).addEventListener("change", loadTasks);
});

document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") loadTasks();
});

// Logout.
document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    window.location.replace("/login/");
});


// Edit a task.
async function editTask(task) {
    document.getElementById("taskId").value = task.id;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description || "";
    document.getElementById("dueDate").value = task.due_date;
    document.getElementById("priority").value = task.priority;
    document.getElementById("status").value = task.status;

    document.getElementById("taskFormHeading").textContent = "Edit Task";
    taskFormContainer.classList.remove("d-none");

    taskFormContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Toggle task status between "completed" and "pending".
async function toggleTaskStatus(task) {
    const newStatus =
        task.status === "completed" ? "pending" : "completed";

    try {
        const response = await apiRequest(`/api/tasks/${task.id}/`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errors = await response.json();
            showMessage(JSON.stringify(errors), "danger");
            return;
        }

        showMessage(
            newStatus === "completed"
                ? "Task marked as complete!"
                : "Task marked as pending!"
        );

        await loadTasks();
    } catch (error) {
        showMessage(error.message || "Unable to update task.", "danger");
    }
}


// Delete a task.
async function deleteTask(task) {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
        const response = await apiRequest(`/api/tasks/${task.id}/`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errors = await response.json();
            showMessage(JSON.stringify(errors), "danger");
            return;
        }

        showMessage("Task deleted successfully!");
        await loadTasks();
    } catch (error) {
        showMessage(error.message || "Unable to delete task.", "danger");
    }
}
