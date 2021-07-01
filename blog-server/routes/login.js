var express = require("express");
var createError = require("http-errors");
var bcrypt = require("bcryptjs");
var client = require("../db");
var jwt = require("jsonwebtoken");

var router = express.Router();

router.get("/", async function (req, res, next) {
  const { redirect } = req.query;
  res.render("login", { redirect });
});

router.post("/", async function (req, res, next) {
  const { username, password, redirect } = req.body;
  if (username && password) {
    try {
      const user = await client.collection("Users").findOne({ username });
      if (user) {
        const { password: hash } = user;
        bcrypt.compare(password, hash, (err, auth) => {
          if (auth) {
            const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // add two hour's worth of seconds to now
            jwt.sign(
              { exp: expiration, usr: username },
              process.env.SECRET_KEY,
              (err, token) => {
                if (err) {
                  return next(createError(401));
                } else {
                  res.cookie("jwt", token, {
                    /* httpOnly: true, secure: true */
                  });
                  if (redirect) {
                    res.redirect(redirect);
                  } else {
                    res.send("Authentication successful");
                  }
                }
              }
            );
          } else {
            return next(createError(401));
          }
        });
      } else {
        return next(createError(401));
      }
    } catch (err) {
      console.error(err);
      return next(createError(401));
    }
  } else {
    return next(createError(401));
  }
});

module.exports = router;
