
let complaints = JSON.parse(localStorage.getItem("civicComplaints")) || [];

const demoComplaints = [
    {
        id: "CF1001",
        name: "Rahul Sharma",
        category: "Road Damage",
        location: "Sector 62, Noida",
        priority: "High",
        description: "Large pothole near the main road.",
        status: "Pending",
        date: "2026-11-18"
    },
    {
        id: "CF1002",
        name: "Priya Verma",
        category: "Garbage",
        location: "Sector 18, Noida",
        priority: "Medium",
        description: "Garbage has not been collected.",
        status: "In Progress",
        date: "2026-11-19"
    },
    {
        id: "CF1003",
        name: "Aman Gupta",
        category: "Streetlight",
        location: "Sector 15, Noida",
        priority: "Low",
        description: "Streetlight is not working.",
        status: "Resolved",
        date: "2026-11-20"
    },
    {
        id: "CF1004",
        name: "Neha Singh",
        category: "Water Leakage",
        location: "Sector 50, Noida",
        priority: "Urgent",
        description: "Water pipeline leakage on the street.",
        status: "Pending",
        date: "2026-11-21"
    }
];

if (complaints.length === 0) {
    complaints = demoComplaints;
    saveData();
}

function saveData() {
    localStorage.setItem("civicComplaints", JSON.stringify(complaints));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function showView(view) {
    document.querySelectorAll(".view").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(view + "View").classList.remove("hidden");

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle("active", button.dataset.view === view);
    });

    const titles = {
        dashboard: "Dashboard",
        complaints: "All Complaints",
        report: "Report an Issue"
    };

    document.getElementById("pageTitle").textContent = titles[view];

    if (view === "dashboard") {
        renderDashboard();
    }

    if (view === "complaints") {
        renderComplaints();
    }
}

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });
});

document.getElementById("reportButton").addEventListener("click", () => {
    showView("report");
});

document.getElementById("viewAllButton").addEventListener("click", () => {
    showView("complaints");
});

function statusClass(status) {
    if (status === "Pending") return "status-pending";
    if (status === "In Progress") return "status-progress";
    return "status-resolved";
}

function priorityClass(priority) {
    return "priority-" + priority.toLowerCase();
}

function renderDashboard() {
    const total = complaints.length;

    const pending = complaints.filter(c => c.status === "Pending").length;
    const progress = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("progressCount").textContent = progress;
    document.getElementById("resolvedCount").textContent = resolved;

    const recent = [...complaints].slice(-5).reverse();

    const recentContainer = document.getElementById("recentComplaints");

    if (recent.length === 0) {
        recentContainer.innerHTML = '<div class="empty-state">No complaints yet.</div>';
    } else {
        recentContainer.innerHTML = recent.map(c => `
            <div class="complaint-row">
                <div class="complaint-main">
                    <div>
                        <h4>${escapeHTML(c.category)} - ${escapeHTML(c.id)}</h4>
                        <p>${escapeHTML(c.location)}</p>
                    </div>
                    <span class="status ${statusClass(c.status)}">
                        ${escapeHTML(c.status)}
                    </span>
                </div>
                <div class="complaint-meta">
                    ${escapeHTML(c.name)} · ${escapeHTML(c.date)}
                </div>
            </div>
        `).join("");
    }

    renderCategories();

    document.getElementById("activityStats").innerHTML = `
        <div class="activity-stats">
            <div class="activity-item">
                <strong>${pending}</strong>
                Pending
            </div>
            <div class="activity-item">
                <strong>${progress}</strong>
                In Progress
            </div>
            <div class="activity-item">
                <strong>${resolved}</strong>
                Resolved
            </div>
        </div>
    `;
}

function renderCategories() {
    const categories = {};

    complaints.forEach(c => {
        categories[c.category] = (categories[c.category] || 0) + 1;
    });

    const container = document.getElementById("categoryStats");

    if (Object.keys(categories).length === 0) {
        container.innerHTML = '<div class="empty-state">No data available.</div>';
        return;
    }

    container.innerHTML = Object.entries(categories).map(([name, count]) => {
        const percentage = (count / complaints.length) * 100;

        return `
            <div class="category-item">
                <div class="category-label">
                    <span>${escapeHTML(name)}</span>
                    <strong>${count}</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${percentage}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

function renderComplaints() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;
    const priority = document.getElementById("priorityFilter").value;

    const filtered = complaints.filter(c => {
        const matchesSearch = [
            c.id, c.name, c.category, c.location
        ].some(value => value.toLowerCase().includes(search));

        const matchesStatus = status === "All" || c.status === status;
        const matchesPriority = priority === "All" || c.priority === priority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const container = document.getElementById("complaintsList");

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No matching complaints found.</div>';
        return;
    }

    container.innerHTML = filtered.map(c => `
        <div class="complaint-row">
            <div class="complaint-main">
                <div>
                    <h4>${escapeHTML(c.category)} - ${escapeHTML(c.id)}</h4>
                    <p>${escapeHTML(c.location)} · ${escapeHTML(c.name)}</p>
                    <div class="complaint-meta">
                        ${escapeHTML(c.description)}
                    </div>
                </div>
                <div>
                    <span class="priority ${priorityClass(c.priority)}">
                        ${escapeHTML(c.priority)}
                    </span>
                </div>
            </div>

            <div class="complaint-meta">
                Reported: ${escapeHTML(c.date)}
            </div>

            <div class="complaint-main" style="margin-top:12px">
                <span class="status ${statusClass(c.status)}">
                    ${escapeHTML(c.status)}
                </span>

                <select class="action-select"
                    onchange="updateStatus('${c.id}', this.value)">
                    <option value="Pending" ${c.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="In Progress" ${c.status === "In Progress" ? "selected" : ""}>In Progress</option>
                    <option value="Resolved" ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
                </select>
            </div>
        </div>
    `).join("");
}

function updateStatus(id, newStatus) {
    const complaint = complaints.find(c => c.id === id);

    if (!complaint) return;

    complaint.status = newStatus;

    saveData();
    renderComplaints();
    renderDashboard();

    showToast("Complaint status updated!");
}

document.getElementById("complaintForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const newComplaint = {
        id: "CF" + Date.now().toString().slice(-7),
        name: document.getElementById("citizenName").value.trim(),
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        priority: document.getElementById("priority").value,
        description: document.getElementById("description").value.trim(),
        photo: document.getElementById("photo").value.trim(),
        status: "Pending",
        date: new Date().toISOString().slice(0, 10)
    };

    complaints.push(newComplaint);

    saveData();

    this.reset();

    renderDashboard();

    showToast("Complaint submitted successfully!");

    showView("complaints");
});

document.getElementById("searchInput").addEventListener("input", renderComplaints);
document.getElementById("statusFilter").addEventListener("change", renderComplaints);
document.getElementById("priorityFilter").addEventListener("change", renderComplaints);

renderDashboard();
