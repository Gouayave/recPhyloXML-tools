var exports = module.exports = {};
exports.flatTree = flatTree;

var d3hierarchy = require('d3-hierarchy');

var defaultConfig = {
  transferBack : true,
  speciationLoss : true,
  speciationOutLoss : true,
}

function flatTree(treeRoot,config = {}) {

  treeRootNode = d3hierarchy.hierarchy(treeRoot,function(d) {
    return d.clade;
  });

  treeRootNode.each(function (node) {

    if(node.children && node.children.length)
    {
      node.children.forEach(function (child,posChild) {

        var listEvents = child.data.eventsRec;
        var newEvent = null;


        while (listEvents && (newEvent = listEvents.shift()))
        {

          switch (newEvent.eventType) {
            case "speciationLoss":
              var newChildName = child.data.name+"_SpL";
              var lossChildName = child.data.name+"_Loss";
              if(config.speciationLoss == false)
              {
                var newChild = createNewSubTree(newChildName,newEvent);
              }
              else {
                var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"undefined");
              }

              node.data.clade[posChild] = newChild;
              newChild.clade.push(child.data);
              break;


            case "speciationOutLoss":
                var newChildName = child.data.name+"_SpOL";
                var lossChildName = child.data.name+"_Loss";
                if(config.speciationOutLoss == false)
                {
                  var newChild = createNewSubTree(newChildName,newEvent);
                }
                else {
                  var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,newEvent.speciesLocation);
                }
                node.data.clade[posChild] = newChild;
                newChild.clade.push(child.data);
              break;

            case "transferBack":
                var newChildName = child.data.name+"_TrB";
                var lossChildName = child.data.name+"_Loss";
                if(config.transferBack == false)
                {
                  var newChild = createNewSubTree(newChildName,newEvent);
                }
                else {
                  var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"out");
                }
                node.data.clade[posChild] = newChild;
                newChild.clade.push(child.data);
              break;

            default:
              child.data.eventsRec = [newEvent];

          }
        }
      });
    }
  });
  return treeRoot;
}

function createNewSubTreeWithChild(nodeName,nodeEvent,childName,childSpeciesLocation) {
  return {
    name : nodeName,
    eventsRec : [nodeEvent],
    clade : [
      {
        name: childName,
        eventsRec : [{eventType: 'loss' , speciesLocation: childSpeciesLocation}]
      }
    ]
  }
}

function createNewSubTree(nodeName,nodeEvent) {
  return {
    name : nodeName,
    eventsRec : [nodeEvent],
    clade : []
  }
}


//Insert a short subTree in a tree
// function insertSubTree(root, subTreeRoot) {
//   var oldSubTree = root.clade[posSubTree];
//   root.clade[posSubTree] = subTreeRoot;
//   subTreeRoot.clade.push(oldSubTree);
// }


// function createNewSubTree(nodeName,nodeEvent) {
//   return {
//     subName : nodeName,
//     event : nodeEvent,
//     clade : []
//   }
// }
