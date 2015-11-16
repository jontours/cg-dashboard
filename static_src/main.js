
import '../node_modules/bootstrap/dist/css/bootstrap.css';

import './css/main.css';

import {Router} from 'director';
import React from 'react';

import App from './app.jsx';
import cfApi from './util/cf_api.js';
import Login from './components/login.jsx';
import Marketplace from './components/marketplace.jsx';
import orgActions from './actions/org_actions.js';
import serviceActions from './actions/service_actions.js';
import Space from './components/space.jsx';
import SpaceList from './components/space_list.jsx';

const mainEl = document.querySelector('.js-app');


function login() {
  React.render(<App><Login/></App>, mainEl);
}

function dashboard() {
  React.render(<App>
    <h3>Welcome to CF-Deck</h3>
    <h5>Pick an organization to get started</h5>
  </App>, mainEl);
}

function org(orgGuid) {
  orgActions.changeCurrentOrg(orgGuid);
  cfApi.fetchOrg(orgGuid);
  React.render(<App><SpaceList initialOrgGuid={ orgGuid } /></App>, mainEl);
}

function space(orgGuid, spaceGuid, potentialPage) {
  orgActions.changeCurrentOrg(orgGuid);
  // TODO what happens if the space arrives before the changelistener is added?
  cfApi.fetchOrg(orgGuid);
  cfApi.fetchSpace(spaceGuid);
  React.render(
    <App>
      <Space
        initialSpaceGuid={ spaceGuid}
        initialOrgGuid={ orgGuid }
        currentPage={ potentialPage }  />
    </App>, mainEl);
}

function marketplace(orgGuid) {
  serviceActions.fetchAllServices(orgGuid);
  React.render(
    <App>
      <Marketplace
        initialOrgGuid={ orgGuid } />
    </App>,
  mainEl);
}

function checkAuth() {
  cfApi.getAuthStatus();
}

function notFound() {
  React.render(<h1>Not Found</h1>, mainEl);
}

let routes = {
  '': dashboard,
  '/': dashboard,
  '/dashboard': dashboard,
  '/login': login,
  '/org': {
    '/:orgGuid': {
      '/spaces': {
        '/:spaceGuid': {
          '/:page': {
            on: space
          },
          on: space
        }
      },
      '/marketplace': {
        on: marketplace
      },
      on: org,
    }
  }
}

let router = new Router(routes);
router.configure({
  before: checkAuth,
  notfound: notFound
});
router.init();

