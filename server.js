#!/usr/bin/env node

var http = require("http"),
     sys = require("sys"),
   redis = require("redis");

// redis-node-client *really* needs to be re-implemented with `process.Promise`s <_<
redis.create_client(function (redis) {
  redis.select(9, function(){});
  
  var twitterHost = "twitter.com",
   twitter = http.createClient(80, twitterHost);
  
  http.createServer(function (serverRequest, serverResponse) {
    var index = serverRequest.uri.path.indexOf("/http://" + twitterHost);
    if (index !== -1) {
      var twitterPath = serverRequest.uri.path.slice(index + ("/http://" + twitterHost).length);
      
      var clientRequest = twitter.get(twitterPath, {"host": twitterHost});
      clientRequest.finish(function (clientResponse) {
        if (clientResponse.statusCode === 200 ||
            clientResponse.statusCode === 403) {
          
          var bits = twitterPath.split('/'),
          username = bits[1],
                id = bits[3];
          
          redis.set(id, username, function (result) {
            var response = "http://"+serverRequest.headers.host+"/"+id;
            serverResponse.sendHeader(200, {"Content-Type": "text/plain",
              "Location": response, "Content-Length": (response+"\n").length});
            serverResponse.sendBody(response+"\n");
            serverResponse.finish();
          });
        } else {
          var response = "Tweet not found!";
          serverResponse.sendHeader(404, {"Content-Type": "text/plain",
            "Content-Length": (response+"\n").length});
          serverResponse.sendBody(response+"\n");
          serverResponse.finish();
        };
      });
    } else {
      var id = serverRequest.uri.path.slice(1);
      
      redis.get(id, function (username) {
        if (username !== null) {
          if (serverRequest.uri.full.indexOf("?") !== -1) {
            var status = 200 } else { var status = 301 };
          
          var response = "http://"+twitterHost+"/"+username+"/status/"+id;
          serverResponse.sendHeader(status, {"Content-Type": "text/plain",
            "Location": response, "Content-Length": (response+"\n").length});
          serverResponse.sendBody(response+"\n");
          serverResponse.finish();
        } else {
          var response = "ID not stored!";
          serverResponse.sendHeader(404, {"Content-Type": "text/plain",
            "Content-Length": (response+"\n").length});
          serverResponse.sendBody(response+"\n");
          serverResponse.finish();
        };
      });
    };
  }).listen(process.ARGV[2]);
});
