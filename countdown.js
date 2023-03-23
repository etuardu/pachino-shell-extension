#!/usr/bin/gjs
/**
 * Display a fullscreen countdown.
 * Usage: gjs countdown.js <seconds>
 *
 * Edoardo Nannotti 2023
 */

imports.gi.versions.Gtk = "3.0";
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Cairo = imports.cairo;
const System = imports.system;

class TextClock {
  constructor(s) {
    this.seconds = isNaN(s) ? 5*60 : s;
  }
  toString() {
    const zeroPad = (num) => String(num).padStart(2, '0');
    const ss = Math.floor(this.seconds / 60);
    const mm = this.seconds % 60;
    return `${zeroPad(ss)}:${zeroPad(mm)}`;
  }
};

let app = new Gtk.Application({
  application_id: 'com.gmail.etuardu.pachino-countdown'
});

const clock = new TextClock(System.programArgs[0]);

app.connect('activate', () => {
  let win = new Gtk.ApplicationWindow({ application: app });
  let time_label = new Gtk.Label({ label: clock.toString() });

  let cssProvider = new Gtk.CssProvider();
  cssProvider.load_from_data(`
    window {
      background: black;
      font-size: 370px;
      font-family: Roboto;
      color: white;
    }
  `);
  let styleContext = win.get_style_context();
  styleContext.add_provider(
    cssProvider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
  );

  win.add(time_label);
  win.fullscreen();
  win.connect('draw', (widget) => {
    widget.get_window().set_opacity(0.6);
  });
  win.connect('key-press-event', (widget, event) => {
    // close on ESC key
    if (event.get_keycode()[1] == 9) win.close();
  });
  win.show_all();
  setInterval(() => {
    clock.seconds--;
    if (clock.seconds <= 0) win.close();
    time_label.set_label(`${clock.toString()}`);
  }, 1000)
    
});

app.run([]);
