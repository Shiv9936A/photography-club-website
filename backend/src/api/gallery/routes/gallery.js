"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/gallery/public",
      handler: "gallery.publicPhotos",
      config: {
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/gallery/private",
      handler: "gallery.privatePhotos",
      config: {
        auth: false,
        policies: ["global::verify-node-jwt"],
      },
    },

    {
      method: "GET",
      path: "/gallery/members",
      handler: "gallery.members",
      config: {
        auth: false,
        policies: ["global::verify-node-jwt"],
      },
    },

    {
      method: "POST",
      path: "/gallery/upload",
      handler: "gallery.uploadPhoto",
      config: {
        auth: false,
        policies: ["global::verify-node-jwt"],
      },
    },

    {
      method: "POST",
      path: "/gallery/event/upload",
      handler: "gallery.uploadEventPhotos",
      config: {
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
  ],
};
