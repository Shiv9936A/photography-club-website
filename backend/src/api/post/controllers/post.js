// @ts-nocheck
"use strict";

const { factories } = require("@strapi/strapi");

module.exports = factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({

    async getPhotos(ctx) {
      const posts = await strapi.entityService.findMany(
        "api::post.post",
        {
          populate: {
            images: true,
            category: true,
            photographerAvatar: true,
          },
        }
      );

      console.log("ALL POSTS:", posts);

      const photos = posts.filter(
        (post) => post.images && post.images.length === 1
      );

      console.log("PHOTO POSTS:", photos);

      return { data: photos };
    },

    async getReels(ctx) {
      const posts = await strapi.entityService.findMany(
        "api::post.post",
        {
          populate: {
            images: true,
            category: true,
            photographerAvatar: true,
          },
        }
      );

      console.log("ALL POSTS:", posts);

      const reels = posts.filter(
        (post) => post.images && post.images.length > 1
      );

      console.log("REEL POSTS:", reels);

      return { data: reels };
    },

    async likePost(ctx) {
      const { documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest("Missing documentId");
      }

      const post = await strapi.documents("api::post.post").findOne({
        documentId,
        fields: ["likesCount"],
      });

      if (!post) {
        return ctx.notFound("Post not found");
      }

      const updatedPost = await strapi.documents("api::post.post").update({
        documentId,

        data: {
          likesCount: (post.likesCount || 0) + 1,
        },
      });

      return { data: updatedPost };
    },

  })
);