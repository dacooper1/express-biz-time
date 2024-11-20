const express = require("express");
const router = new express.Router();
const db = require("../db")


// Return info on invoices.
router.get("/", async function(req, res, next) {
    const results = await db.query(`SELECT * FROM invoices`)
    return res.json({invoices: results.rows})
})


//Returns obj on given invoice.
router.get("/:id", async function(req, res, next) {
    try {
       const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [req.params.id])

        if (results.rows.length === 0) {
        // If no invoice is found, return 404
        return res.status(404).json({ error: "Invoice not found" });
        }
        // If invoice is found, return the result
        return res.json({ invoice: results.rows[0] }); 
    } catch(e) {
        return next(e)
    }
})


//Adds an invoice. 
router.post("/", async function(req, res, next) {
    try {
        const {comp_code, amt} = req.body;

         // Ensure the required fields are provided
         if (!comp_code|| !amt) {
            return res.status(400).json({ error: "Missing required fields: comp_code, amt" });
        }

        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        
        return res.json({invoice : results.rows[0]})
    } catch (e) {
        return next(e)
    }
})


// Updates an invoice. If invoice cannot be found, returns a 404.
router.put("/:id", async function(req, res, next) {
    try {
        const {amt} = req.body
        // Ensure the required fields are provided
         if (!amt) {
            return res.status(400).json({ error: "Missing required field: amt" });
        }

        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, req.params.id])

        // Handle case where the invoice is not found
        if (results.rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        return res.status(200).json({ company: results.rows[0] });        

    } catch (e) {
        next(e)
    }
})


// Deletes an invoice. If invoice cannot be found, returns a 404. Returns: `{status: "deleted"}` 
router.delete("/:id", async function(req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM invoices WHERE id=$1 RETURNING *`,
            [req.params.id]
        );

        // Check if the company exists
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Successful deletion
        return res.status(200).json({ status: "deleted" });
    } catch (e) {
        return next(e);
    }
})


module.exports = router;