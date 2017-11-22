var express = require("express");
var app = require("express")();
var http = require("http").Server(app);

app.set("port", (process.env.PORT || 8080));

app.use(express.static("./client"));

app.get("/", function(req, res){
  res.sendFile("./client/index.html");
});

http.listen(app.get("port"), function() {
	console.log("Server listening on port " + app.get("port"));
	console.log();
});