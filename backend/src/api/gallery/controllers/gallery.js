// @ts-nocheck

"use strict";

module.exports = {
    async publicPhotos(ctx) {
        try {
            const strapi = global.strapi;

            const { event } = ctx.query;

            if (!event) {
                return ctx.badRequest(
                    "Event documentId is required"
                );
            }

            /*
             * Find event using documentId.
             */
            const eventEntry = await strapi.db
                .query("api::event.event")
                .findOne({
                    where: {
                        documentId: event,
                    },
                    select: [
                        "id",
                        "documentId",
                        "EventName",
                    ],
                });

            if (!eventEntry) {
                console.log(
                    "PUBLIC: Event not found:",
                    event
                );

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
                eventEntry.id
            );

            /*
             * Find PUBLIC photos belonging to THIS event.
             */
            const photos = await strapi.db
                .query("api::photo.photo")
                .findMany({
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
                    eventDocumentId:
                        photo.event?.documentId,
                }))
            );

            return ctx.send({
                success: true,
                photos,
            });

        } catch (error) {
            console.error(
                "Public gallery error:",
                error
            );

            return ctx.internalServerError(
                "Failed to load public gallery"
            );
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
                    : null
            );

            if (!user) {
                return ctx.unauthorized(
                    "Authentication required"
                );
            }

            if (user.isNitk !== true) {
                return ctx.forbidden(
                    "NITK users only"
                );
            }

            const { event } = ctx.query;

            if (!event) {
                return ctx.badRequest(
                    "Event documentId is required"
                );
            }

            /*
             * Find event using documentId.
             */
            const eventEntry = await strapi.db
                .query("api::event.event")
                .findOne({
                    where: {
                        documentId: event,
                    },
                    select: [
                        "id",
                        "documentId",
                        "EventName",
                    ],
                });

            if (!eventEntry) {
                console.log(
                    "PRIVATE: Event not found:",
                    event
                );

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
                eventEntry.id
            );

            /*
             * Find PRIVATE photos belonging to THIS event.
             */
            const photos = await strapi.db
                .query("api::photo.photo")
                .findMany({
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
                    eventDocumentId:
                        photo.event?.documentId,
                }))
            );

            return ctx.send({
                success: true,
                photos,
            });

        } catch (error) {
            console.error(
                "Private gallery error:",
                error
            );

            return ctx.internalServerError(
                "Failed to load private gallery"
            );
        }
    },
};