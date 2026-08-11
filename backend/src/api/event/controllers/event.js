// @ts-nocheck

"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);

    if (Array.isArray(data)) {
      for (const event of data) {
        if (event.photos && Array.isArray(event.photos)) {
          event.photos = event.photos
            .filter((photo) => photo.visibility === "public")
            .sort(
              (a, b) =>
                (a.displayOrder ?? 0) -
                (b.displayOrder ?? 0)
            )
            .slice(0, 10);
        }
      }
    }

    return { data, meta };
  },

  async findOne(ctx) {
    const { data, meta } = await super.findOne(ctx);

    if (data?.photos && Array.isArray(data.photos)) {
      data.photos = data.photos
        .filter((photo) => photo.visibility === "public")
        .sort(
          (a, b) =>
            (a.displayOrder ?? 0) -
            (b.displayOrder ?? 0)
        )
        .slice(0, 10);
    }

    return { data, meta };
  },
}));