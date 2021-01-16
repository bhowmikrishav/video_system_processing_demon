# video_system_processing_demon
System connected to remort internet connection, meant to perfrom CRON jobs which process video files to streamble chunks of multiple resolution

### FFMPEG commands

I like this one, all clips start from duration, where their preceding clip ends

Like

```
###             clip0
___###          clip1
______##        clip2
________###     clip3
```

```
./ffmpeg -i pride.mp4 -c:v libvpx-vp9 -crf 30 -b:v 2000k -map 0 -segment_time 00:00:05 -f segment output%03d.webm
```