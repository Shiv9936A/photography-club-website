// @ts-nocheck

"use strict";

module.exports = {
  async publicPhotos(ctx) {
    try {
      const strapi = global.strapi;

      const { event } = ctx.query;

      if (!event) {
        return ctx.badRequest("Event documentId is required");
      }

      /*
       * Find event using documentId.
       */
      const eventEntry = await strapi.db.query("api::event.event").findOne({
        where: {
          documentId: event,
        },
        select: ["id", "documentId", "EventName"],
      });

      if (!eventEntry) {
        console.log("PUBLIC: Event not found:", event);

        return ctx.send({
          success: true,
          photos: [],
        });
      }

      console.log(
        "PUBLIC EVENT:",
        eventEntry.documentId,
        eventEntry.EventName,
        "DB ID:",
        eventEntry.id,
      );

      /*
       * Find PUBLIC photos belonging to THIS event.
       */
      const photos = await strapi.db.query("api::photo.photo").findMany({
        where: {
          visibility: "public",
          event: eventEntry.id,
        },

        populate: {
          image: true,
          event: true,
        },

        orderBy: {
          displayOrder: "asc",
        },

        limit: 10,
      });

      console.log(
        "PUBLIC EVENT PHOTOS:",
        photos.map((photo) => ({
          id: photo.id,
          documentId: photo.documentId,
          title: photo.title,
          visibility: photo.visibility,
          eventId: photo.event?.id,
          eventDocumentId: photo.event?.documentId,
        })),
      );

      return ctx.send({
        success: true,
        photos,
      });
    } catch (error) {
      console.error("Public gallery error:", error);

      return ctx.internalServerError("Failed to load public gallery");
    }
  },

  members: async (ctx) => {
    try {
      const users = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          select: ["id", "documentId", "username", "email"],
        });

      ctx.body = users;
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return ctx.internalServerError("Failed to fetch members");
    }
  },

  async uploadPhoto(ctx) {
    try {
      const strapi = global.strapi;

      const { title, tag, visibility, capturedBy } = ctx.request.body;

      const file = ctx.request.files?.files;

      if (!file) {
        return ctx.badRequest("No image uploaded");
      }

      if (!capturedBy) {
        return ctx.badRequest("Photographer is required");
      }

      // Check photographer exists
      const photographer = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: Number(capturedBy),
          },
        });

      if (!photographer) {
        return ctx.badRequest("Photographer not found");
      }

      // Upload image to Strapi Media Library
      const uploaded = await strapi.plugin("upload").service("upload").upload({
        data: {},
        files: file,
      });

      const image = uploaded[0];

      // Create photo record
      const photo = await strapi.db.query("api::photo.photo").create({
        data: {
          title: title || image.name,
          tag: tag || "Other",
          visibility: visibility || "public",
          image: image.id,
          capturedBy: photographer.id,
        },

        populate: {
          image: true,
          capturedBy: true,
        },
      });

      return ctx.send({
        success: true,
        photo,
      });
    } catch (error) {
      console.error("PHOTO UPLOAD ERROR:", error);

      return ctx.internalServerError("Failed to upload photo");
    }
  },

  async uploadEventPhotos(ctx) {
    try {
      const strapi = global.strapi;

      const { event, visibility, title } = ctx.request.body;

      if (!event) {
        return ctx.badRequest("Event documentId is required");
      }

      if (!["public", "private"].includes(visibility)) {
        return ctx.badRequest("Invalid visibility");
      }

      const files = ctx.request.files?.files;

      if (!files) {
        return ctx.badRequest("No image uploaded");
      }

      // Find event
      const eventEntry = await strapi.db.query("api::event.event").findOne({
        where: {
          documentId: event,
        },
      });

      if (!eventEntry) {
        return ctx.notFound("Event not found");
      }

      // Normalize single/multiple files
      const fileList = Array.isArray(files) ? files : [files];

      const uploadedPhotos = [];

      for (const file of fileList) {
        // Upload image to Strapi media library
        const uploaded = await strapi
          .plugin("upload")
          .service("upload")
          .upload({
            data: {},
            files: file,
          });

        const image = uploaded[0];

        // Create photo record linked to THIS event
        const photo = await strapi.db.query("api::photo.photo").create({
          data: {
            title: title || image.name,
            visibility,
            event: eventEntry.id,
            image: image.id,
            displayOrder: 0,
          },
          populate: {
            image: true,
            event: true,
          },
        });

        uploadedPhotos.push(photo);
      }

      return ctx.send({
        success: true,
        photos: uploadedPhotos,
      });
    } catch (error) {
      console.error("EVENT PHOTO UPLOAD ERROR:", error);

      return ctx.internalServerError("Failed to upload event photos");
    }
  },

  async privatePhotos(ctx) {
    try {
      const strapi = global.strapi;

      const user = ctx.state.user;

      console.log(
        "PRIVATE GALLERY USER:",
        user
          ? {
              id: user.id,
              email: user.email,
              isNitk: user.isNitk,
            }
          : null,
      );

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.isNitk !== true) {
        return ctx.forbidden("NITK users only");
      }

      const { event } = ctx.query;

      if (!event) {
        return ctx.badRequest("Event documentId is required");
      }

      /*
       * Find event using documentId.
       */
      const eventEntry = await strapi.db.query("api::event.event").findOne({
        where: {
          documentId: event,
        },
        select: ["id", "documentId", "EventName"],
      });

      if (!eventEntry) {
        console.log("PRIVATE: Event not found:", event);

        return ctx.send({
          success: true,
          photos: [],
        });
      }

      console.log(
        "PRIVATE EVENT:",
        eventEntry.documentId,
        eventEntry.EventName,
        "DB ID:",
        eventEntry.id,
      );

      /*
       * Find PRIVATE photos belonging to THIS event.
       */
      const photos = await strapi.db.query("api::photo.photo").findMany({
        where: {
          visibility: "private",
          event: eventEntry.id,
        },

        populate: {
          image: true,
          event: true,
        },

        orderBy: {
          displayOrder: "asc",
        },
      });

      console.log(
        "PRIVATE EVENT PHOTOS:",
        photos.map((photo) => ({
          id: photo.id,
          documentId: photo.documentId,
          title: photo.title,
          visibility: photo.visibility,
          eventId: photo.event?.id,
          eventDocumentId: photo.event?.documentId,
        })),
      );

      return ctx.send({
        success: true,
        photos,
      });
    } catch (error) {
      console.error("Private gallery error:", error);

      return ctx.internalServerError("Failed to load private gallery");
    }
  },
};
