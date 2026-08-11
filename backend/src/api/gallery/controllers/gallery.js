// @ts-nocheck


"use strict";

module.exports = {
  async publicPhotos(ctx) {
    try {
      const { event } = ctx.query;

      /** @type {Record<string, any>} */
      const where = {
        visibility: "public",
      };

      // Filter by event when an event documentId is provided
      if (event) {
        where.event = {
          documentId: event,
        };
      }

      const photos = await strapi.db
        .query("api::photo.photo")
        .findMany({
          where,
          populate: {
            image: true,
            event: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
          limit: 10,
        });

      return ctx.send({
        success: true,
        photos,
      });
    } catch (error) {
      console.error("Public gallery error:", error);

      return ctx.internalServerError(
        "Failed to load public gallery"
      );
    }
  },

  async privatePhotos(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.isNitk !== true) {
        return ctx.forbidden("NITK users only");
      }

      const photos = await strapi.db
        .query("api::photo.photo")
        .findMany({
          where: {
            visibility: "private",
          },
          populate: {
            image: true,
            event: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        });

      return ctx.send({
        success: true,
        photos,
      });
    } catch (error) {
      console.error("Private gallery error:", error);

      return ctx.internalServerError(
        "Failed to load private gallery"
      );
    }
  },
};