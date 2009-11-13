var http = require("http"),
     sys = require("sys");

var host    = "twitter.com",
    twitter = http.createClient(80, host);

http.createServer(function (serverRequest, serverResponse) {
  var index = serverRequest.uri.path.indexOf("/http://" + host);
  if (index !== -1) {
    sys.puts("Slicing at " + (index + ("/http://" + host).length));
    var twitterPath = serverRequest.uri.path.slice(index + ("/http://" + host).length);
    sys.puts("Requesting " + twitterPath);
    
    var clientRequest = twitter.get(twitterPath, {"host": host});
    clientRequest.finish(function (clientResponse) {
      if (clientResponse.statusCode === 200 ||
          clientResponse.statusCode === 403) {
        serverResponse.sendHeader(200, {"Content-Type": "text/plain"});
        serverResponse.sendBody("Tweet exists!\n");
        serverResponse.finish();
      } else {
        serverResponse.sendHeader(404, {"Content-Type": "text/plain"});
        serverResponse.sendBody("Tweet not found!\n");
        serverResponse.finish();
      };
    });
  } else {
    serverResponse.sendHeader(200, {"Content-Type": "text/plain"});
    serverResponse.sendBody("Not a Twitter URL... not yet implemented /-:\n");
    serverResponse.finish();
  };
}).listen(8000);

sys.puts("Server running at http://127.0.0.1:8000/");