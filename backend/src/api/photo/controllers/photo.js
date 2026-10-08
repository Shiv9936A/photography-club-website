// @ts-nocheck

"use strict";

const { createCoreController } =
  require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::photo.photo",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Authentication required");
      if (!user.documentId) {
        return ctx.internalServerError("Authenticated user document is unavailable");
      }

      const payload = ctx.request.body?.data;
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return ctx.badRequest("Photo data is required");
      }

      ctx.request.body.data = {
        ...payload,
        uploadedBy: { connect: [user.documentId] },
        capturedBy: { connect: [user.documentId] },
        likesCount: 0,
      };

      return super.create(ctx);
    },

    async find(ctx) {
      ctx.query.populate = {
        image: true,
        capturedBy: {
          fields: ["username", "googlePicture"],
          populate: { avatar: true },
        },
        uploadedBy: true,
      };

      const result = await super.find(ctx);
      const photoIds = result.data.map((photo) => photo.id);
      const [likesCounts, photosWithCapturedBy] = await Promise.all([
        Promise.all(
          photoIds.map((photoId) =>
            strapi.db.query("api::photo-like.photo-like").count({
              where: { photo: photoId },
            }),
          ),
        ),
        photoIds.length
          ? strapi.db.query("api::photo.photo").findMany({
              where: { id: { $in: photoIds } },
              select: ["id"],
              populate: {
                capturedBy: {
                  select: ["username", "googlePicture"],
                  populate: { avatar: true },
                },
              },
            })
          : [],
      ]);
      const capturedByByPhotoId = new Map(
        photosWithCapturedBy.map((photo) => [photo.id, photo.capturedBy]),
      );

      result.data = result.data.map((photo, index) => ({
        ...photo,
        capturedBy: capturedByByPhotoId.get(photo.id) || null,
        likesCount: likesCounts[index],
      }));
      return result;
    },

    async getMyPhotoLikes(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Authentication required");

      const likes = await strapi.db.query("api::photo-like.photo-like").findMany({
        where: { user: user.id },
        populate: { photo: { fields: ["documentId"] } },
      });

      return {
        data: {
          documentIds: likes.map((like) => like.photo?.documentId).filter(Boolean),
        },
      };
    },

    async likePhoto(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Authentication required");

      const photo = await findPublishedPhoto(strapi, ctx.params.documentId, ctx);
      if (!photo) return;

      const likesQuery = strapi.db.query("api::photo-like.photo-like");
      const where = { user: user.id, photo: photo.id };
      const existingLike = await likesQuery.findOne({ where });

      if (!existingLike) {
        try {
          await likesQuery.create({
            data: where,
          });
        } catch (error) {
          // The database unique index also protects simultaneous/replayed requests.
          const like = await likesQuery.findOne({ where });
          if (!like) throw error;
        }
      }

      const likesCount = await syncLikesCount(strapi, photo.id);
      return ctx.send({ data: { liked: true, likesCount } });
    },

    async unlikePhoto(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Authentication required");

      const photo = await findPublishedPhoto(strapi, ctx.params.documentId, ctx);
      if (!photo) return;

      await strapi.db.connection("photo_likes")
        .where({ user_id: user.id, photo_id: photo.id })
        .delete();

      const likesCount = await syncLikesCount(strapi, photo.id);
      return ctx.send({ data: { liked: false, likesCount } });
    },
  })
);

async function findPublishedPhoto(strapi, documentId, ctx) {
  if (!documentId) {
    ctx.badRequest("Missing documentId");
    return null;
  }

  const photo = await strapi.documents("api::photo.photo").findOne({
    documentId,
    status: "published",
    fields: ["likesCount"],
  });

  if (!photo) {
    ctx.notFound("Photo not found");
    return null;
  }

  return photo;
}

async function syncLikesCount(strapi, photoId) {
  const likesCount = await strapi.db.query("api::photo-like.photo-like").count({
    where: { photo: photoId },
  });

  await strapi.db.connection("photos")
    .where({ id: photoId })
    .update({ likes_count: likesCount });

  return likesCount;
}
