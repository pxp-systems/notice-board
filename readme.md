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
### 7. edit script
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
## Get NVM / Node working
### 9. NVM
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```
```
source ~/.bashrc
```
### 10. Node
```
sudo install node
```
## Install app
```
sudo git clone https://github.com/pxp-systems/notice-board
cd notice-board/
sudo npm install
sudo chown -R user:group /notice-board

```

____
# Other useful startups
``` 
sudo nano ~/startup_script.sh
```

```
#!/bin/bash
export PATH=$PATH:/home/admin/.nvm/versions/node/v22.0.0/bin/node
export DISPLAY=:0
cd ~/notice-board
npm start
firefox --kiosk http://localhost:3000 &
```

```
chmod +x ~/startup_script.sh
```
```
nano ~/.xinitrc
```
```
xset s off         # don't activate screensaver
xset -dpms         # disable DPMS (Energy Star) features
xset s noblank     # don't blank the video device
```

```
sudo nano /etc/systemd/system/startup-script.service
```

```
[Unit]
Description=Start my custom startup script
After=multi-user.target

[Service]
Type=simple
User=pi
ExecStart=/bin/bash /home/pi/startup_script.sh

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
```

```
sudo systemctl enable startup-script.service
```
