"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::photo.photo", {
  config: {
    create: {
      auth: false,
      policies: [
        "global::verify-node-jwt",
        {
          name: "global::require-role",
          config: {
            roles: ["admin", "sig-coordinator"],
          },
        },
      ],
    },
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
