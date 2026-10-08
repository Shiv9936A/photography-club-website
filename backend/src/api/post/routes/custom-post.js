'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/posts/photos',
      handler: 'post.getPhotos',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'GET',
      path: '/posts/reels',
      handler: 'post.getReels',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'PUT',
      path: '/posts/:documentId/like',
      handler: 'post.likePost',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};