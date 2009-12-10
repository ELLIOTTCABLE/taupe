#!/usr/bin/env node

var http = require("http"),
     sys = require("sys"),
   redis = require("redis");

sys.debug(".. Initializing…");

// redis-node-client *really* needs to be re-implemented with `process.Promise`s <_<
redis.create_client(function (redis) {
  redis.select(9, function(){});
  sys.debug("++ Initialized");
  
  var twitterHost = "twitter.com",
    twitter = http.createClient(80, twitterHost);
  sys.debug("++ Created Twitter client");
  
  http.createServer(function (serverRequest, serverResponse) {
    sys.debug("== New request ==");
    if (serverRequest.uri.path.slice(1).indexOf("/") !== -1) {
      sys.debug("-- (is a URL)");
      var twitterPath = serverRequest.uri.path.slice(1);
          twitterPath = twitterPath
            .indexOf("http://"+twitterHost+"/") === -1 ? twitterPath :
              twitterPath.slice(("http://"+twitterHost+"/").length);
      
      sys.debug(".. Making Twitter request…");
      var clientRequest = twitter
        .get('/' + twitterPath, {"host": twitterHost});
      clientRequest.finish(function (clientResponse) {
        sys.debug("** Twitter request complete");
        if (clientResponse.statusCode === 200 ||
            clientResponse.statusCode === 403) {
          
          var bits = twitterPath.split('/'),
          username = bits[0],
                id = bits[2];
          sys.debug("-- (tweet exists, "+id+" by "+username+")");
          
          sys.debug(".. Storing username in Redis");
          redis.set(id, username, function (result) {
            sys.debug("** Redis request complete! ("+result+")");
            process.stdio.write("↪ "+id+" by @"+username + '\n');
            
            sys.debug(".. Sending response…");
            var response = "http://"+serverRequest.headers.host+"/"+id;
            serverResponse.sendHeader(200, {"Content-Type": "text/plain",
              "Location": response, "Content-Length": (response+"\n").length});
            serverResponse.sendBody(response+"\n");
            serverResponse.finish();
          });
        } else {
          sys.debug("-- (Tweet does not exist, code "+clientResponse.statusCode+")");
          sys.debug(".. Sending response…");
          var response = "Tweet not found!";
          serverResponse.sendHeader(404, {"Content-Type": "text/plain",
            "Content-Length": (response+"\n").length});
          serverResponse.sendBody(response+"\n");
          serverResponse.finish();
        };
      });
    } else {
      sys.debug("-- (is an ID)");
      var id, rawId = serverRequest.uri.path.slice(1);
      if (rawId.slice(0, 2) === '0z') {
        id = parseInt(rawId.slice(2, rawId.length), 36).toString(10) }
      else {
        id = parseInt(rawId, null).toString(10) };
      
      sys.debug(".. Getting username from Redis");
      redis.get(id, function (username) {
        sys.debug("** Redis request complete! ("+username+")");
        process.stdio.write(rawId+" ("+id+") → @"+username + '\n');
        
        if (username !== null) {
          sys.debug("-- (username is existent)");
          if (serverRequest.uri.full.indexOf("?") !== -1) {
            var status = 200 } else { var status = 301 };
          
          sys.debug(".. Sending response…");
          var response = "http://"+twitterHost+"/"+username+"/status/"+id;
          serverResponse.sendHeader(status, {"Content-Type": "text/plain",
            "Location": response, "Content-Length": (response+"\n").length});
          serverResponse.sendBody(response+"\n");
          serverResponse.finish();
        } else {
          sys.debug("-- (username is non-existent)");
          sys.debug(".. Sending response…");
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
