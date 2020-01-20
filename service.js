const Service = require('node-windows').Service;
const EventLogger = require('node-windows').EventLogger;
const path = require('path');

var log = new EventLogger('Hello World');
const source = path.join(__dirname, 'server.js');

// Create a new service object
var svc = new Service({
  name: 'Solar Collector',
  description:
    'Service which feeds data from solar collector to Service Now instance',
  script: source
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  log.info('Service install complete. Service exists = ', svc.exists);
  svc.start();
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function() {
  log.info('Service uninstall complete. Service exists = ', svc.exists);
});

if (svc.exists) {
  svc.uninstall();
} else {
  svc.install();
}
