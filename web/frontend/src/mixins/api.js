// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2020
// Licensed under the MIT License.
//
// Dapr Store frontend - API helper to call the various backend microservices
// ----------------------------------------------------------------------------

import { userProfile } from '../main'
import axios from 'axios'

const API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT || '/'

export default {
  methods: {
    //
    // ===== Users =====
    //
    apiUserRegister: function(user) {
      return this._apiRawCall('v1.0/invoke/users/method/register', 'POST', user)
    },

    apiUserGet: function(username) {
      return this._apiRawCall(`v1.0/invoke/users/method/get/${username}`)
    },

    apiUserCheckReg: function(username) {
      return this._apiRawCall(`v1.0/invoke/users/method/isregistered/${username}`)
    },

    //
    // ===== Products =====
    //
    apiProductCatalog: function() {
      return this._apiRawCall('v1.0/invoke/products/method/catalog')
    },

    apiProductOffers: function() {
      return this._apiRawCall('v1.0/invoke/products/method/offers')
    },

    apiProductGet: function(productId) {
      return this._apiRawCall(`v1.0/invoke/products/method/get/${productId}`)
    },

    apiProductSearch: function(query) {
      return this._apiRawCall(`v1.0/invoke/products/method/search/${query}`)
    },

    //
    // ===== Orders =====
    //
    apiOrderSubmit: function(order) {
      return this._apiRawCall('v1.0/invoke/cart/method/submit', 'POST', order)
    },

    apiOrderGet: function(orderId) {
      return this._apiRawCall(`v1.0/invoke/orders/method/get/${orderId}`)
    },

    apiOrdersForUser: function(username) {
      return this._apiRawCall(`v1.0/invoke/orders/method/getForUser/${username}`)
    },

    //
    // ===== Base Axios wrapper =====
    //
    _apiRawCall: function(apiPath, method = 'get', data = null) {
      let apiUrl = `${API_ENDPOINT}${apiPath}`
      console.log(`### API CALL ${method} ${apiUrl}`)

      let headers = {}

      // Send token as per the OAuth 2.0 bearer token scheme
      if (userProfile.token) {
        headers = {
          'Authorization': `Bearer ${userProfile.token}`
        }
      }

      return axios({
        method: method,
        url: apiUrl,
        data: data,
        headers: headers
      })
    },

    //
    // Helper to decode error messages
    //
    apiDecodeError(err) {
      if (err.response && err.response.data && err.response.headers['content-type'].includes('json')) {
        // err.response.data.httpStatus = err.response.status
        // err.response.data.httpStatusText = err.response.statusText
        return err.response.data
      }
      if (err.response && err.request) {
        return `HTTP ${err.response.status}: API call failed: ${err.request.responseURL}`
      }
      return err.toString()
    }
  }
}