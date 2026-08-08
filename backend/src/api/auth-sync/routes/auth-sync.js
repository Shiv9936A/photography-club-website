'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/internal/auth/resolve-user',
      handler: 'auth-sync.resolveUser',
      config: {
        policies: [],
        middlewares: [],
      },
      type: 'content-api',
    },
    {
      method: 'GET',
      path: '/internal/auth/users/:id',
      handler: 'auth-sync.getUser',
      config: {
        policies: [],
        middlewares: [],
      },
      type: 'content-api',
    },
  ],
};
