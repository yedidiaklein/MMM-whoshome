#!/bin/bash

mkdir state >& /dev/null
cd state

if [ -f $1 ]; then
    # file exists
    if [ $(find $1 -mmin +5) ]; then
        # file is older than 5 minutes
        # Get file's modification time
        file_date=$(stat -c '%Y' "$1")

        # Get current date (YYYY-MM-DD)
        current_date=$(date +%Y-%m-%d)

        # Get file's modification date (YYYY-MM-DD)
        mod_date=$(date -d "@$file_date" +%Y-%m-%d)

        if [ "$mod_date" = "$current_date" ]; then
            # If modified today, show only the hour and minute
            lastseen=`date -d "@$file_date" '+%H:%M'`
        else
            # If modified on a different date, show date and time
            lastseen=`date -d "@$file_date" '+%d.%m %H:%M'`
        fi
        echo -n $lastseen
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
