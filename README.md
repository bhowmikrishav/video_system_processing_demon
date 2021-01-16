# video_system_processing_demon
System connected to remort internet connection, meant to perfrom CRON jobs which process video files to streamble chunks of multiple resolution

## FFMPEG commands

I like this one, all clips start from duration, where their preceding clip ends

#### Like

```
###             clip0
___###          clip1
______##        clip2
________###     clip3
```

#### Command

```sh
ffmpeg -i pride.mp4 -c:v libvpx-vp9 -crf 30 -b:v 2000k -map 0 -segment_time 00:00:05 -f segment output%03d.webm
```

```sh
ffmpeg -i pride.mp4 -c:v libvpx-vp9 -crf 30 -b:v 2000k -map 0 -segment_time 00:00:05 -f segment output%d.webm
```

#### Probe result of output001.webm

```
[Video Stream]
codec_name=vp9
codec_long_name=Google VP9
coded_width=1920
coded_height=800
display_aspect_ratio=12:5
start_time=5.346000
pix_fmt=yuv420p
ENCODER=Lavc58.112.101 libvpx-vp9
DURATION=00:00:10.685000000

[Audio Stream]
codec_name=opus
codec_long_name=Opus (Opus Interactive Audio Codec)
channel_layout=stereo
ENCODER=Lavc58.112.101 libopus
DURATION=00:00:10.700000000
start_time=5.353000
```

## FFMPEG installation

#### Ubuntu

```sh
sudo apt update
sudo apt install ffmpeg
ffmpeg -version
```
