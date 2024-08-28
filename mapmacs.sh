#!/bin/bash

# first check if this script is running now and exit if so
if [ $(ps -ef | grep -v grep | grep $0 | wc -l) -gt 3 ]; then exit 0; fi

mkdir state >& /dev/null
cd state

# get the network address, this way isn't perfect, but it works for most cases.
network=$(ip route | grep default | awk ' { print $3 }'| awk -F'[./]' '{print $1"."$2"."$3".0"}')/24

# if your network isn't typical, you can set the network here manually:
# network=192.168.100.128/28

if [ "$#" -lt 1 ]; then echo Usage example: $0 aa:bb:cc:dd:ee:ff; exit 2; fi;
    # nmap -sP -T4 $network >& /dev/null
    nmap -sn $network >& /dev/null
    # loop over mac addresses that were given on the command line
    for mac in $*; do
        ip=$(arp -n | grep $mac | awk ' { print $1 }')
        if [ -n "$ip" ]; then
            # ping the ip address
            ping $ip -n -q -c 2 -i 0.2 -w 1 >& /dev/null
            # if the ping was successful
            if [ $? -eq 0 ]; then
                touch $mac
            else
                # if the ping was not successful
                rm -f $mac
            fi
        fi
    done
cd ..
exit 0

