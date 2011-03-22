 @echo off
 @set JVM_OPTS=-Xms512m -Xmx512m
 (cd .. && java %JVM_OPTS% -jar lib/start-6.1.25.jar)
