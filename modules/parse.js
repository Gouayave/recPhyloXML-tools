var exports = module.exports = {};
exports.parse = parse;

var xml_digester = require("xml-digester");
var d3hierarchy = require('d3-hierarchy');
var handler = new xml_digester.OrderedElementsHandler("eventType");
var options = {
  "handler": [{
    "path": "eventsRec/*",
    "handler": handler
  }]
};
var digester = xml_digester.XmlDigester(options);

function parse(xmlstr,callback) {
  //Silent
  var cl = console.log;
  console.log = function (str) {};
  digester.digest(xmlstr, function (err,recTree) {
    //Talk
    console.log = cl;

    //We want array for recGeneTrees
    if(recTree.recPhylo)
    {
      var recGeneTrees = recTree.recPhylo.recGeneTree;
      if( !recGeneTrees.length){
        recTree.recPhylo.recGeneTree = [recGeneTrees];
      }
    }

    callback(err,recTree);
  });
}



function createNewSubTreeWithChild(nodeName,nodeEvent,childName,childEvent) {
  return {
    subName : nodeName,
    event : nodeEvent,
    clade : [
      {
        subName: childName,
        event : {eventType: 'leaf'},
        loss : true
      }
    ]
  }
}

function createNewSubTree(nodeName,nodeEvent) {
  return {
    subName : nodeName,
    event : nodeEvent,
    clade : []
  }
}

// function traverseTree(treeRoot) {
//   cladeUtil.preOrderTraversal(treeRoot,null,null,function (node,parent,posChild,callback) {
//
//     var listEvents = node.eventsRec;
//     var newEvent = null;
//
//
//     while (listEvents && (newEvent = listEvents.shift()))
//     {
//       switch (newEvent.eventType) {
//         case "speciationLoss":
//
//           var nodeName = node.name+"_SpL";
//           var childName = node.name+"_Loss";
//           var newParent = createNewSubTreeWithChild(nodeName,newEvent,childName);
//           cladeUtil.insertSubTree(parent,posChild,newParent);
//           parent = newParent;
//           posChild = 1;
//           break;
//         case "speciationOutLoss":
//
//           var nodeName = node.name+"_SpOL";
//           var childName = node.name+"_Loss";
//           var newParent = createNewSubTreeWithChild(nodeName,newEvent,childName);
//           cladeUtil.insertSubTree(parent,posChild,newParent);
//           parent = newParent;
//           posChild = 1;
//           break;
//         case "transferBack":
//
//           var nodeName = node.name+"_TrB";
//           var childName = node.name+"_LossD";
//           var newParent = createNewSubTree(nodeName,newEvent);
//           cladeUtil.insertSubTree(parent,posChild,newParent);
//           parent = newParent;
//           posChild = 1;
//           break;
//
//         default:
//           node.event = newEvent;
//
//       }
//       delete node.eventsRec;
//
//     }
//
//   });
//   return treeRoot;
// }
