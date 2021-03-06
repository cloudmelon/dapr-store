<!--
// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2020
// Licensed under the MIT License.
//
// Dapr Store frontend - Main app with nav bar menu and slot for views to be injected
// ----------------------------------------------------------------------------
-->

<template>
  <div class="app">
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand to="/">
        <img src="./assets/img/logo.svg" class="logo"> <span class="logo-text">Dapr eShop</span>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-form-input v-model="query" autocomplete="off" size="lg" placeholder="Search products" @keyup.enter="search" />
          <b-button size="lg" variant="success" class="d-none d-lg-flex" @click="search">
            <fa icon="search" />
          </b-button>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item v-if="!user.userName" to="/login" variant="info">
            <fa icon="user" /> &nbsp; Login
          </b-nav-item>
          <b-nav-item v-if="user.userName" to="/cart" variant="info" active-class="active">
            <fa icon="shopping-cart" /> &nbsp; Cart
          </b-nav-item>
          <b-nav-item v-if="user.userName" to="/account" variant="info" active-class="active">
            <fa icon="id-card" /> &nbsp; Account
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <div class="container">
      <!-- Views are injected here -->
      <router-view />

      <footer>Dapr eShop v{{ version }} - (C) Ben Coleman, 2020</footer>
    </div>
  </div>
</template>

<script>
import { userProfile, msalApp, accessTokenRequest } from './main'
import User from './user'

export default {
  name: 'App',

  data() {
    return {
      user: userProfile,
      version: require('../package.json').version,
      query: ''
    }
  },

  async mounted() {
    // Try to refresh the token for the stored user
    // If it works great, if not we remove the stored local user
    // and the user will need to login again
    let storedUser = localStorage.getItem('user')

    // Skip token if demo user in use
    if (storedUser == 'demo@example.net') {
      Object.assign(userProfile, new User('', { name: 'Demo User' }, 'demo@example.net'))
      console.log('### App.vue: MSAL aquireToken skipped for demo user: demo@example.net')
      restoreCart()
      return
    }

    if (storedUser) {
      try {
        let tokenResp = await msalApp.acquireTokenSilent(accessTokenRequest)

        if (tokenResp) {
          Object.assign(userProfile, new User(tokenResp.accessToken, msalApp.getAccount(), msalApp.getAccount().userName || msalApp.getAccount().preferred_username))
          console.log(`### App.vue: MSAL user ${userProfile.userName} is logged & has token`)
          localStorage.setItem('user', userProfile.userName)
          userProfile.cart = []
          restoreCart()
        } else {
          console.log('### acquireTokenSilent returned no token - removing stored user')
          Object.assign(userProfile, new User())
          localStorage.removeItem('user')
          localStorage.removeItem('cart')
        }
      } catch (err) {
        console.log(`### Error acquireTokenSilent ${err} - removing stored user`)
        Object.assign(userProfile, new User())
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
      }
    }
  },

  methods: {
    search() {
      if (this.query) { this.$router.push({ name: 'search', params: { query: this.query } }) }
    }
  }
}

// Just loads the cart from local storage into the user
function restoreCart() {
  try {
    if (localStorage.getItem('cart')) {
      userProfile.cart = JSON.parse(localStorage.getItem('cart'))
    }
  } catch (err) {
    userProfile.cart = []
  }
}
</script>

<style>
  * {
    font-family: 'Josefin Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  body, html, .app {
    margin: 0;
    padding: 0;
    height: 100%
  }
  .logo {
    height: 3rem;
    padding-right: 1rem;
  }
  .logo-text {
    font-family: 'Cinzel Decorative', cursive;
    font-size: 1.7rem;
    padding-right: 3rem;
    line-height: 3rem;
  }
  @media  (max-width: 500px) {
    .logo-text {
      font-size: 1.0rem;
    }
  }
  .navbar {
    padding: 0.4rem 1rem !important;
    margin-bottom: 2rem;
  }
  .nav-item {
    width: 8rem;
    text-align: center;
    font-size: 1.3rem;
    border-radius: 10px;
    margin-right: 2rem;
    /* padding: 1rem 2rem !important; */
  }
  .nav-item:hover {
    background-color: rgba(10, 10, 60, 0.1);
    border-radius: 10px;
  }
  .active {
    background-color:rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .card-header {
    font-size: 150% !important;
  }
  footer {
    width: 100%;
    text-align: right;
    border-top: 2px solid lightgray;
    margin-top: 3rem;
  }
  .alert {
    font-size: 140% !important;
  }
  .alert h4 {
    color: #222;
    padding-bottom: 0.3rem;
    border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  }
  input[type=text] {
    background-color: rgba(10, 10, 60, 0.1);
    padding: 0px 0px 0px 10px !important;
    border-radius:5px !important;
    font-size: 1.2rem !important;
    height: 45px;
  }
  input[type=text]:focus {
    background-color: rgba(200, 200, 255, 0.2);
  }
</style>
