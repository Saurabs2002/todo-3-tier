
// Automatically use the EC2 public IP/domain
const API_URL =
    `${window.location.protocol}//${window.location.hostname}:3000`;


// Load all todos
async function loadTodos() {

    try {

        const response = await fetch(
            `${API_URL}/todos`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch todos");
        }

        const todos = await response.json();

        const list =
            document.getElementById("todoList");

        list.innerHTML = "";

        todos.forEach(todo => {

            const li =
                document.createElement("li");

            li.innerHTML = `
                <span>${todo.task}</span>

                <button
                    onclick="deleteTodo(${todo.id})">
                    Delete
                </button>
            `;

            list.appendChild(li);

        });

    } catch (error) {

        console.error("Error:", error);

        document.getElementById("todoList").innerHTML =
            "<li>Unable to connect to backend</li>";
    }
}


// Add a new todo
async function addTodo() {

    const input =
        document.getElementById("taskInput");

    const task =
        input.value.trim();

    if (!task) {

        alert("Please enter a todo");

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/todos`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    task: task
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add todo");
        }

        input.value = "";

        await loadTodos();

    } catch (error) {

        console.error("Error:", error);

        alert("Unable to add todo");
    }
}


// Delete todo
async function deleteTodo(id) {

    try {

        const response = await fetch(
            `${API_URL}/todos/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete todo");
        }

        await loadTodos();

    } catch (error) {

        console.error("Error:", error);

        alert("Unable to delete todo");
    }
}


// Load todos when page opens
loadTodos();
