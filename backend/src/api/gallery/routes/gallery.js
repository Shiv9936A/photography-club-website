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
                policies: [
                    "global::verify-node-jwt",
                ],
            },
        },
    ],
};