const express = require("express");
const router = new express.Router();
const db = require("../db")

router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(`
            SELECT i.code, i.industry, ic.comp_code
            FROM industries AS i
            LEFT JOIN industries_companies AS ic 
            ON i.code = ic.ind_id
        `);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: "No industries found" });
        }

        const industries = results.rows.reduce((acc, row) => {
            const existing = acc.find(ind => ind.code === row.code);
            if (existing) {
                if (row.comp_code) existing.company_codes.push(row.comp_code);
            } else {
                acc.push({
                    code: row.code,
                    industry: row.industry,
                    company_codes: row.comp_code ? [row.comp_code] : []
                });
            }
            return acc;
        }, []);

        return res.json({ industries });
    } catch (e) {
        next(e); 
    }
});
    
    



module.exports = router;