const express = require("express");
const router = new express.Router();
const db = require("../db")
const users = [];


/** DELETE /users/[id]: delete user, return status */

router.delete("/:id", function(req, res) {
  const idx = users.findIndex(u => u.id === +req.params.id);
  users.splice(idx, 1);
  return res.json({ message: "Deleted" });
});


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
      return next(e); // Pass the error to the error-handling middleware
    }
  });
  


// **POST /companies :** Adds a company. Needs to be given JSON like: `{code, name, description}` Returns obj of new company:  `{company: {code, name, description}}`

// **PUT /companies/[code] :** Edit existing company. Should return 404 if company cannot be found.
// Needs to be given JSON like: `{name, description}` Returns update company object: `{company: {code, name, description}}`

// **DELETE /companies/[code] :** Deletes company. Should return 404 if company cannot be found.
// Returns `{status: "deleted"}`


module.exports = router;