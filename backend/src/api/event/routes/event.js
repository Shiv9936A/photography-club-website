"use strict";

const { createCoreRouter } =
  require("@strapi/strapi").factories;

module.exports = createCoreRouter(
  "api::event.event",
  {
    config: {
      find: {
        auth: false,
      },

      findOne: {
        auth: false,
      },

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

      update: {
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

      delete: {
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
    },
  }
);