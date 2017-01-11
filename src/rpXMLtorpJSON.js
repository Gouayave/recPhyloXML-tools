var exports = module.exports = {};
var fs = require('fs')

var xml_digester = require("xml-digester");
var handler = new xml_digester.OrderedElementsHandler("eventType");
var options = {
  "handler": [{
    "path": "eventsRec/*",
    "handler": handler
  }]
};
var digester = xml_digester.XmlDigester(options);


function rpXMLFile2rpJSON(path,callback) {
  var xmlstr = fs.readFileSync(path, 'utf8');
  digester.digest(xmlstr, callback);

}

function rpXMLString2rpJSON(xmlstr) {
  digester.digest(xmlstr, callback);
}


exports.rpXMLFile2rpJSON = rpXMLFile2rpJSON;
exports.rpXMLString2rpJSON = rpXMLString2rpJSON;
