var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
    res.send("API is working properl");
});

router.get("/add", function (req, res, next) {
    res.send("Pour faire une requete get");
});

module.exports = router;
