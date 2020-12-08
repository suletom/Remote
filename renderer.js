const { ipcRenderer, app } = require('electron');
const serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
const fs = require('fs');
const { COPYFILE_FICLONE_FORCE } = require('constants');
const { shell } = require('electron');
let spawn = require("child_process").spawn;

let portstatus = [];
let sendretry = null;
let keycommand = null;
let ports = []



ipcRenderer.on('initiate-keypress', function (event, message) {
  console.log("initiate-keypress called! " + message);
  handlekey({ 'key': message });
});



ipcRenderer.on('rerender', function (event, message) {
  console.log("rerender called!");
  renderui();
});

document.addEventListener('DOMContentLoaded', function () {

  $(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
  });

  renderwin();

}, false);

async function renderui(config) {

  if (config == null || config == undefined) {
    config = await ipcRenderer.invoke('read-config');
    console.log("reread config:");
    console.log(config);
  }

  let btns = "";
  $.each(config.buttons.value, function (k, v) {
    btns += `<div class="${v["name"].toLowerCase()}" data-action="${escape(v["action"])}" data-wakeup="${v["wakeup"]}" data-runcmd="${escape(JSON.stringify(v["runcmd"]))}" data-key="${escape(v["key"])}">${v["name"]}<sub>${v["key"]}</sub></div>`;

  });

  $('#remote').html(btns);

  $('head #userstyle').text(config.css.value);

  $('#remote > div').on('click', function () {
    handlekey({ 'key': $(this).data('key') });
  });

}

async function renderwin() {

  const config = await ipcRenderer.invoke('read-config');

  renderui(config);

  ports = config.serialdevs.value.split(/[\s,]+/);
  console.log("port from config:");
  console.log(ports);

  setTimeout(function () {
    $('body').removeClass('splash');
  }, 2000);

  connectport(ports, 0);

};

function handlekey(e) {

  $('#remote > div').removeClass('active');

  console.log(e);

  if ($('#settings').is(':visible')) {
    return;
  }

  $('#remote > div').each(function () {

    let ke = $(this).data('key');

    if (ke == e.key || (e.key == "event-wakeup" && $(this).data('wakeup') == 1)) {
      console.log("Fired: " + e.key);
      $(this).addClass('active');

      let ircode = $(this).data('action');


      if ($(this).data('runcmd') != undefined && $(this).data('runcmd') != "") {
        let command=$(this).data('runcmd');
        
        if (Array.isArray(command)){
        let f = command[0];
          command.shift();
          keycommand = function () { console.log("running command: "+f,command); spawn(f, command); };
        }else{
          keycommand = function () {};
        }
        //keycommand();
      }

      let cansend = 0;
      console.log(portstatus);
      for (let j = 0; j < portstatus.length; j++) {
        if (portstatus[j].status == 'connected') {

          if (portstatus[j].port.isOpen) {
            cansend = 1;
            let wretval = portstatus[j].port.write(ircode + "\n", function (err) {
              console.log("Send:" + ircode);
              if (err) {
                console.log("Error while writing:" + ircode + " err: " + err);
              } else {
                console.log("Sent:" + ircode);
              }
            });
            console.log("Write return value:" + wretval);
            if (wretval == false) {
              cansend = 0;
            } else {



            }
          } else {
            cansend = 0;
          }
          if (cansend == 0) portstatus[j].status = 'closed';
        }
      }
      if (cansend == 0) {
        console.log("reconnect! ");
        sendretry = e;
        connectport(ports, 0);
      }
    }
  });
}

function setstatus(text, cl) {

  $("#status").html(text);
  $("#status").removeClass();
  $("#status").addClass(cl);

}

function connectport(ports, i) {

  if (ports.length <= i) return;

  console.log("trying:" + ports[i]);

  let statuscallback = function (port, ports, i, source, data) {
    console.log('statuscallback:' + ports[i] + ' source:' + source);
    console.log(data);
    console.log("source:" + source + ";");

    if (source == 'ok') {
      portstatus[i].status = 'connected';
      console.log("connected:" + ports[i] + ";");
      setstatus("Connected: " + ports[i] + "", 'ok');
      if (sendretry !== null) {
        let tmp = sendretry;
        sendretry = null;
        handlekey(tmp);
      }else{
        if (keycommand!==null) {
          let tmpfv=keycommand;
          keycommand=null;
          tmpfv();
        }
      }
    }

    if (source == 'error' || source == 'writeerr' || source == 'readerr' || source == 'timeout') {
      
      console.log("checking status:" + portstatus[i].status);
      if (portstatus[i].status == 'connecting') {
        portstatus[i].status = 'closed';

        if (portstatus[i].port.isOpen) {
          portstatus[i].port.close();
        }

        if (i == ports.length - 1) {
          console.log("Not connected: Check log under settings/devtools!");
          setstatus("Not connected: Check log under settings/devtools!", "err");
        }
        connectport(ports, i + 1);

      } else {
        //already closed
      }

    }
  };

  let port = serialport(ports[i], {
    baudRate: 115200
  });

  portstatus[i] = { 'port': port, 'status': 'connecting' };
  setstatus("Connecting: " + ports[i] + "", "");

  port.on('error', function (err) {
    statuscallback(port, ports, i, 'error', err);
  });

  port.on('diconnect', function (err) {
    statuscallback(port, ports, i, 'error', err);
  });

  const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
  parser.on('data', function (data) {
    if (data.match(/^Remote.*|^OK.*/)) {
      statuscallback(port, ports, i, 'ok', data);
    } else {
      statuscallback(port, ports, i, 'readerr', data);
    }
  });

  port.write('query', function (err) {
    if (err) {
      statuscallback(port, ports, i, 'writeerr', err);
    } else {
      console.log('message written');

    }
  });

  setTimeout(function () { statuscallback(port, ports, i, 'timeout', ''); }, 2000);
}

function escape(str){
  return String(str).
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/"/g, '&quot;').
            replace(/'/g, '&#039;');
}