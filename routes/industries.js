const express = require("express");
const router = new express.Router();
const db = require("../db")

// View list if industries and associated company codes
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


// Create new industry and associate it with a company
router.post("/", async function (req, res, next) {
    try {
        const { code, industry, company_code } = req.body;

        // Validate required fields
        if (!code || !industry) {
            return res.status(400).json({ error: "Missing required fields: code, industry" });
        }

        // Check if the industry already exists
        const existingIndustry = await db.query(
            `SELECT code FROM industries WHERE code = $1`,
            [code]
        );

        if (existingIndustry.rows.length > 0) {
            // Industry exists, only add the company code if provided
            if (company_code) {
                const companyAssociation = await db.query(
                    `INSERT INTO industries_companies (ind_id, comp_code) 
                     VALUES ($1, $2) 
                     ON CONFLICT DO NOTHING 
                     RETURNING ind_id, comp_code`,
                    [code, company_code]
                );

                // If the association already exists, inform the user
                if (companyAssociation.rows.length === 0) {
                    return res.status(409).json({
                        message: "Company code is already associated with the industry",
                    });
                }

                return res.json({
                    message: "Company code added to the existing industry",
                    industry: { code, company_code },
                });
            } else {
                return res.json({ message: "Industry already exists, no company code provided" });
            }
        } else {
            // Industry does not exist, create it
            const industryResult = await db.query(
                `INSERT INTO industries (code, industry) 
                 VALUES ($1, $2) 
                 RETURNING code, industry`,
                [code, industry]
            );

            const newIndustry = industryResult.rows[0];

            if (company_code) {
                const companyAssociation = await db.query(
                    `INSERT INTO industries_companies (ind_id, comp_code) 
                     VALUES ($1, $2) 
                     RETURNING ind_id, comp_code`,
                    [code, company_code]
                );

                newIndustry.company_code = companyAssociation.rows[0].comp_code;
            }

            return res.json({ industry: newIndustry });
        }
    } catch (e) {
        next(e); // Pass error to the global error handler
    }
});

    
    



module.exports = router;