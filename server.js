const path = require('path');
const Obserser = require('./services/observer');
const FileParserFactory = require('./xmlparser');
const sendDataToSnInstance = require('./services/sn-rest-api');

let obserser = new Obserser();

const sourceDir = __dirname;
const dataDir = path.join(sourceDir, 'data');
const logDir = path.join(sourceDir, 'log');

obserser.on('file-added', (file) => {
  const fileParser = new FileParserFactory(file);
  fileParser.parse().then((json) => {
    sendDataToSnInstance(json);
  });
});

obserser.watchFolder(dataDir, logDir);
