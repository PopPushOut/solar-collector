const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const fsExtra = require('fs-extra');
const path = require('path');

class Observer extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder, logFolder) {
    try {
      console.log(
        `[${new Date().toLocaleString()}] Watching for folder changes on: ${folder}`
      );
      let watcher = chokidar.watch(folder, { persistent: true });

      watcher.on('add', async (filePath) => {
        // extension of file should be xsl
        if (path.extname(filePath) === '.xsl') {
          const fileName = path.basename(filePath);
          const dstpath = path.join(logFolder, fileName);
          console.log(
            `[${new Date().toLocaleString()}] ${filePath} has been added.`
          );

          // Read content of new file
          try {
            var fileContent = await fsExtra.readFile(filePath);
          } catch (err) {
            console.log(`File not read sucessfully, err: ${err}`);
          }

          // emit an event when new file has been added
          this.emit('file-added', {
            name: fileName,
            content: fileContent.toString()
          });

          // move used file to /logs catalog
          try {
            await fsExtra.move(filePath, dstpath, { overwrite: true });
            console.log(
              `[${new Date().toLocaleString()}] ${filePath} has been moved to ${dstpath}`
            );
          } catch (err) {
            console.error(err);
          }
        } else {
          try {
            await fsExtra.unlink(filePath);
            console.log(
              `[${new Date().toLocaleString()}] ${filePath} has been deleted!`
            );
          } catch (err) {
            console.error(err);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Observer;
