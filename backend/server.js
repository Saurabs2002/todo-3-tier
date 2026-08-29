const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "todo_db"
});

app.get("/health", (req, res) => {
    res.json({
        status: "UP"
    });
});

app.get("/todos", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM todos ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database error"
        });
    }
});

app.post("/todos", async (req, res) => {
    try {
        const { task } = req.body;

        const result = await pool.query(
            "INSERT INTO todos(task) VALUES($1) RETURNING *",
            [task]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});

app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM todos WHERE id = $1",
            [id]
        );

        res.json({
            message: "Todo deleted"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
