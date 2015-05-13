/**
 * Basic Fluxxor Implementation
 */


// Import is an ES6 js thing, it's exactly the same as var React = require('react');
import React from 'react';
import Fluxxor from 'fluxxor';
import Faker from 'faker';
import _ from 'underscore';
const FluxMixin = Fluxxor.FluxMixin(React);
const StoreWatchMixin = Fluxxor.StoreWatchMixin;

let userData = [];

for (let i = 0; i < 20; i++) {
  userData.push({
    name: Faker.name.firstName() + ' ' + Faker.name.lastName(),
    id: Faker.random.uuid(),
    philosophy: Faker.hacker.phrase()
  });
}

let requestHelper = {

  loadUsers: function(success, failure) {
    setTimeout(function() {
       success(userData)
    }, 1000)
  },

  addUser: function(data, success, failure) {
    setTimeout(function() {
      success(data);
    }, 1000)
  }

  /**
   * You can uncomment these if you want to use the node server instead
   * make sure to comment the 2 methods above
   */

  // loadUsers: function(success, failure) {
  //   $.get('/users')
  //     .done(function(data) {
  //       success(data);
  //     })
  //     .fail(function(data) {
  //       failure('You are fucked');
  //     })
  // },

  // addUser: function(data, success, failure) {
  //   $.post('/users/new', data)
  //     .done(function(data) {
  //       success(data)
  //     })
  //     .fail(function() {
  //       failure('Uh Oh!')
  //     })
  // }
};

let constants = {
  LOAD_USERS: 'LOAD_USERS',
  LOAD_USERS_SUCCESS: 'LOAD_USERS_SUCCESS',
  LOAD_USERS_FAIL: 'LOAD_USERS_FAIL',
  ADD_USER: 'ADD_USER',
  ADD_USER_SUCCESS: 'ADD_USER_SUCCESS',
  ADD_USER_FAIL: 'ADD_USER_FAIL'
};

let actions = {
  loadUsers: function() {
    this.dispatch(constants.LOAD_USERS);

    requestHelper.loadUsers(function(user) {
      this.dispatch(constants.LOAD_USERS_SUCCESS, {user: user})
    }.bind(this), function(error) {
      this.dispatch(constants.LOAD_USERS_FAIL, {error: error})
    }.bind(this))
  },

  addUser: function(user) {
    let id = _.uniqueId();
    this.dispatch(constants.ADD_USER, {user: user});

    requestHelper.addUser(user, function() {
      this.dispatch(constants.ADD_USER_SUCCESS, {user: user});
    }.bind(this), function(error) {
      this.dispatch(constants.ADD_USER_FAIL, {error: error})
    }.bind(this))

  }
};

let UserStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.error = null;
    this.users = [];

    this.bindActions(
      constants.LOAD_USERS, this.onLoadUsers,
      constants.LOAD_USERS_SUCCESS, this.onLoadUsersSuccess,
      constants.LOAD_USERS_FAIL, this.onLoadUsersFail,
      constants.ADD_USER, this.onAddUser,
      constants.ADD_USER_SUCCESS, this.onAddUserSuccess,
      constants.ADD_USER_FAIL, this.onAddUserFail
    )
  },
  onLoadUsers: function() {
    this.loading = true;
    this.emit('change');
  },
  onLoadUsersSuccess: function(payload) {
    this.loading = false;
    this.error = null;

    this.users = payload.user;

    this.emit('change');

  },
  onLoadUsersFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit('change');
  },
  onAddUser: function(payload) {
    this.loading = true;
    this.emit('change');
  },
  onAddUserSuccess: function(payload) {

    // We only update the user store when it's successfullly uploaded to the server

    this.users.push(payload.user);
    this.emit('change');
  },

  onAddUserFail: function(payload) {
    this.loading = false;
    this.error = true;
    this.emit('change');
  }
});

let stores = {
  UserStore: new UserStore()
};

let userFlux = new Fluxxor.Flux(stores, actions);

userFlux.on('dispatch', function(type, payload) {
  if(console && console.log) {
    console.log('[Dispatch]', type, payload)
  }
});

let Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("UserStore")],

  getStateFromFlux: function() {
    var store = this.getFlux().store("UserStore");
    return {
      loading: store.loading,
      error: store.error,
      users: store.users
    };
  },

  componentDidMount: function() {
    this.getFlux().actions.loadUsers();
  },

  addUserHandler: function(e) {
    e.preventDefault();
    var formData = {
      name: this.refs.name.getDOMNode().value,
      id: this.refs.id.getDOMNode().value,
      philosophy: this.refs.philosophy.getDOMNode().value
    }
    this.getFlux().actions.addUser(formData);
  },

  render: function() {
    var userList = [];

    _.each(this.state.users, function(user, index) {
      return (
        userList.push(
          <li key={index}>
            {user.name}
          </li>
        )
      )
    })
    return (
      <div>
        <h1>Main View</h1>

        <form ref='add_user' onSubmit={this.addUserHandler}>

          <div>
            <label>Name</label>
            <input ref='name' name='name' type='text' />
          </div>

          <div>
            <label>Philosophy</label>
            <textarea ref='philosophy' name='philosophy' />
          </div>

          <div>
            <label>id</label>
            <input ref='id' name='id' type='text' />
          </div>


          <button>Add User</button>
        </form>
        <ul>
          {userList}
        </ul>
      </div>
    );
  }

});


React.render(<Application flux={userFlux} />, document.getElementById('main'));
