'use strict';

var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');

var Router = ReactRouter.Router;
var browserHistory = ReactRouter.browserHistory;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.Route;
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;

var ACTIVE = { color: 'red' }


var App = React.createClass({
  render: function() {
    return (
      <div>
        <h1>APP!</h1>
        <ul>
          <li><Link      to="/"           activeStyle={ACTIVE}>/</Link></li>
          <li><IndexLink to="/"           activeStyle={ACTIVE}>/ IndexLink</IndexLink></li>

          <li><Link      to="/games"      activeStyle={ACTIVE}>/games</Link></li>
          <li><IndexLink to="/games"      activeStyle={ACTIVE}>/games IndexLink</IndexLink></li>

        </ul>

        {this.props.children}
      </div>
    )
  }
});

var Login = require('./login/login');
var L = require('../lib/lycophron');

Login.doLogin();
console.log(L);

// require('../lib/Solver/generateGames');


// var ReplayBoard = React.createClass({
//   getInitialState: function() {
//     return {
//       turns: []
//     };
//   },
//
//   componentDidMount: function() {
//     console.log(this);
//     if (this.props.turns) {
//       this.setState({
//         turnId: 0,
//         turns: this.props.turns
//       });
//     }
//   },
//
//   render: function() {
//     return (
//       <div>
//       {this.state.turns.map(function(row, i) {
//         return (
//           <div key={i} >
//             {row.word}
//           </div>
//         );
//       })}
//       </div>
//     )
//   }
// });

var Tile = React.createClass({
  render: function() {
    return (
      <div>
        <div>{this.props.tile.letter}</div>
        <div>{this.props.tile.value ? this.props.tile.value : ''}</div>
      </div>
    )
  }
});

var InventoryGame = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState(result);
        console.log(result);
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        <div>{this.state.id}</div>
        <div>
          {this.state.language} {this.state.dictionary} {this.state.scoring} {this.state.type}
        </div>
        <div>
        Turns: {this.state.turns ? this.state.turns.length : ''} # of Bingos: {this.state.numBingos} Max score: {this.state.maxScore} Sum score: {this.state.sumScore}
        </div>
        <Link to={'/games/' +  this.state.id + '/review'}    activeStyle={ACTIVE}>Review</Link>

        {this.state.turns ?
          <div>
            {this.state.turns.map(function(row, i) {
              return (
                <div key={i}>{row.word} {row.score}
                  {row.rack.map(function(r, ii) {
                    return (
                      <Tile key={ii} tile={r}/>
                    );
                  })}
                </div>
              );
            })}
          </div>
        : ''}
      </div>
    );
  }
});

var InventoryGames = React.createClass({
  getInitialState: function() {
    return {
      games: []
    };
  },

  componentDidMount: function() {
    $.get('/api/games/', function(result) {
      if (this.isMounted()) {
        this.setState({games: result});
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        {this.state.games.map(function(row, i) {
          return (
            <InventoryGame key={i} source={'/api/games/' + row} />
          );
        })}
      </div>
    );
  }
});



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


var Index = React.createClass({
  render: function() {
    return (
      <div>
        <h2>Index!</h2>
      </div>
    )
  }
});

var DuplicateGamesIndex = React.createClass({
  render: function() {
    return (
      <div>
        <h2>DuplicateGamesIndex!</h2>
      </div>
    )
  }
});

var GameReview = React.createClass({
  render: function() {
    return (
      <div>
        <h2>GameReview!</h2>
      </div>
    )
  }
});


ReactDOM.render(
  // <Comment />,
  // <InventoryGames source="/api/games/" />,
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Index}/>
      <Route path="games" component={InventoryGames} source="/api/games/">
        <IndexRoute component={DuplicateGamesIndex}/>
        <Route path=":id" component={InventoryGame}>
          <Route path="review" component={GameReview} />
        </Route>
      </Route>
    </Route>
  </Router>,
  document.getElementById('app')
);


module.exports = Comment;
