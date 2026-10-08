"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/photos/likes/me",
      handler: "photo.getMyPhotoLikes",
      config: {
        auth: false,
        policies: ["global::verify-node-jwt"],
      },
    },
    {
      method: "POST",
      path: "/photos/:documentId/like",
      handler: "photo.likePhoto",
      config: {
        auth: false,
        policies: ["global::verify-node-jwt"],
      },
    },
    {
      method: "DELETE",
      path: "/photos/:documentId/like",
      handler: "photo.unlikePhoto",
      config: {
        auth: false,
        policies: ["global::verify-node-jwt"],
      },
    },
  ],
};
