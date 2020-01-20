var parseString = require('xml2js').parseString;

class FileParserFactory {
  constructor({ name, content }) {
    let instance;
    const autoCreatedFilePattern = new RegExp(/[0-9]{11}/);
    const matchFound = name.match(autoCreatedFilePattern);
    if (matchFound) {
      const inverterNumber = matchFound[0];
      console.log(
        `[${new Date().toLocaleString()}] Automatically generated file detected! Inverter number: ${inverterNumber}`
      );
      instance = new AutomaticallyCreatedFileParser(content, inverterNumber);
    } else {
      console.log(
        `[${new Date().toLocaleString()}] Manually generated file detected!`
      );
      instance = new ManuallyCreatedFileParser(content);
    }
    return instance;
  }
}
class AbsractFileParser {
  constructor() {}
  standartizeColumnName(name) {
    return name.replace(/\W/, '_').toLowerCase();
  }
  xslToJson(data) {
    return new Promise((resolve, reject) => {
      parseString(data, (err, jsonObj) => {
        if (err) {
          return reject(err);
        }
        resolve(jsonObj);
      });
    });
  }
  mapColumnKeysToXslTableRows(rowProps, xslRows) {
    let json = [];
    let keys = Object.keys(rowProps);

    // shift 'inverter' property out of array, as it is prefilled before loop
    keys.shift();

    for (const xslRow of xslRows) {
      let rowObject = {};
      rowObject['inverter'] = rowProps['inverter'];
      const row = xslRow.td;
      for (const [index, columnVal] of row.entries()) {
        //console.log(`${keys[index]} ${columnVal}`);
        rowObject[keys[index]] = columnVal;
      }
      json.push(rowObject);
    }
    return json;
  }
  async parse() {
    const xslJson = await this.xslToJson(this.content);
    const [xslTableHeader, ...xslTableRows] = xslJson['xsl:stylesheet'][
      'xsl:template'
    ][0]['html'][0]['body'][0]['table'][0].tr;
    const columnKeys = this.getJsonPropertiesFromXslTableHeader(xslTableHeader);
    return this.mapColumnKeysToXslTableRows(columnKeys, xslTableRows);
  }
}
class AutomaticallyCreatedFileParser extends AbsractFileParser {
  constructor(content, inverterNumber) {
    super();
    this.content = content;
    this.inverterNumber = inverterNumber;
  }
  getJsonPropertiesFromXslTableHeader(header) {
    const columns = header.td;
    const properties = {};
    properties['inverter'] = this.inverterNumber;
    for (const [index, column] of columns.entries()) {
      // first column has different format than others
      if (index === 0) {
        properties[this.standartizeColumnName(column)] = '';
      } else if (index === columns.length - 1) {
        properties[
          this.standartizeColumnName(column.substring(0, column.indexOf('[')))
        ] = '';
      } else {
        properties[this.standartizeColumnName(column.split(' ')[0])] = '';
      }
    }
    return properties;
  }
}

class ManuallyCreatedFileParser extends AbsractFileParser {
  constructor(content) {
    super();
    this.content = content;
  }
  getJsonPropertiesFromXslTableHeader(header) {
    const columns = header.td;
    const properties = {};
    for (const [index, column] of columns.entries()) {
      // first column has different format than others
      if (index === 0) {
        properties['inverter'] = columns[1].split(' ')[0];
        properties[this.standartizeColumnName(column)] = '';
      } else {
        properties[this.standartizeColumnName(column.split(' ')[2])] = '';
      }
    }
    return properties;
  }
}

module.exports = FileParserFactory;
