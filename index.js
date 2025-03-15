let currentColumn = '';

function showAddTaskForm(columnId) {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'block';
    currentColumn = columnId;
}

function closeModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'none';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
}

function addNewTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.querySelector("#priorityId")
    const priorityText = priority.options[priority.selectedIndex].text;
    if (!title) return;
    
    const taskCard = createTaskCard(title, description, priorityText);
    const column = document.querySelector(`#${currentColumn} .task-list`);
    column.appendChild(taskCard);

    saveTasks();
    
    closeModal();
}

function createTaskCard(title, description, priorityText, id = null) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.id = id ? id : 'task-' + Date.now();

    if (priorityText === "High") card.classList.add("high");
    else if (priorityText === "Medium") card.classList.add("medium");
    else card.classList.add("low");

    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();

    card.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="task-actions">
            <i class="bi bi-pencil-square ed-btn editBtn"></i>
            <i class="bi bi-trash ed-btn delBtn"></i>
        </div>
        <span class="taskdt">${date}</span>
        <span class="taskdt">${time}</span>
    `;

    card.querySelector(".editBtn").addEventListener("click", () => editTask(card));
    card.querySelector(".delBtn").addEventListener("click", () => deleteTask(card));

    card.addEventListener('dragstart', drag);

    return card;
}

function deleteTask(taskElement) {
    if (confirm("Are you sure you want to delete this task?")) {
        taskElement.remove();
        saveTasks(); 
    }
}

function editTask(taskElement) {
    const titleElement = taskElement.querySelector("h3");
    const descriptionElement = taskElement.querySelector("p");
    console.log(taskElement);

    document.getElementById('taskTitle').value = titleElement.innerText;
    document.getElementById('taskDescription').value = descriptionElement.innerText;
    showAddTaskForm(currentColumn);

    document.getElementById('saveTaskBtn').onclick = function () {
        const updatedTitle = document.getElementById('taskTitle').value;
        const updatedDescription = document.getElementById('taskDescription').value;
        const priority = document.querySelector("#priorityId")
        const priorityText = priority.options[priority.selectedIndex].text;
        
        if (updatedTitle.trim() === "") return;

        if (priorityText === "High") taskElement.classList.add("high");
        else if (priorityText === "Medium") taskElement.classList.add("medium");
        else taskElement.classList.add("low");

        titleElement.innerText = updatedTitle;
        descriptionElement.innerText = updatedDescription;

        saveTasks();
        closeModal();
    };
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);

    let targetList = ev.target;
    while (targetList && !targetList.classList.contains('task-list')) {
        targetList = targetList.parentElement;
    }
    
    if (targetList) {
        targetList.appendChild(taskElement);
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('addTaskModal');
    if (event.target == modal) {
        closeModal();
    }
}

function saveTasks() {
    const columns = document.querySelectorAll(".task-list");
    const tasks = [];

    columns.forEach(column => {
        const columnId = column.parentElement.id;
        column.querySelectorAll(".task-card").forEach(task => {
            tasks.push({
                id: task.id,
                column: columnId,
                title: task.querySelector("h3").innerText,
                description: task.querySelector("p").innerText,
                priority: task.classList.contains("high") ? "High" : task.classList.contains("medium") ? "Medium" : "Low"
            });
        });
    });

    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

    savedTasks.forEach(task => {
        const column = document.querySelector(`#${task.column} .task-list`);
        const taskCard = createTaskCard(task.title, task.description, task.priority, task.id);
        column.appendChild(taskCard);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});
