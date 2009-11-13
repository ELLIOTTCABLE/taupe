var http = require("http"),
     sys = require("sys"),
   redis = require("/Users/elliottcable/Code/src/redis-node-client/redis");

// Can we get this out of the server at runtime somehow?
var ourHost = "127.0.0.1",
    ourPort = 8000;

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
            serverResponse.sendHeader(301, {"Content-Type": "text/plain",
              "Location": "http://"+ourHost+":"+ourPort+"/"+id+"?"});
            serverResponse.sendBody("Tweet exists! Redirecting... ("+username+"@"+id+")\n");
            serverResponse.finish();
          });
        } else {
          serverResponse.sendHeader(404, {"Content-Type": "text/plain"});
          serverResponse.sendBody("Tweet not found!\n");
          serverResponse.finish();
        };
      });
    } else {
      var id = serverRequest.uri.path.slice(1);
      
      redis.get(id, function (username) {
        serverResponse.sendHeader(301, {"Content-Type": "text/plain",
          "Location": "http://"+twitterHost+"/"+username+"/status/"+id});
        serverResponse.sendBody("Tweet exists! Redirecting... ("+username+"@"+id+")\n");
        serverResponse.finish();
      });
    };
  }).listen(ourPort, ourHost);
  
  sys.puts("Server running at http://127.0.0.1:8000/");

  
});
