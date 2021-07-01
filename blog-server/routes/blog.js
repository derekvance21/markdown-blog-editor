var express = require("express");
var createError = require("http-errors");
var commonmark = require("commonmark");
var client = require("../db");

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
var router = express.Router();

const dateOptions = { year: "numeric", month: "long", day: "numeric" };

/* GET home page. */
router.get("/:username", async function (req, res, next) {
  let {
    params: { username },
    query: { start },
  } = req;
  start = parseInt(start);
  if (start && start <= 0) {
    return next(createError(400));
  }
  try {
    const cursor = await client.collection("Posts").find({
      username,
      postid: { $gte: parseInt(start) || 0 },
    });

    const count = await cursor.count();
    if (!count) {
      return next(createError(404));
    }

    let posts = await cursor.limit(5).toArray();

    const next_start =
      count > 5
        ? 1 +
          posts.reduce((max, { postid }) => (postid > max ? postid : max), 0)
        : undefined;

    posts = posts.map(({ created, modified, title, body, postid }) => ({
      created: new Date(created).toLocaleDateString(undefined, dateOptions),
      modified: new Date(modified).toLocaleDateString(undefined, dateOptions),
      title: writer.render(reader.parse(title)),
      body: writer.render(reader.parse(body)),
      postid,
    }));

    res.render("user", { username, posts, next_start });
  } catch (error) {
    console.error(error);
    return next(createError(404));
  }
});

router.get("/:username/:postid", async function (req, res, next) {
  let { username, postid } = req.params;

  if (!(postid = parseInt(postid))) {
    return next(createError(400));
  }

  try {
    const post = await client.collection("Posts").findOne({
      username,
      postid,
    });

    if (!post) {
      return next(createError(404));
    }

    const { created, modified, title, body } = post;
    res.render("post", {
      created: new Date(created).toLocaleDateString(undefined, dateOptions),
      modified: new Date(modified).toLocaleDateString(undefined, dateOptions),
      title: writer.render(reader.parse(title)),
      body: writer.render(reader.parse(body)),
      username,
    });
  } catch (err) {
    console.error(err);
    return next(createError(404));
  }
});

module.exports = router;
