'use strict';

var glob = require('glob');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');

function harvestTest(bugReport, name) {
  console.log(bugReport.turnId, bugReport.game.id);

  var data = {
    name: name,
    bug: bugReport
  };

  var templateStr = fs.readFileSync(path.join(__dirname, 'test-template.ejs'), 'utf8');
  // console.log(templateStr);
  var renderedText = ejs.render(templateStr, data /*, options*/);
  // console.log(renderedText);
  var filename = path.basename(name, path.extname(name)) + '.spec.js';
  fs.writeFileSync(path.join(__dirname, filename), renderedText);
}

glob(path.join(__dirname, '..', '..', 'bugs', '*.json'), function (err, files) {
  if (err) {
    console.error(err);
    return;
  }
  for (var i = 0; i < files.length; i += 1) {
    try {
      harvestTest(require(files[i]), path.basename(files[i]));
    } catch (err) {
      console.error(files[i], err);
    }
  }
});
