# Remote
IR Remote electron.js app to control IR gadgets for example with an arduino 

# What the hack is this?
This simple app sits on the tray and can be toggled to fullscreen. The UI (which is just a bunch of remote control buttons with keyboard shortcuts) is dinamically configurable from settings. The goal of the app is to connect and send simple commands to serial port by the buttons.

# Motivation
This stuff meant to be the controller of a poor mans HDMI-CEC adapter. 
The idea is simple: This is a way of controlling a TV with IR from a low cost HTPC with a cheap microcontroller equipped with serial connection (like an arduino nano).

My original problem was, i realized that most of smart TV-s are not supported very well by manufacturers:
- no updates after 2-3 years (the internet moves on and the user expreicence becomes slower and slower)
- no usable browser
- barely working integrated streaming service apps with bunch of ads and bloatware (not child friendly)
- programming API-s difficult to use
- closed source software (drivers etc.)

My first attempt to work around this problem was the Raspberry Pi3:

Pros: 
- cheap 
- low power
- support for HDMI-CEC: can control TV, but needs some hacking
- HW supported video decoding on desktop with minimal hacking
- real PC like desktop experince

Cons: 
- slow (due to the SD card)
- not enough RAM to use the browser (perhaps on Pi4?)
- even if browser works, no HW VIDEO acceleration available

Second attempt, that lead me here (Gigabyte BRIX GB-BLCE-4000C Barebone PC): 

Pros:
- Comparable cost to RPi4(with adapter and SD card)
- SATA SSD support, RAM upgrade possible
- Passive cooling (quiet)
- Full featured 64bit OS can be run: Ubuntu, Windows, etc...
- real PC like desktop experince
- Browser works well (even with HW VIDEO acceleration)
- ADBlocking easily available (child friendly :) )

Cons:
- no HDMI-CEC available (SMART TV must be turn on/off with the Remote and also the volume must be adjusted this way)
