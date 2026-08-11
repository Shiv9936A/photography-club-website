"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::event.event", {
  config: {
    find: {
      auth: false,
      policies: ["global::verify-node-jwt"],
    },
    findOne: {
      auth: false,
      policies: ["global::verify-node-jwt"],
    },
    create: {
      auth: false,
      policies: [
        "global::verify-node-jwt",
        {
          name: "global::require-role",
          config: { roles: ["admin"] },
        },
      ],
    },
    update: {
      auth: false,
      policies: [
        "global::verify-node-jwt",
        {
          name: "global::require-role",
          config: { roles: ["admin"] },
        },
      ],
    },
    delete: {
      auth: false,
      policies: [
        "global::verify-node-jwt",
        {
          name: "global::require-role",
          config: { roles: ["admin"] },
        },
      ],
    },
  },
});