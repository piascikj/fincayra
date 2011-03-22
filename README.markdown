# Do you know {{{JavaScript and JQuery}}}?
If you are a web developer, chances are you are forced to.  Then why not use it on the server too?  You don't have to mark up your html templates with special code snippets or attributes.  Your html document gets loaded into a document object (on the server), and you manipulate it similar to using [http://jquery.org/ jQuery].  For example, you can do this with both JQuery in the browser and fincayra on the server..

`$("body").append("<p>Another paragraph</p>");`

This is possible because fincayra uses an awesome project called [http://jsoup.org/ jsoup] and exposes the current page through the [$()](http://fincayra.googlecode.com/svn/trunk/docs/js/files/root-js.html#Request.$) function.  There are some minor differences between jsoup and jQuery of course, but it's close enough, and very powerful.

Fincayra also has a built-in persistence framework that uses [http://www.jboss.org/modeshape JBoss ModeShape] as it's object-store but if you have your own DB go ahead and use it.

Check out the [API Docs here!](http://fincayra.googlecode.com/svn/trunk/docs/js/index.html)

# Getting Started

* Download the [http://code.google.com/p/fincayra/downloads/list latest release].  It comes bundled with jetty and ModeShape.
* Unpack it and, go to the bin directory on the command line and execute the shell script

`jpiasci:~/tmp/fincayra-0.1.4$ ls
bin  docs  etc  jcr-repo  lib  webapps
jpiasci:~/tmp/fincayra-0.1.4$ cd bin
jpiasci:~/tmp/fincayra-0.1.4/bin$ ./fincayra.sh`

More to come...
