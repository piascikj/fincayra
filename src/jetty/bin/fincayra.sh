export JVM_OPTS='-Xms1024m -Xmx1024m'
stop=""

if [ "$1" = "stop" ] ; then
	stop=" --stop"
fi

cd ..
java $JVM_OPTS -Djava.net.preferIPv4Stack=true -DSTOP.PORT=8079 -DSTOP.KEY=fincayra -jar lib/start-6.1.25.jar$stop
