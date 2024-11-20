const express = require("express");
const router = new express.Router();
const db = require("../db")


// **GET /invoices :** Return info on invoices: like `{invoices: [{id, comp_code}, ...]}`
router.get("/", async function(req, res, next) {
    const results = await db.query(`SELECT * FROM invoices`)
    return res.json({invoices: results.rows})
})

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

// **GET /invoices/[id] :** Returns obj on given invoice.
// If invoice cannot be found, returns 404. Returns `{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}`

// **POST /invoices :** Adds an invoice. Needs to be passed in JSON body of: `{comp_code, amt}`
// Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

// **PUT /invoices/[id] :** Updates an invoice. If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of `{amt}` Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

// **DELETE /invoices/[id] :** Deletes an invoice.If invoice cannot be found, returns a 404. Returns: `{status: "deleted"}` Also, one route from the previous part should be updated:

// **GET /companies/[code] :** Return obj of company: `{company: {code, name, description, invoices: [id, ...]}}` If the company given cannot be found, this should return a 404 status response.

module.exports = router;