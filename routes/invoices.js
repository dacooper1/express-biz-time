const express = require("express");
const router = new express.Router();
const db = require("../db")


// **GET /invoices :** Return info on invoices: like `{invoices: [{id, comp_code}, ...]}`
router.get("/", async function(req, res, next) {
    const results = await db.query(`SELECT * FROM invoices`)
    return res.json({invoices: results.rows})
})


// **GET /invoices/[id] :** Returns obj on given invoice.
// If invoice cannot be found, returns 404. Returns `{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}`
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

// **POST /invoices :** Adds an invoice. Needs to be passed in JSON body of: `{comp_code, amt}`
// Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
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


// **PUT /invoices/[id] :** Updates an invoice. If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of `{amt}` Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
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


// **DELETE /invoices/[id] :** Deletes an invoice.If invoice cannot be found, returns a 404. Returns: `{status: "deleted"}` Also, one route from the previous part should be updated:

// **GET /companies/[code] :** Return obj of company: `{company: {code, name, description, invoices: [id, ...]}}` If the company given cannot be found, this should return a 404 status response.

module.exports = router;