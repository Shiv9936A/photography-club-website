'use strict';

const authSyncService = require('../services/auth-sync');

const requireInternalSecret = (ctx) => {
  const expectedSecret = process.env.AUTH_SYNC_SECRET;
  const receivedSecret = ctx.request.header['x-auth-sync-secret'];

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    ctx.unauthorized('Unauthorized');
    return false;
  }

  return true;
};

module.exports = {
  async resolveUser(ctx) {
    if (!requireInternalSecret(ctx)) {
      return;
    }

    const { googleId, email, name, picture } = ctx.request.body || {};

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    const user = await authSyncService.resolveUser(strapi, {
      googleId: googleId || '',
      email,
      name,
      picture,
    });

    return {
      data: user,
    };
  },

  async getUser(ctx) {
    if (!requireInternalSecret(ctx)) {
      return;
    }

    const { id } = ctx.params;
    const user = await authSyncService.getUserById(strapi, id);

    if (!user) {
      return ctx.notFound('User not found');
    }

    return {
      data: user,
    };
  },
};
