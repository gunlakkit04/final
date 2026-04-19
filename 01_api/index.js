const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config({ path: ".env.local" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "farm_management",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ status: "ok", db: rows[0].ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", message: e.message });
  }
});

// ======================
// FARM
// ======================
app.get("/farm", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        farm_id AS id,
        farm_name AS name,
        location,
        phone
      FROM farm
      ORDER BY farm_id DESC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/farm", async (req, res) => {
  try {
    const { name, location, phone } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "farm name is required" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO farm (farm_name, location, phone)
      VALUES (?, ?, ?)
      `,
      [String(name).trim(), location || null, phone || null]
    );

    res.status(201).json({
      message: "Farm created successfully",
      id: result.insertId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/farm/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM farm WHERE farm_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Farm not found" });
    }

    res.json({ message: "Farm deleted successfully" });
  } catch (e) {
    console.error(e);

    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "ลบฟาร์มไม่ได้ เพราะยังมี house หรือ employee ที่อ้างอิงฟาร์มนี้อยู่",
      });
    }

    res.status(500).json({ error: e.message });
  }
});

// ======================
// HOUSE
// ======================
app.get("/house", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        h.house_id AS id,
        h.house_name AS name,
        h.farm_id,
        f.farm_name AS farm_name
      FROM house h
      LEFT JOIN farm f ON h.farm_id = f.farm_id
      ORDER BY h.house_id DESC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/house", async (req, res) => {
  try {
    const { name, farm_id } = req.body;

    if (!name || !String(name).trim() || !farm_id) {
      return res.status(400).json({
        error: "name และ farm_id จำเป็นต้องมี",
      });
    }

    const [farmRows] = await pool.query(
      "SELECT farm_id FROM farm WHERE farm_id = ?",
      [Number(farm_id)]
    );

    if (farmRows.length === 0) {
      return res.status(400).json({
        error: "farm_id นี้ไม่มีอยู่จริงในตาราง farm",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO house (house_name, farm_id) VALUES (?, ?)",
      [String(name).trim(), Number(farm_id)]
    );

    res.status(201).json({
      message: "House created",
      id: result.insertId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/house/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM house WHERE house_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "House not found" });
    }

    res.json({ message: "House deleted" });
  } catch (e) {
    console.error(e);

    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "ลบ house ไม่ได้ เพราะยังมี batch หรือ environment ที่อ้างอิง house นี้อยู่",
      });
    }

    res.status(500).json({ error: e.message });
  }
});

// ======================
// EMPLOYEE
// ======================
app.get("/employee", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        employee_id AS id,
        name,
        position AS role,
        phone,
        farm_id
      FROM employee
      ORDER BY employee_id DESC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/employee", async (req, res) => {
  try {
    const { name, phone, role, farm_id } = req.body;

    if (!name || !role || !farm_id) {
      return res.status(400).json({
        error: "name, role, farm_id are required",
      });
    }

    const [farmRows] = await pool.query(
      "SELECT farm_id FROM farm WHERE farm_id = ?",
      [Number(farm_id)]
    );

    if (farmRows.length === 0) {
      return res.status(400).json({
        error: "farm_id นี้ไม่มีอยู่จริงในตาราง farm",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO employee (name, phone, position, farm_id)
      VALUES (?, ?, ?, ?)
      `,
      [name, phone || null, role, Number(farm_id)]
    );

    res.status(201).json({
      message: "Employee created successfully",
      id: result.insertId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/employee/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM employee WHERE employee_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (e) {
    console.error(e);

    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "ลบ employee ไม่ได้ เพราะยังมีข้อมูลอื่นอ้างอิงพนักงานคนนี้อยู่",
      });
    }

    res.status(500).json({ error: e.message });
  }
});

// ======================
// BATCH
// ======================
app.get("/batch", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        batch_id AS id,
        breed,
        start_date,
        end_date,
        status,
        initial_qty,
        current_qty,
        house_id
      FROM batch
      ORDER BY batch_id DESC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/batch", async (req, res) => {
  try {
    const {
      breed,
      start_date,
      end_date,
      status,
      initial_qty,
      current_qty,
      house_id,
    } = req.body;

    if (!breed || !start_date || !status || !house_id) {
      return res.status(400).json({
        error: "breed, start_date, status, house_id are required",
      });
    }

    const [houseRows] = await pool.query(
      "SELECT house_id FROM house WHERE house_id = ?",
      [Number(house_id)]
    );

    if (houseRows.length === 0) {
      return res.status(400).json({
        error: "house_id นี้ไม่มีอยู่จริงในตาราง house",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO batch
      (breed, start_date, end_date, status, initial_qty, current_qty, house_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        breed,
        start_date,
        end_date || null,
        status,
        Number(initial_qty || 0),
        Number(current_qty || 0),
        Number(house_id),
      ]
    );

    res.status(201).json({
      message: "Batch created successfully",
      id: result.insertId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/batch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM batch WHERE batch_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.json({ message: "Batch deleted successfully" });
  } catch (e) {
    console.error(e);

    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "ลบ batch ไม่ได้ เพราะยังมี production, feeding, receive หรือ incident ที่อ้างอิง batch นี้อยู่",
      });
    }

    res.status(500).json({ error: e.message });
  }
});

// ======================
// PRODUCTION
// ======================
app.get("/production", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        production_id AS id,
        production_date AS date,
        egg_qty AS good,
        broken_qty AS broken,
        total_weight_egg AS weight,
        egg_size AS size,
        batch_id,
        employee_id
      FROM production
      ORDER BY production_id DESC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/production", async (req, res) => {
  try {
    const { date, good, broken, weight, size, batch_id, employee_id } = req.body;

    if (!date || !batch_id || !employee_id) {
      return res.status(400).json({
        error: "date, batch_id, employee_id are required",
      });
    }

    const [batchRows] = await pool.query(
      "SELECT batch_id FROM batch WHERE batch_id = ?",
      [Number(batch_id)]
    );

    if (batchRows.length === 0) {
      return res.status(400).json({
        error: "batch_id นี้ไม่มีอยู่จริงในตาราง batch",
      });
    }

    const [employeeRows] = await pool.query(
      "SELECT employee_id FROM employee WHERE employee_id = ?",
      [Number(employee_id)]
    );

    if (employeeRows.length === 0) {
      return res.status(400).json({
        error: "employee_id นี้ไม่มีอยู่จริงในตาราง employee",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO production
      (production_date, egg_qty, broken_qty, total_weight_egg, egg_size, batch_id, employee_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        date,
        Number(good || 0),
        Number(broken || 0),
        Number(weight || 0),
        size || "S",
        Number(batch_id),
        Number(employee_id),
      ]
    );

    res.status(201).json({
      message: "Production created successfully",
      id: result.insertId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/production/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM production WHERE production_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Production not found" });
    }

    res.json({ message: "Production deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

