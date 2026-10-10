// @ts-nocheck

"use strict";

module.exports = {
  async publicPhotos(ctx) {
    try {
      const { event } = ctx.query;
      if (!event) return ctx.badRequest("Event documentId is required");
      const eventEntry = await strapi.db.query("api::event.event").findOne({
        where: { documentId: event },
        select: ["id", "documentId"],
      });
      if (!eventEntry) return ctx.send({ success: true, photos: [] });

      const photos = await strapi.db.query("api::event-gallery-photo.event-gallery-photo").findMany({
        where: { visibility: "public", event: eventEntry.id },
        populate: { image: true, event: true },
      });
      return ctx.send({ success: true, photos });
    } catch (error) {
      console.error("Public event gallery error:", error);
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
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const body = ctx.request.body || {};
      const file = ctx.request.files?.files;

      if (!file) {
        return ctx.badRequest("No image uploaded");
      }

      if (Array.isArray(file)) {
        return ctx.badRequest("Upload one image at a time");
      }

      const photoModel = strapi.getModel("api::photo.photo");
      const visibility = body.visibility || "public";
      const tag = body.tag || "Other";
      const capturedDate = body.capturedDate || null;

      if (!["public", "private"].includes(visibility)) {
        return ctx.badRequest("Invalid visibility");
      }

      if (!photoModel.attributes.tag.enum.includes(tag)) {
        return ctx.badRequest("Invalid photo tag");
      }

      if (capturedDate && Number.isNaN(Date.parse(capturedDate))) {
        return ctx.badRequest("Invalid captured date");
      }

      // Upload image to Strapi Media Library
      const uploaded = await strapi.plugin("upload").service("upload").upload({
        data: {},
        files: file,
      });

      const image = uploaded[0];

      // Create a published Strapi 5 document so it is available in the API and Content Manager.
      const data = {
        title: body.title?.trim() || image.name,
        tag,
        visibility,
        capturedDate,
        image: image.id,
        uploadedBy: { connect: [user.documentId] },
        capturedBy: { connect: [user.documentId] },
        likesCount: 0,
      };

      const photo = await strapi.documents("api::photo.photo").create({
        status: "published",
        data: {
          ...data,
        },
        populate: {
          image: true,
          capturedBy: {
            fields: ["username", "googlePicture"],
            populate: { avatar: true },
          },
          uploadedBy: { fields: ["username"] },
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
  async privatePhotos(ctx) {
    try {
      const strapi = global.strapi;
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Authentication required");
      if (user.isNitk !== true) return ctx.forbidden("NITK users only");

      const { event } = ctx.query;
      let eventEntry = null;
      if (event) {
        eventEntry = await strapi.db.query("api::event.event").findOne({
          where: { documentId: event },
          select: ["id", "documentId"],
        });
        if (!eventEntry) return ctx.send({ success: true, photos: [] });
      }

      const photos = await strapi.db
        .query(eventEntry ? "api::event-gallery-photo.event-gallery-photo" : "api::photo.photo")
        .findMany({
        where: eventEntry
          ? { visibility: "private", event: eventEntry.id }
          : { visibility: "private" },
        populate: {
          image: true,
          ...(eventEntry ? { event: true } : {}),
          ...(!eventEntry
            ? {
                capturedBy: {
                  fields: ["username", "googlePicture"],
                  populate: { avatar: true },
                },
                uploadedBy: true,
              }
            : { uploadedBy: true }),
        },
        orderBy: { createdAt: "desc" },
      });

      return ctx.send({ success: true, photos });
    } catch (error) {
      console.error("Private gallery error:", error);
      return ctx.internalServerError("Failed to load private gallery");
    }
  },

  async uploadEventThumbnail(ctx) {
  try {
    const strapi = global.strapi;
    const file = ctx.request.files?.files;

    if (!ctx.state.user) {
      return ctx.unauthorized("Authentication required");
    }

    if (!file || Array.isArray(file)) {
      return ctx.badRequest("Upload exactly one thumbnail image");
    }

    if (!file.mimetype?.startsWith("image/")) {
  return ctx.badRequest("Only image files are allowed");
}

    const uploaded = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        data: {},
        files: file,
      });

    return ctx.send({
      success: true,
      media: uploaded[0],
    });
  } catch (error) {
    console.error("Event thumbnail upload error:", error);
    return ctx.internalServerError("Failed to upload thumbnail");
  }
},

  async uploadEventPhotos(ctx) {
    try {
      const strapi = global.strapi;
      const body = ctx.request.body || {};
      const eventDocumentId = body.event;
      const { visibility, title } = body;
      const files = ctx.request.files?.files;
      if (!eventDocumentId) return ctx.badRequest("Event documentId is required");
      if (!["public", "private"].includes(visibility)) {
        return ctx.badRequest("Invalid visibility");
      }
      if (!files) return ctx.badRequest("No image uploaded");

      const eventEntry = await strapi.db.query("api::event.event").findOne({
        where: { documentId: eventDocumentId },
        select: ["id", "documentId"],
      });
      if (!eventEntry) return ctx.notFound("Event not found");

      const createdPhotos = [];
      for (const file of Array.isArray(files) ? files : [files]) {
        const uploaded = await strapi.plugin("upload").service("upload").upload({
          data: {},
          files: file,
        });
        const image = uploaded[0];
        const photo = await strapi.documents("api::event-gallery-photo.event-gallery-photo").create({
          status: "published",
          data: {
            title: typeof title === "string" && title.trim() ? title.trim() : image.name,
            visibility,
            event: { connect: [eventEntry.documentId] },
            uploadedBy: { connect: [ctx.state.user.documentId] },
            image: image.id,
          },
          populate: { image: true, event: true },
        });
        createdPhotos.push(photo);
      }

      return ctx.send({ success: true, photos: createdPhotos });
    } catch (error) {
      console.error("Event photo upload error:", error);
      return ctx.internalServerError("Failed to upload event photos");
    }
  },
};
