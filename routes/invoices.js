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
// PUT /invoices/[id] : Updates an invoice. If invoice cannot be found, returns a 404.

router.put("/:id", async function (req, res, next) {
    try {
        const { amt, paid } = req.body;
        let paidDate = null; 

        const currResult = await db.query(
            `SELECT paid, paid_date
             FROM invoices
             WHERE id = $1`,
            [req.params.id]
        );

        if (currResult.rows.length === 0) {
            return res.status(404).json({ error: `Invoice ${req.params.id} not found` });
        }

        const currPaidDate = currResult.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }

        const result = await db.query(
            `UPDATE invoices
             SET amt = $1, paid = $2, paid_date = $3
             WHERE id = $4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, req.params.id]
        );

        return res.json({ invoice: result.rows[0] });

    } catch (e) {
        return next(e);
    }
});

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