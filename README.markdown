Do you know JavaScript and JQuery?
==================================

If you are a web developer, chances are you are forced to.  After many years of developing web applications I have found it easier to use JavaScript on the client and server.  With fincayra, you don't have to mark up your html templates with special code snippets or attributes.  Your html document gets loaded into a document object (on the server), and you manipulate it similar to using [http://jquery.org/ jQuery].  For example, you can do this with both JQuery in the browser and fincayra on the server..

`$("body").append("<p>Another paragraph</p>");`

This is possible because fincayra uses an awesome project called [jsoup](http://jsoup.org/) and exposes the current page through the [$()](http://fincayra.googlecode.com/svn/trunk/docs/js/files/root-js.html#Request.$) function.  There are some minor differences between jsoup and jQuery of course, but it's close enough, and very powerful.

Fincayra also has built-in persistence through [orientDB](http://code.google.com/p/orient/) and search through [Lucene](http://lucene.apache.org/)!

Check out the [API Docs here!](http://piascikj.github.com/fincayra/docs/js/)

# Getting Started

* [Download the latest release](https://github.com/downloads/piascikj/fincayra/fincayra-0.3.zip).  It comes bundled with jetty and ModeShape.
* Unpack it and, go to the bin directory on the command line and execute the shell script

<pre>
jpiasci:~/tmp/fincayra-0.1.4$ ls
bin  docs  etc  jcr-repo  lib  webapps
jpiasci:~/tmp/fincayra-0.1.4$ cd bin
jpiasci:~/tmp/fincayra-0.1.4/bin$ ./fincayra.sh
</pre>

More to come...
