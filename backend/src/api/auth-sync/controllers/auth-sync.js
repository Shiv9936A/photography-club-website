"use strict";

/**
 * @param {any} ctx
 */

async function syncUser(ctx) {
  try {
    const strapi = global.strapi;

    const providedSecret = ctx.request.headers["x-auth-sync-secret"];

    if (!providedSecret || providedSecret !== process.env.AUTH_SYNC_SECRET) {
      return ctx.unauthorized("Invalid auth sync secret");
    }

    const { googleId, email, name, picture, isNitk } = ctx.request.body;

    if (!googleId || !email) {
      return ctx.badRequest("googleId and email are required");
    }

    const existingUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { googleId },
      });

    if (existingUser) {
      const updatedUser = await strapi.db
        .query("plugin::users-permissions.user")
        .update({
          where: { id: existingUser.id },
          data: {
            email,
            name: name || existingUser.name,
            googlePicture: picture || existingUser.googlePicture,
            isNitk: Boolean(isNitk),
            provider: "google",
          },
        });

      return ctx.send({
        success: true,
        created: false,
        user: updatedUser,
      });
    }

    const existingEmailUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email },
      });

    if (existingEmailUser) {
      return ctx.conflict("A user with this email already exists");
    }

    const authenticatedRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "authenticated" },
      });

    if (!authenticatedRole) {
      return ctx.internalServerError("Authenticated role not found");
    }

    const usernameBase = email.split("@")[0];
    const username = `${usernameBase}-${googleId.slice(-6)}`
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-");

    const newUser = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          username,
          email,
          name: name || "Unknown Photographer",
          googleId,
          googlePicture: picture || null,
          isNitk: Boolean(isNitk),
          appRole: "user",
          provider: "google",
          confirmed: true,
          blocked: false,
          role: authenticatedRole.id,
        },
      });

    return ctx.send({
      success: true,
      created: true,
      user: newUser,
    });
  } catch (error) {
    console.error("========== AUTH SYNC ERROR ==========");
    console.error(error instanceof Error ? error.message : error);
    console.error(error instanceof Error ? error.stack : "");
    console.error("======================================");
    return ctx.internalServerError("Failed to synchronize user");
  }
}

module.exports = {
  syncUser,
};
