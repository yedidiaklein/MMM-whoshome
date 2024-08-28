#!/bin/bash

mkdir state >& /dev/null
cd state

if [ -f $1 ]; then
    # file exists
    if [ $(find $1 -mmin +5) ]; then
        # file is older than 5 minutes
        echo -n 0
        exit 0
    else
        # file is newer than 5 minutes
        echo -n 1
        exit 0
    fi
else
    echo -n 0
    exit 0
fi

# should never get here..
exit 0
