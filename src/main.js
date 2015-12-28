'use strict';

// $ = jQuery = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');

var App = console.log('Hello world from Browserify');

var Login = require('./login/login');
var L = require('../lib/lycophron');

Login.doLogin();
console.log(L);

// require('../lib/Solver/generateGames');

var Comment = React.createClass({

  getInitialState: function() {
    return {data: {}};
  },
  componentDidMount: function() {
    var socket = io.connect(),
      self = this;

    setTimeout(function () {
      socket.emit('joinGame', {id: 'game42'});
    }, Math.random() * 1000 + 200);

    socket.on('newTurn', function (data) {
      console.log('newTurn', data);
      self.setState({data: data});
      setTimeout(function () {
        socket.emit('turnSolution', {id: 'game42', rack: [12, 34, 56]});
      }, Math.random() * 1000 + 200);
    });

  },
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.state.data.id}
        </h2>
        {this.state.data.rack}
      </div>
    );
  }
});

ReactDOM.render(
  <Comment />,
  document.getElementById('app')
);


module.exports = Comment;
