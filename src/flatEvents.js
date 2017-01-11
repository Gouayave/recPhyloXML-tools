var exports = module.exports = {};

exports.traverseTree = traverseTree;

var cladeUtil = require('./cladeUtil.js');

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

function traverseTree(treeRoot) {
  cladeUtil.preOrderTraversal(treeRoot,null,null,function (node,parent,posChild,callback) {

    var listEvents = node.eventsRec;
    var newEvent = null;


    while (listEvents && (newEvent = listEvents.shift()))
    {
      switch (newEvent.eventType) {
        case "speciationLoss":

          var nodeName = node.name+"_SpL";
          var childName = node.name+"_Loss";
          var newParent = createNewSubTreeWithChild(nodeName,newEvent,childName);
          cladeUtil.insertSubTree(parent,posChild,newParent);
          parent = newParent;
          posChild = 1;
          break;
        case "speciationOutLoss":

          var nodeName = node.name+"_SpOL";
          var childName = node.name+"_Loss";
          var newParent = createNewSubTreeWithChild(nodeName,newEvent,childName);
          cladeUtil.insertSubTree(parent,posChild,newParent);
          parent = newParent;
          posChild = 1;
          break;
        case "transferBack":

          var nodeName = node.name+"_TrB";
          var childName = node.name+"_LossD";
          var newParent = createNewSubTree(nodeName,newEvent);
          cladeUtil.insertSubTree(parent,posChild,newParent);
          parent = newParent;
          posChild = 1;
          break;

        default:
          node.event = newEvent;

      }
      delete node.eventsRec;

    }

  });
  return treeRoot;
}
