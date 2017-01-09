"use strict";

var fs = require("fs");
var readline = require('readline');
var fileName = "map.txt";

var SKIING_MAP = {};

readLines(fs.createReadStream(fileName), func);

function func(data, lineNumber) {
  var array = data.split(' ');
  SKIING_MAP[lineNumber] = array;
  return SKIING_MAP;
}

function readLines(input, func) {
  var remaining = '';
  var lines = 0;
  var skiingMap = {};

  input.on('data', function (data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      skiingMap = func(line, lines);
      lines++;
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function () {
    skiing(skiingMap);
  });
}

function generatePosition() {
  var array = [];
  for (var i = 0; i <= 999; i++) {
    for (var j = 0; j <= 999; j++) {
      array.push({
        key: i,
        index: j
      });
    }
  }

  return array;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function skiing(skiingMap) {
  var positions = generatePosition();
  var potentialPaths = positions.map(function (p) {
    return {
      point: p,
      paths: getPaths(skiingMap, p)
    };
  });
  var longestPath = 0;
  var longestRoutes = [];
  // get longestPath
  potentialPaths.forEach(function (p, i) {
    p.paths.forEach(function (record) {
      var step = record.step;
      if (step > longestPath) {
        longestPath = step;
      }
    });
  });
  // get longestRoute
  potentialPaths.forEach(function (p, i) {
    p.paths.forEach(function (record) {
      var step = record.step;
      var startPoint = p.point;
      var endPoint = record.point;
      if (step == longestPath) {
        longestRoutes.push({
          startPoint: skiingMap[startPoint.key][startPoint.index],
          endPoint: skiingMap[endPoint.key][endPoint.index]
        });
      }
    });
  });
  var longestDrop = 0;
  longestRoutes.forEach(function (r) {
    var drop = r.startPoint - r.endPoint;
    if (drop > longestDrop) {
      longestDrop = drop;
    }
  });

  console.log({
    longestPath: longestPath,
    longestRoutes: longestRoutes,
    longestDrop: longestDrop
  });

  return {
    longestPath: longestPath,
    longestRoutes: longestRoutes,
    longestDrop: longestDrop
  };
}

function getPaths(skiingMap, point) {
  var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var records = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var nextPoints = findNextPoints(point, skiingMap);
  if (nextPoints.length > 0) {
    step++;
    (nextPoints || []).forEach(function (n) {
      records.push({
        step: step,
        point: n
      });
      return getPaths(skiingMap, n, step, records);
    });
  }
  return records;
}

function findAdjacentPoints(point) {
  var key = point.key;
  var index = point.index;
  var left = index - 1 >= 0 ? { key: key, index: index - 1 } : undefined;
  var right = index + 1 <= 999 ? { key: key, index: index + 1 } : undefined;
  var top = key - 1 >= 0 ? { key: key - 1, index: index } : undefined;
  var bottom = key + 1 <= 999 ? { key: key + 1, index: index } : undefined;

  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom
  };
}

function findNextPoints(point, skiingMap) {
  var adjacentPoints = findAdjacentPoints(point);
  var left = adjacentPoints.left ? skiingMap[adjacentPoints.left.key][adjacentPoints.left.index] : undefined;
  var right = adjacentPoints.right ? skiingMap[adjacentPoints.right.key][adjacentPoints.right.index] : undefined;
  var top = adjacentPoints.top ? skiingMap[adjacentPoints.top.key][adjacentPoints.top.index] : undefined;
  var bottom = adjacentPoints.bottom ? skiingMap[adjacentPoints.bottom.key][adjacentPoints.bottom.index] : undefined;

  var shortestPaths = findAvailablePath(skiingMap[point.key][point.index], [left, right, top, bottom]);
  var nextPoints = [];
  (shortestPaths || []).forEach(function (s) {
    var point = void 0;
    switch (s) {
      case 0:
        {
          point = {
            key: adjacentPoints.left.key,
            index: adjacentPoints.left.index
          };
          break;
        }
      case 1:
        {
          point = {
            key: adjacentPoints.right.key,
            index: adjacentPoints.right.index
          };
          break;
        }
      case 2:
        {
          point = {
            key: adjacentPoints.top.key,
            index: adjacentPoints.top.index
          };
          break;
        }
      case 3:
        {
          point = {
            key: adjacentPoints.bottom.key,
            index: adjacentPoints.bottom.index
          };
          break;
        }
    }
    nextPoints.push(point);
  });

  return nextPoints;
}

function findAvailablePath(start, end) {
  var ro = [];
  (end || []).forEach(function (e, i) {
    if (e) {
      var distance = start - e;
      if (distance > 0) {
        ro.push(i);
      }
    }
  });

  return ro;
}

function findShortestPath(start, end) {
  var shortestDistance = 9;
  var shortestPaths = [];
  (end || []).forEach(function (e, i) {
    if (e) {
      var distance = start - e;
      if (distance > 0) {
        if (distance < shortestDistance) {
          shortestDistance = distance;
          shortestPaths = [];
          shortestPaths.push(i);
        } else if (distance == shortestDistance) {
          shortestPaths.push(i);
        }
      }
    }
  });
  return shortestPaths;
}