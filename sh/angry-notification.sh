#!/bin/bash
logs=/tmp/angry
echo "`date`" >> $logs
curse=$(curl -s 'http://www.dvlcube.com/curse')

emoji=$(echo "$curse" | xmlstarlet sel -t -v '//h1' -n)
text=$(echo "$curse" | xmlstarlet sel -t -v '//h2' -n | tr -d '\n' |  tr -s ' ')

/usr/bin/notify-send "$emoji" "$text"
echo "$emoji $text" >> $logs
