const xml2js = require('xml2js');

const xmlToJson = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports = xmlToJson;
