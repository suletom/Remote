const { ipcRenderer, app } = require('electron');
const shell = require('electron').shell;

const sform = {};

sform.escape = function(str){
  return String(str).
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/"/g, '&quot;').
            replace(/'/g, '&#039;');
}

sform.input = function (name, value, def) {
  name=this.escape(name);
  value=this.escape(value);
  def=this.escape(def);
  return `<input type="text" name="${name}" data-default="${def}" value="${value}" />`;
}

sform.textarea = function (name, value, def) {
  name=this.escape(name);
  value=this.escape(value);
  def=this.escape(def);
  return `<textarea name="${name}" data-default="${def}" >${value}</textarea>`;
}

sform.select = function (name, values, labels, value, def) {
  if (Array.isArray(def)) {
    def = JSON.stringify(def);
  }
  name=this.escape(name);
  def=this.escape(def);
  let cv = `<select name="${name}" data-default="${def}" >`;

  let vals = value;
  if (!Array.isArray(value)) {
    vals = new Array();
    vals.push(value);
  }
  
  for (let i = 0; i < values.length; i++) {
    if (labels[i] !== undefined) {
      let beh=this.escape(labels[i]);
      let val=this.escape(values[i]);
      
      cv += `
      <option value="${val}" ${($.inArray(values[i], vals)!=-1) ? "selected" : ""}>${beh}</option>
      `;
    }
  }
  cv += '</select>';
  return cv;
}

async function savesettings() {

  let config = await ipcRenderer.invoke('read-config');

  for (const i in config) {
    let cv = "";
    switch (config[i]['type']) {
      case 'select':
        config[i]["value"] = $('.scontent .setting.select#' + i).find('select').val();
        break;
      case 'textarea':
          config[i]["value"] = $('.scontent .setting.textarea#' + i).find('textarea').val();
          break;  
      case 'keycode':
        config[i]["value"] = $('.scontent .setting.keycode#' + i).find('input').val();
        break;
      case 'input':
        config[i]["value"] = $('.scontent .setting.input#' + i).find('input').val();
        break;
      case 'buttons':
        let tmp=[];
        config[i]["value"] = $('.scontent .setting.buttons#' + i + " > div").each(function () {
          let o={};
          o["name"]=$(this).find('.btname input').val();
          o["action"]=$(this).find('.btaction input').val();
          o["key"]=$(this).find('.btkey input').val();
          o["global"]=$(this).find('.btglobal select').val();
          o["wakeup"]=$(this).find('.btwakeup select').val();
          let btmp=[$(this).find('.btruncmd input:first').val()];
          $(this).find('.btruncmd input:gt(0)').each(function(){
            if ($(this).val()!='') {
              btmp.push($(this).val());
            }  
          }); 
          o["runcmd"]=btmp;
          tmp.push(o);

        }); 
        config[i]["value"] = tmp;
        break;
    }
  }

  console.log("newconfig: ");
  console.log(config);
  ipcRenderer.send('save-config', config);
  $('#settings').hide();
  $('#maincontent').show();
}

document.addEventListener('DOMContentLoaded', function () {

  $(".btn-settings").on('click', function () {
    $('#maincontent').hide();
    $('#settings').show();
  });
  $(".btn-close").on('click', function () {
    ipcRenderer.send('request-toggle', {});
  });

  $(".btn-save").on('click', function () {
    savesettings();

  });
  $(".btn-back").on('click', function () {
    $('#settings').hide();
    $('#maincontent').show();
    
  });

  $(".btn-devtools").on('click', function () {
    ipcRenderer.send('devtools-toggle', {});
  });

  $(".btn-reset").on('click', function () {
    if (confirm('Reset ?')){
      ipcRenderer.send('save-config', {});
    }
  });

  async function getconfig() {
    console.log("Get config...");
    const config = await ipcRenderer.invoke('read-config');
    console.log("config: " + JSON.stringify(config));

    let confs = "";

    for (const i in config) {
      let cv = `<div class="setting ${config[i]['type']}" id="${i}">
                  <label>${config[i]["label"]}</label>`;

      switch (config[i]['type']) {
        case 'textarea':
          cv += sform.textarea(i, config[i]["value"], config[i]["default"]);

          break;
        case 'input':
          cv += sform.input(i, config[i]["value"], config[i]["default"]);

          break;
        case 'yesno':
          cv += sform.select(i, ["0", "1"], ["No", "Yes"], config[i]["value"], config[i]["default"]);
          break;
        case 'keycode':
          //onkeydown="$(this).val((event.ctrlKey?'Ctrl+':'')+(event.altKey?'Alt+':'')+(event.shiftKey?'Shift+':'')+(event.metaKey?'Meta+':'')+event.code); event.preventDefault(); "
          cv += sform.input(i, config[i]["value"], config[i]["default"]);
          cv += ' <a href="https://www.electronjs.org/docs/api/accelerator" target="_blank">Help!</a>';
          break;
        case 'buttons':

          for (let j = 0; j < config[i]["value"].length; j++) {
            cv += `<div class=\"cbtn\">
                   <a onclick=\"$(this).parent().after($(this).parent().clone()); $(this).parent().next().find('input').val(''); $(this).parent().next().find('select').val($(this).parent().next().find('select option:first').val()); \" href=\"#\">Add Button!</a>
                   <a onclick=\"$(this).parent().remove();\" href=\"#\">Remove Button!</a>
                   `;
            cv += "<div class=\"btname\"><label>Name</label>";
            cv += sform.input(i + "-label[]", config[i]["value"][j]['name']);
            cv += "</div>";
            cv += "<div class=\"btaction\"><label>Action</label>";
            cv += sform.input(i + "-action[]", config[i]["value"][j]['action']);
            cv += "</div>";
            cv += "<div class=\"btkey\"><label>Shortcut</label>";
            cv += sform.input(i + "-key[]", config[i]["value"][j]['key']);
            cv += ' <a href="https://www.electronjs.org/docs/api/accelerator" target="_blank">Help!</a>';
            cv += "</div>";
            cv += "<div class=\"btglobal\"><label>Global shortcut?</label>";
            cv += sform.select(i + "-global[]", ["0", "1"], ["No", "Yes"], config[i]["value"][j]['global']);
            cv += "</div>";
            cv += "<div class=\"btwakeup\"><label>Fire after wake up?</label>";
            cv += sform.select(i + "-wakeup[]", ["0", "1"], ["No", "Yes"], config[i]["value"][j]['wakeup']);
            cv += "</div>";
            cv += "<div class=\"btruncmd\"><label>Run command after action</label>";

            let tmp="";
            let args="";
            //console.log(config[i]["value"][j]['runcmd']);
            if ((config[i]["value"][j]['runcmd'])==undefined ) {

            }else if (Array.isArray(config[i]["value"][j]['runcmd'])) {

              for (let m=0;m<config[i]["value"][j]['runcmd'].length;m++){
                if (m==0) tmp=config[i]["value"][j]['runcmd'][0];
                else args+=sform.input(i + "-runcmd[]",config[i]["value"][j]['runcmd'][m]);
              }
            }

            cv += sform.input(i + "-runcmd[]",tmp);
            cv += `<a href="javascript:void(0);" onclick="$(this).prev().clone().appendTo($(this).parent()); $(this).parent().find('input:last').val('');">+ ARG</a>${args}</div>`;
            cv += "</div>";
          }
          break;
      }
      confs += "</div>" + cv;
    }

    $('.scontent').html(confs);

  }

  getconfig();

}, false);