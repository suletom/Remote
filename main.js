const APPNAME = "Remote";
const { app, BrowserWindow, Tray, nativeImage, Menu, globalShortcut, ipcMain, serialport } = require('electron')
const fs = require('fs');
const AutoLaunch = require("auto-launch");
const notifier = require('node-notifier');
const electronLocalshortcut = require('electron-localshortcut');

var autoLauncher = new AutoLaunch({
  name: APPNAME
});

app.allowRendererProcessReuse = false;

const settingspath = app.getPath('userData') + "/userconfig.json";

let win = null;

function saveconfig(data) {

  try {
    fs.writeFileSync(settingspath, JSON.stringify(data));

  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

function readconfig() {
  let userconfig = {};

  console.log("Reading config from: " + settingspath);
  try {
    userconfig = JSON.parse(fs.readFileSync(settingspath));

  } catch (error) {
    console.log(error);
  }

  var configdef = {
    'serialdevs': { 'label': 'Serial Devices to try', 'type': 'input', 'default': '/dev/ttyUSB0,/dev/ttyUSB1,/dev/ttyACM0,/dev/ttyACM1' },
    'autostart': { 'label': 'Start automatically', 'type': 'yesno', 'default': 0 },
    'showhide': { 'label': 'Show/Hide shortcut (Requires restart!)', 'type': 'keycode', 'default': 'Alt+A' },
    'css': { 'label': 'CSS', 'type': 'textarea', 'default': '' },
    'buttons': {
      'label': 'Buttons', 'type': 'buttons', 'default':
        [{ "name": "POWER", "action": "RC6:12", "key": "Alt+Q", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "CH UP", "action": "RC6:32", "key": "PageUp", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "CH DOWN", "action": "RC6:33", "key": "PageDown", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "VOL UP", "action": "RC6:16", "key": "Ctrl+Up", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "VOL DOWN", "action": "RC6:17", "key": "Ctrl+Down", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "UP", "action": "RC6:88", "key": "Up", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "DOWN", "action": "RC6:89", "key": "Down", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "LEFT", "action": "RC6:90", "key": "Left", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "RIGHT", "action": "RC6:91", "key": "Right", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "OK", "action": "RC6:92", "key": "Enter", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "HOME", "action": "RC6:84", "key": "Home", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "BACK", "action": "RC6:10", "key": "Backspace", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "SOURCES", "action": "RC6:56", "key": "S", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "INFO", "action": "RC6:15", "key": "I", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "MUTE", "action": "RC6:13", "key": "M", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "PIP", "action": "RC6:87", "key": "P", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "SETTINGS", "action": "RC6:64", "key": "B", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "0", "action": "RC6:0", "key": "0", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "1", "action": "RC6:1", "key": "1", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "2", "action": "RC6:2", "key": "2", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "3", "action": "RC6:3", "key": "3", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "4", "action": "RC6:4", "key": "4", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "5", "action": "RC6:5", "key": "5", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "6", "action": "RC6:6", "key": "6", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "7", "action": "RC6:7", "key": "7", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "8", "action": "RC6:8", "key": "8", "global": '0', 'wakeup': '0', 'runcmd': '' },
        { "name": "9", "action": "RC6:9", "key": "9", "global": '0', 'wakeup': '0', 'runcmd': '' }]
    },
  };

  for (let i in configdef) {
    if (userconfig[i] !== undefined && userconfig[i]['value'] !== undefined && userconfig[i]['value'] !== "") {
      configdef[i]['value'] = userconfig[i]['value'];
    } else {
      configdef[i]['value'] = configdef[i]['default'];
    }
  }

  autoLauncher.isEnabled().then(function (isEnabled) {
    if (isEnabled) {
      if (configdef['autostart']['value'] == 0) {
        autoLauncher.disable();
      }

    } else {

      if (configdef['autostart']['value'] == 1) {
        autoLauncher.enable();
      }

    }

  }).catch(function (err) {
    throw err;
  });


  return configdef;
}

function registershortcuts(config) {

  globalShortcut.unregisterAll();
  if (win !== null) {
    electronLocalshortcut.unregisterAll(win);
  }

  try {

    globalShortcut.register(config['showhide']['value'], () => {
      win.isVisible() ? win.hide() : win.show();
    });

  } catch (error) {
    console.log("Error while registering shortcuts! " + error);
  }

  for (let j = 0; j < config['buttons']['value'].length; j++) {

    //console.log(config['buttons']['value'][j]['key']);

    if (config['buttons']['value'][j]['global'] == 1) {
      //console.log("Registering global shortcut: " + config['buttons']['value'][j]['key'] + " for " + config['buttons']['value'][j]['name']);

      try {

        globalShortcut.register(config['buttons']['value'][j]['key'], () => {
          
            win.webContents.send("initiate-keypress", config['buttons']['value'][j]['key']);

        });

      } catch (error) {
        console.log("Error while registering shortcuts! " + config['buttons']['value'][j]['name'] + " -> " + error);
      }

    } else {

      //console.log("Registering local shortcut: " + config['buttons']['value'][j]['key'] + " for " + config['buttons']['value'][j]['name']);

      try {

        electronLocalshortcut.register(win, config['buttons']['value'][j]['key'], () => {
          win.webContents.send("initiate-keypress", config['buttons']['value'][j]['key']);
        });

      } catch (error) {
        console.log("Error while registering shortcuts! " + config['buttons']['value'][j]['name'] + " -> " + error);
      }
    }
  };

}

function createWindow() {

  let config = readconfig();

  // Object
  notifier.notify({
    title: APPNAME,
    message: "Successfully started!",
    timeout: 2
  });

  win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.hide();

  win.loadFile('index.html');

  registershortcuts(config);

  appIcon = new Tray(nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGiSURBVFiF7dW/alRBFAbw3y5RRESIlibZBINCULTRIg8Qy/gCaSxSSAQrCx/AQhArC0uLVDYWdmKhKDYpTGEgVQTBLgGDoojkWsxZE5NdsnNHcgvzwWGGmfPnm5kz5/C/o4VruNxQ/OUWvuF4QwR+tlBhHXcPOPg9nBYE1g44uIhZtRsI/BcOCQwV2J5BJ+Yf8bmuo5wkPIpbWAm7nfIBC6EzCNbCbmACHSyH/hbeYzGku17FeqePjyICS6H7AlM99i/gZei8HpRATg48xBjuSyd8hOnYe4sHmMFtfMrwm12IrmLT3hz4gksZfmoXohEckW5iBKMxb0k/Ixt1SnH36aZs50PuYbJzYCd+xfhUuo1z0s/IRkkhgpuF9sUEXpUSKO0F4yG1UXoDz6UkvtgUgTtBoDa6BNoYrmH/LsY6tm1S8diKsQlUQ3iMK30UTuA8NuQXqwmcwiq+9tF5s5+TaemNFzODC5vKdsPqiV5JeAzXcRJnY20S85kEJmOclVr1Jp7hx36Gc/Z2un8lc7uD9Uq+YdxQ/kV34zueSG37EH/wG+jpcnxe7uA6AAAAAElFTkSuQmCC'));
  appIcon.setContextMenu(Menu.buildFromTemplate([
    {
      label: "Show/hide (" + config['showhide']['value'] + ")", click: (item, window, event) => {
        if (win.isVisible()) {
          win.hide()
        }else{
          win.show()
          win.focus();
        }
      }
    },

    { type: "separator" },
    { role: "quit" }, // "role": system prepared action menu
  ]));

  ipcMain.on('request-toggle', (event, arg) => {
    if (win.isVisible()) {
      win.hide()
    }else{
      win.show()
      win.focus();
    }
  });

  win.webContents.openDevTools();

  ipcMain.on('devtools-toggle', (event, arg) => {

    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools();
    }

  });

  ipcMain.handle('read-config', (event, arg) => {
    return config;
  });

  ipcMain.on('save-config', (event, arg) => {
    let ret = saveconfig(arg);
    if (ret) config = readconfig();
    //re apply config here -> this updates the ui
    registershortcuts(config);
    win.webContents.send("rerender");
    return ret;
  });

  var lastTime = (new Date()).getTime();

  setInterval(function () {
    var currentTime = (new Date()).getTime();
    if (currentTime > (lastTime + 2000 * 3)) {
      win.webContents.send("initiate-keypress", "event-wakeup");
    }
    lastTime = currentTime;
  }, 2000);

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})