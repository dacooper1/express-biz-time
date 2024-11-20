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


// **GET /companies :** Returns list of companies, like `{companies: [{code, name}, ...]}`

router.get("/", async function(req, res, next) {
    try { 
        const results = await db.query(`SELECT * FROM companies;`)
        return res.json({companies: results.rows});
    } catch(e) {
        return next(e)
    }
  });

// **GET /companies/[code] :** Return obj of company: `{company: {code, name, description}}`
// If the company given cannot be found, this should return a 404 status response.

// **POST /companies :** Adds a company. Needs to be given JSON like: `{code, name, description}` Returns obj of new company:  `{company: {code, name, description}}`

// **PUT /companies/[code] :** Edit existing company. Should return 404 if company cannot be found.
// Needs to be given JSON like: `{name, description}` Returns update company object: `{company: {code, name, description}}`

// **DELETE /companies/[code] :** Deletes company. Should return 404 if company cannot be found.
// Returns `{status: "deleted"}`


module.exports = router;