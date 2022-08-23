'use strict';
const {St, GLib, Clutter, Gio} = imports.gi;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;

imports.package.initFormat();
// add a C-like format method to string objects

let panelButton, panelButtonText;

let main_switch = false;
// true when the countdown is running

let pause = true;
// true during pause, false during work

let millis = 0;
// countdown in milliseconds

let timer = null;

const _setInterval = function(func, delay, ...args) {
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
        func(...args);
        return GLib.SOURCE_CONTINUE;
    });
};
const _clearInterval = GLib.source_remove;

function loop() {
  millis -= 1000;
  if (millis < 0) {
    pause = !pause;
    millis = (pause ? 5 : 25) * 60*1000;
    if (pause) {
      Util.spawnCommandLine(
        "zenity --notification --text '🍎 Pachino\n\r\r⏸️ Take a break!\r\r\r'"
      )
    }
  }
  const clock = formatTime(millis);
  const txt = pause
    ? ` 🍎 ${clock} ` + (((millis / 1000) % 2 === 0) ? '⏸️' : '⬛')
    : ` 🍏 ${clock} `;
  panelButtonText.set_text(txt);

}

function toggle(value) {
  if (value === undefined) {
    main_switch = !main_switch;
  } else {
    main_switch = value;
  }
  if (main_switch) {
    loop();
    if (timer) _clearInterval(timer);
    timer = _setInterval(loop, 1000);
  } else {
    _clearInterval(timer);
    timer = null;
    panelButtonText.set_text(' 🍏 ––:–– ');
    millis = 0;
    pause = true;
  };
}

function init () {

  panelButton = new St.Bin({
    style_class : "panel-button",
    reactive: true,
    can_focus: true,
    track_hover: true
  });

  panelButtonText = new St.Label({
    text : "",
    y_align: Clutter.ActorAlign.CENTER,
  });

  panelButton.set_child(panelButtonText);

  panelButton.connect('button-press-event', (p1, e) => {
    if (e.get_button() == 3) pause = false;
    toggle();
  });

}

function enable () {
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);
  toggle(main_switch);
}

function disable () {
  toggle(main_switch);
  Main.panel._rightBox.remove_child(panelButton);
}

/**
 * Convert an amount of milliseconds into a string in
 * the format mm:ss.
 * @example:
 *   formatTime(60 * 1000) => "01:00"
 */
function formatTime(ms) {
  const min_unit = 60*1000;
  const minutes = Math.floor(ms  / min_unit);
  const seconds = ((ms % min_unit) / 1000).toFixed(0);
  return "%02d:%02d".format(minutes, seconds);
}
