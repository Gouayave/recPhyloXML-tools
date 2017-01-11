var exports = module.exports = {};

exports.preOrderTraversal = preOrderTraversal;
exports.insertSubTree = insertSubTree;


const RIGHT_CHILD = 0;
const LEFT_CHILD = 1;


/*
 * [cladeTree.preOrderTraversal(n, p, f)] performs a prefix traversal of the
 * tree whose root is [n] applying [f]. [p] is an integer (either [LEFT_CHILD]
 * [RIGHT_CHILD]), except at the root of the tree where [p == null]. [p]
 * indicates the side of [n] wrt to its parent. [f] expects two arguments, [n]
 * and [p] and has void return type.
 */
function preOrderTraversal(node,parent,posChild,callback) {
  // Check if the current node is empty / null
  if(node.clade)
  {
    // Display the data part of the root (or current node).
    callback(node,parent,posChild,callback);
    // Traverse the left subtree by recursively calling the in-order function.
    preOrderTraversal(node.clade[RIGHT_CHILD],node,RIGHT_CHILD,callback);
    // Traverse the right subtree by recursively calling the in-order function.
    preOrderTraversal(node.clade[LEFT_CHILD],node,LEFT_CHILD,callback);
  }
  else {
    callback(node,parent,posChild,callback);
  }

};

//Insert a short subTree in a tree
function insertSubTree(root,posSubTree, subTreeRoot) {
  var oldSubTree = root.clade[posSubTree];
  root.clade[posSubTree] = subTreeRoot;
  subTreeRoot.clade.push(oldSubTree);
}
