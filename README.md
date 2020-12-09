# Remote
IR Remote electron.js app to control IR gadgets for example with an arduino 

# Compile & run (Tested on ubuntu 20.04)

Clone the repository: git clone https://github.com/suletom/Remote

```
cd Remote

sudo apt install nodejs

sudo apt install npm

npm install electron --save-dev 

npm i

#starting the app
npm start

#packager i used for creating binary
npm install electron-packager --save-dev

#to create binary package run:
./node_modules/electron-packager/bin/electron-packager.js . Remote --all

```
For ir sender Arduino example visit:
[https://github.com/suletom/Remote-Arudino](https://github.com/suletom/Remote-Arudino)

# What the hack is this?
This simple app sits on the tray and can be toggled to fullscreen. The UI (which is just a bunch of remote control buttons with keyboard shortcuts) is dynamically configurable from settings. The goal of the app is to connect and send simple commands to serial port by the buttons.

![Remote demo screenshot](https://github.com/suletom/Remote/raw/main/remote.jpg)

# Motivation
This stuff meant to be the controller of a poor mans HDMI-CEC adapter. 
The idea is simple: This is a way of controlling a TV with IR from a low cost HTPC with a cheap microcontroller equipped with serial connection (like an arduino nano).

## 1. My original problem was, i realized that most of smart TV-s are not supported very well by manufacturers:
- no updates after 2-3 years (the internet moves on and the user experience becomes slower and slower)
- no usable browser
- barely working integrated streaming service apps with bunch of ads and bloatware (not child friendly)
- programming API-s difficult to use
- closed source software (drivers etc.)

## 2. My first attempt to work around this problem was the Raspberry Pi3:

Pros: 
- cheap 
- low power
- support for HDMI-CEC: can control TV, but needs some hacking
- HW supported video decoding on desktop with minimal hacking
- real PC like desktop experience

Cons: 
- slow (due to the SD card)
- not enough RAM to use the browser (perhaps on Pi4?)
- even if browser works, no HW VIDEO acceleration available

## 3. Second attempt, that lead me here (Gigabyte BRIX GB-BLCE-4000C Barebone PC): 

Pros:
- comparable cost to RPi4(with adapter and SD card)
- SATA SSD support, RAM upgrade possible
- passive cooling (quiet)
- full featured 64bit OS can be run: Ubuntu, Windows, etc...
- real PC like desktop experience
- browser works well (even with HW VIDEO acceleration)
- ADBlocking easily available (child friendly :) )

Cons:
- no HDMI-CEC available (SMART TV must be turn on/off with the Remote and also the volume must be adjusted this way)

## 4. Finally i decided to get a "USB - CEC Adapter" to solve all problems, but i met with new problems:
- i found only one manufacturer
- no local dealer in our country
- used ones on the market not available
- buying from the states takes months and the final cost with shipping and VAT is comparable to the price of a Raspberry pi 4 :)
- needs software hacking

# Conclusion:
What if i could build a device with the same or perhaps with more functionality?

I found some laying around cheap chinese components:
- an USB cable
- Arduino nano
- IR Led + 1 resistor
- and some wires

More info:
[https://github.com/suletom/Remote-Arudino](https://github.com/suletom/Remote-Arudino)

## By using the following software solution the device satisfies our needs

