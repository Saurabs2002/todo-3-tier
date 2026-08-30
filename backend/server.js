const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();


// =====================================================
// Middleware
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// PostgreSQL Connection
// =====================================================

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "todo_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres"
});


// =====================================================
// Database Initialization
// =====================================================

async function initializeDatabase() {

    try {

        // Check database connection
        await pool.query("SELECT 1");

        console.log("PostgreSQL connected successfully");


        // Create todos table automatically
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                task TEXT NOT NULL
            );
        `);

        console.log("Todos table is ready");

    } catch (error) {

        console.error(
            "Database initialization failed:",
            error
        );

        // Stop backend if database is unavailable
        process.exit(1);
    }
}


// =====================================================
// Health Check
// =====================================================

app.get("/health", async (req, res) => {

    try {

        // Check database connection
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "healthy",
            database: "connected"
        });

    } catch (error) {

        console.error(
            "Health check failed:",
            error
        );

        res.status(503).json({
            status: "unhealthy",
            database: "disconnected"
        });
    }
});


// =====================================================
// GET - Get all Todos
// =====================================================

app.get("/todos", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM todos ORDER BY id"
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching todos:",
            error
        );

        res.status(500).json({
            error: "Database error"
        });
    }
});


// =====================================================
// POST - Add Todo
// =====================================================

app.post("/todos", async (req, res) => {

    try {

        const { task } = req.body;

        if (!task) {

            return res.status(400).json({
                error: "Task is required"
            });
        }


        const result = await pool.query(
            `
            INSERT INTO todos (task)
            VALUES ($1)
            RETURNING *
            `,
            [task]
        );


        res.status(201).json(
            result.rows[0]
        );

    } catch (error) {

        console.error(
            "Error adding todo:",
            error
        );

        res.status(500).json({
            error: "Database error"
        });
    }
});


// =====================================================
// DELETE - Delete Todo
// =====================================================

app.delete("/todos/:id", async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM todos
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Todo not found"
            });
        }


        res.status(200).json({
            message: "Todo deleted successfully"
        });

    } catch (error) {

        console.error(
            "Error deleting todo:",
            error
        );

        res.status(500).json({
            error: "Database error"
        });
    }
});


// =====================================================
// Start Server
// =====================================================

async function startServer() {

    // First connect to PostgreSQL
    // Then create todos table
    // Then start HTTP server

    await initializeDatabase();


    app.listen(3000, "0.0.0.0", () => {

        console.log(
            "Backend server running on port 3000"
        );

    });
}


startServer();

