'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = seek;
var E_SEEK = 'Argument 1 of seek is neither a number nor Text Node.';
var E_SHOW = 'NodeIterator.whatToShow is not NodeFilter.SHOW_TEXT.';

var FRAME_RATE = 60;
var TICK_LENGTH = 1000 / FRAME_RATE;

function seek(iter, where) {
  checkPreconditions(iter);
  if (isNumber(where)) {
    return doSeek(iter, {
      forward: function forward(_, count) {
        return count > where;
      },
      backward: function backward(_, count) {
        return count <= where;
      }
    });
  } else if (isText(where)) {
    return doSeek(iter, {
      forward: function forward(node, _) {
        return after(node, where);
      },
      backward: function backward(node, _) {
        return node === where || before(node, where);
      }
    });
  } else {
    return Promise.reject(new Error(E_SEEK));
  }
}

function checkPreconditions(iter) {
  if (iter.whatToShow !== NodeFilter.SHOW_TEXT) {
    return Promise.reject(new Error(E_SHOW));
  }

  // Pre-condition: pointerBeforeReferenceNode
  if (!iter.pointerBeforeReferenceNode) {
    iter.previousNode();
  }
}

function isNumber(n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}

function isText(node) {
  if (typeof node.nodeType === 'number') {
    return node.nodeType === Node.TEXT_NODE;
  } else {
    return false;
  }
}

function before(referenceNode, node) {
  return referenceNode.compareDocumentPosition(node) & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_CONTAINED_BY);
}

function after(referenceNode, node) {
  return referenceNode.compareDocumentPosition(node) & (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_CONTAINS);
}

function doSeek(iter, predicates) {
  var yieldAt = Date.now() + TICK_LENGTH;

  function forward(_x) {
    var _again = true;

    _function: while (_again) {
      var count = _x;
      curNode = undefined;
      _again = false;

      var curNode = iter.nextNode();

      if (curNode === null) {
        return Promise.resolve(count);
      }

      count += curNode.textContent.length;

      if (predicates.forward(curNode, count)) {
        return Promise.resolve(count);
      }

      if (Date.now() < yieldAt) {
        _x = count;
        _again = true;
        continue _function;
      } else {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            yieldAt = Date.now() + TICK_LENGTH;
            resolve(forward(count));
          });
        });
      }
    }
  }

  function backward(_x2) {
    var _again2 = true;

    _function2: while (_again2) {
      var count = _x2;
      curNode = undefined;
      _again2 = false;

      var curNode = iter.previousNode();

      if (curNode === null) {
        return Promise.resolve(count);
      }

      count -= curNode.textContent.length;

      if (predicates.backward(curNode, count)) {
        return Promise.resolve(count);
      }

      if (Date.now() < yieldAt) {
        _x2 = count;
        _again2 = true;
        continue _function2;
      } else {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            yieldAt = Date.now() + TICK_LENGTH;
            resolve(backward(count));
          });
        });
      }
    }
  }

  return forward(0).then(backward);
}
module.exports = exports['default'];

