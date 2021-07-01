var express = require("express");
var createError = require("http-errors");
var client = require("../db");
var jwt = require("jsonwebtoken");

var router = express.Router();

async function auth(req, res, next) {
  const username = req.query.username || req.body.username; // username could be in query or body
  const { jwt: token } = req.cookies;
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err || username != decoded.usr) {
      return next(createError(401));
    } else {
      return next();
    }
  });
}

router.get("/", auth, async function (req, res, next) {
  let { username, postid } = req.query;
  if (username) {
    try {
      if (postid) {
        postid = parseInt(postid);
        if (isNaN(postid) || postid <= 0) {
          return next(createError(400));
        }
        const post = await client.collection("Posts").findOne({
          username,
          postid,
        });
        if (!post) {
          return next(createError(404));
        }
        res.json(post);
      } else {
        const posts = await client
          .collection("Posts")
          .find({
            username,
          })
          .toArray();
        res.json(
          posts.filter(
            ({ postid, title, body, created, modified }) =>
              postid &&
              title != undefined &&
              body != undefined &&
              created &&
              modified
          )
        );
      }
    } catch (err) {
      console.error(err);
      return next(createError(404));
    }
  } else {
    return next(createError(400));
  }
});

router.delete("/", auth, async function (req, res, next) {
  let { username, postid } = req.query;
  if (username && (postid = parseInt(postid)) > 0) {
    try {
      const deleteResult = await client.collection("Posts").deleteOne({
        username,
        postid,
      });
      if (deleteResult.deletedCount) {
        res.sendStatus(204);
      } else {
        return next(createError(404));
      }
    } catch (err) {
      console.error(err);
      return next(createError(404));
    }
  } else {
    return next(createError(400));
  }
});

router.post("/", auth, async function (req, res, next) {
  let { username, postid, title, body } = req.body;
  if (
    username &&
    (postid = parseInt(postid)) >= 0 &&
    title != undefined &&
    body != undefined
  ) {
    try {
      if (postid == 0) {
        const user = await client.collection("Users").findOne({ username });
        if (user) {
          const { maxid } = user;
          const now = Date.now();
          const insertResult = await client.collection("Posts").insertOne({
            username,
            postid: maxid + 1,
            title,
            body,
            created: now,
            modified: now,
          });
          if (insertResult.insertedCount) {
            const updateResult = await client
              .collection("Users")
              .updateOne({ username }, { $inc: { maxid: 1 } });
            if (updateResult.modifiedCount && updateResult.matchedCount) {
              res
                .status(201)
                .json({ postid: maxid + 1, created: now, modified: now });
            } else {
              // THIS IS REALLY BAD. WE'VE INSERTED A DOCUMENT BUT WERE UNABLE TO CHANGE MAXID OF USER
              console.error(
                `Inserted new post but unable to update maxid for user: ${username}`
              );
              return next(createError(404));
            }
          } else {
            return next(createError(404));
          }
        } else {
          return next(createError(404));
        }
      } else if (postid > 0) {
        const modified = Date.now();
        const query = { username, postid };
        const update = { $set: { title, body, modified } };
        const updateResult = await client
          .collection("Posts")
          .updateOne(query, update);
        if (updateResult.modifiedCount && updateResult.matchedCount) {
          res.json({ modified });
        } else {
          return next(createError(404));
        }
      } else {
        return next(createError(400));
      }
    } catch (err) {
      console.error(err);
      return next(createError(404));
    }
  } else {
    return next(createError(400));
  }
});

module.exports = router;
