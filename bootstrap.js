const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import('resource://gre/modules/Services.jsm');

function loadIntoWindow(window) {
    try {
        window.require.setRequirePath("scope-remoteservers/", "chrome://scope-remoteservers/content/");
        var commando = window.require("commando/commando");
        commando.registerScope("scope-remoteservers", {
            name: "Remote Servers",
            description: "Load Remote Servers",
            icon: "koicon://ko-svg/chrome/icomoon/skin/database.svg",
            handler: "scope-remoteservers/remoteservers"
        });
    } catch (e) {
        Cu.reportError("Commando: Exception while registering scope 'FTP Servers'");
        Cu.reportError(e);
    }
}

function unloadFromWindow(window) {
    if (!window) return;
    var commando = window.require("commando/commando");
    commando.unregisterScope("scope-remoteservers");
}

/* Everything below this line is boilerplate and probably should not be touched */

var startupData;
var windowListener = {
    onOpenWindow: function(aWindow) {
        // Wait for the window to finish loading
        let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        domWindow.addEventListener("komodo-post-startup", function onLoad() {
            domWindow.removeEventListener("komodo-post-startup", onLoad, false);
            loadIntoWindow(domWindow);
        }, false);
    },

    onCloseWindow: function(aWindow) {},
    onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(data, reason) {
    startupData = data;

    // Load into any existing windows
    let windows = Services.wm.getEnumerator("Komodo");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        loadIntoWindow(domWindow);
    }

    // Load into any new windows
    Services.wm.addListener(windowListener);
}

function shutdown(data, reason) {
    // When the application is shutting down we normally don't have to clean
    // up any UI changes made
    if (reason == APP_SHUTDOWN) return;

    // Stop listening for new windows
    Services.wm.removeListener(windowListener);

    // Unload from any existing windows
    let windows = Services.wm.getEnumerator("Komodo");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        unloadFromWindow(domWindow);
    }
}

function install(data, reason) {}

function uninstall(data, reason) {}
