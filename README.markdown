taupe
=====
… is a tiny [Twitter][] status ID server.

When you visit
<http://tau.pe/http://twitter.com/elliottcable/status/5680923477>,
taupe becomes aware of the location of the Twitter status with an ID of
‘5680923477.’ Subsequent visits to <http://tau.pe/5680923477> will redirect
with an HTTP status code of 301 (“permanent redirect”) to
<http://twitter.com/elliottcable/status/5680923477>.

taupe is backed by [Node.js][] and [Redis][]. I wrote it at [Village Inn][].
Well, mostly… my battery died. It took about twenty songs on [Grooveshark][] to
write.

But yeah, it’s a pretty cool guy.

  [Twitter]: <http://twitter.com/>
    "Do I seriously need to have an explanatory title for Twitter? Come on."
  [Node.js]: <http://nodejs.org/> "JavaScript. On your server. Bein’ awesome."
  [Redis]: <http://code.google.com/p/redis/>
    "Redis, the coolest key-value store EVAR!"
  [Village Inn]: <http://villageinn.com/> "Local 24-hour diner of yum."
  [Grooveshark]: <http://grooveshark.com/> "Music."
