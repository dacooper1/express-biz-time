const express = require("express");
const router = new express.Router();
const db = require("../db")
const users = [];


// Returns list of companies
router.get("/", async function(req, res, next) {
    try { 
        const results = await db.query(`SELECT * FROM companies;`)
        return res.json({companies: results.rows});
    } catch(e) {
        return next(e)
    }
  });


// Returns obj of the company. If the company given cannot be found, returns a 404 status response.
router.get("/:code", async function (req, res, next) {
    try {
      const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code]);
  
      if (results.rows.length === 0) {
        // If no company is found, return 404
        return res.status(404).json({ error: "Company not found" });
      }
      // If company is found, return the result
      return res.json({ company: results.rows[0] });
    } catch (e) {
      return next(e); 
    }
  });
  

// Adds a company. Returns obj of new company.
router.post("/", async function (req, res, next) {
    try { 
        const {code, name, description} = req.body 
         // Ensure the required fields are provided
         if (!code || !name || !description) {
            return res.status(400).json({ error: "Missing required fields: code, name, description" });
        }

        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description])
        return res.status(201).json(results.rows[0]);
    } catch (e) {
        return next(e)
    }
})

// Edit existing company. Returns 404 if company cannot be found. Returns update company object: `{company: {code, name, description}}`
router.put("/:code", async function (req, res, next) {
    try {
        const { name, description } = req.body;

        // Ensure the required fields are provided
        if (!name || !description) {
            return res.status(400).json({ error: "Missing required fields: name, description" });
        }

        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
            [name, description, req.params.code]
        );

        // Handle case where the company is not found
        if (results.rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        return res.status(200).json({ company: results.rows[0] });
    } catch (e) {
        return next(e); 
    }
});


// Deletes company. Returns 404 if company cannot be found.Returns `{status: "deleted"}`
router.delete("/:code", async function (req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM companies WHERE code=$1`,
            [req.params.code]
        );

        // Check if the company exists
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Successful deletion
        return res.status(200).json({ status: "deleted" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;