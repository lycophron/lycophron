'use strict';

var CSVDumper = require('../CSVDumper');
var i;
// var dicts = ['/../en/WL2014.json', '/../hu/me2003.json'];
var dicts = ['/../hu/me2003.json'];

for (i = 0; i < dicts.length; i += 1) {
  var csvDumper = new CSVDumper(__dirname + dicts[i]);

  csvDumper.generateCSVFile();
}
