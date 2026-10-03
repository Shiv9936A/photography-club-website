// @ts-nocheck

"use strict";

const { createCoreController } =
  require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::photo.photo",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query.populate = {
        image: true,
        capturedBy: true,
        uploadedBy: true,
        event: true,
      };

    

      const result = await super.find(ctx);

      // console.log(
      //   "PHOTO RESPONSE:",
      //   JSON.stringify(result.data[0], null, 2)
      // );

      return result;
    },
  })
);