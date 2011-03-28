 @echo off
 @set JVM_OPTS=-Xms512m -Xmx512m -Djava.net.preferIPv4Stack=true 
 (cd .. && java %JVM_OPTS% -jar lib/start-6.1.25.jar)
