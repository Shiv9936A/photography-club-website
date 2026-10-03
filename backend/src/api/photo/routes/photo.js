"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::photo.photo", {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});