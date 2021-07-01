var express = require("express");
var createError = require("http-errors");
var jwt = require("jsonwebtoken");

var router = express.Router();

router.get("/", async function (req, res, next) {
  const { jwt: token } = req.cookies;
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      res.redirect("/login?redirect=/editor/");
    } else {
      next();
    }
  });
});

module.exports = router;
