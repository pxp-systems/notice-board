# About 
This project produces a raspberry pi static website that is used in a rugby club to have a carousel display of a dozen images. The images will be upcoming events, club notices, scores, and a few select photos.

The raspberry pi will be plugged into a tv, and display the carousel.

We want to have a simple but secure way of uploading new content. Ideally this would run a pipeline that helps to prepare the images so that they display optimally on the tv. 

# Getting PI set up to be supportable
## Install no-ip
### 1. Install the No-IP Dynamic Update Client on Raspberry Pi
``` 
sudo apt-get update
sudo apt-get upgrade
```
### 2. Download the No-IP Client
```
cd /usr/local/src
sudo wget http://www.no-ip.com/client/linux/noip-duc-linux.tar.gz
```
### 3. Extract the Files
```
sudo tar xf noip-duc-linux.tar.gz
```
### 4. Navigate to the No-IP Client Directory
```
cd noip-2.1.9-1/
```
### 5. Compile and install
```
sudo make install
```
### 6. Configure the Client
```
sudo /usr/local/bin/noip2 -C
```
## Startup scripts
### 7. sudo nano /etc/init.d/noip2
```
sudo nano /etc/init.d/noip2
```
### 8. Add This Script
```
#! /bin/sh
# /etc/init.d/noip2

case "$1" in
  start)
    echo "Starting noip2."
    /usr/local/bin/noip2
  ;;
  stop)
    echo "Stopping noip2."
    killall noip2
  ;;
  *)
    echo "Usage: /etc/init.d/noip2 {start|stop}"
    exit 1
  ;;
esac

exit 0
```
## Get NVM working
### 7. sudo nano /etc/init.d/noip2
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```
```
source ~/.bashrc
```
