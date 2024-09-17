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

function create_windows(app) {
  // Create a new window for each screen,
  // position each windows on its screen,
  // return the array of created windows.
  const windows = [];
  let display = Gdk.Display.get_default();
  for (let i = 0; i < display.get_n_monitors(); i++) {
    let monitor = display.get_monitor(i);
    let {x, y} = monitor.get_geometry();
    let win = new Gtk.Window({
      application: app,
    });
    win.move(x, y);
    win.stick(); // always on visible workspace
    windows.push(win);
  }
  return windows;
}

let app = new Gtk.Application({
  application_id: 'com.gmail.etuardu.pachino-countdown'
});

const clock = new TextClock(System.programArgs[0]);

app.connect('activate', () => {

  let cssProvider = new Gtk.CssProvider();
  cssProvider.load_from_data(`
    window {
      background: black;
      font-size: 500px;
      font-family: Roboto Condensed;
      font-weight: bold;
      color: white;
    }
  `);

  let windows = create_windows(app);
  close_all = windows => {
    windows.forEach(win => {
      try {
        win.close()
      } catch(e) {
        // already closed
      }
    });
  };
  let time_labels = [];

  windows.forEach(win => {
    let time_label = new Gtk.Label({ label: clock.toString() });

    let styleContext = win.get_style_context();
    styleContext.add_provider(
      cssProvider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );

    win.add(time_label);
    win.fullscreen();
    win.set_keep_above(true);
    win.connect('draw', (widget) => {
      widget.get_window().set_opacity(0.6);
    });
    win.connect('key-release-event', (widget, event) => {
      // close on ESC key
      if (event.get_keycode()[1] == 9) close_all(windows);
    });
    time_labels.push(time_label);
    win.show_all();
  });

  setInterval(() => {
    clock.seconds--;
    if (clock.seconds <= 0) close_all(windows);
    time_labels.forEach(label => label.set_label(`${clock.toString()}`));
  }, 1000)
    
});

app.run([]);
