'use strict';

const normalizeEmail = (email) => email.trim().toLowerCase();

const deriveIsNitk = (email) => normalizeEmail(email).endsWith('@nitk.edu.in');

const getAuthenticatedRole = async (strapi) => {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  return role?.id ?? null;
};

const getUserQuery = (strapi) => strapi.db.query('plugin::users-permissions.user');

const toPublicUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture || null,
    role: user.appRole || 'user',
    isNitk: Boolean(user.isNitk),
  };
};

module.exports = {
  async resolveUser(strapi, profile) {
    const email = normalizeEmail(profile.email);
    const googleId = profile.googleId?.trim();
    const userQuery = getUserQuery(strapi);

    const userByEmail = await userQuery.findOne({
      where: { email },
    });
    const userByGoogleId = googleId
      ? await userQuery.findOne({
          where: { googleId },
        })
      : null;

    const existingUser = userByGoogleId || userByEmail;

    const authenticatedRoleId = await getAuthenticatedRole(strapi);
    const isNitk = deriveIsNitk(email);

    if (existingUser) {
      const updatedUser = await userQuery.update({
        where: { id: existingUser.id },
        data: {
          googleId: googleId || existingUser.googleId,
          name: profile.name || existingUser.name,
          picture: profile.picture || existingUser.picture || null,
          isNitk,
          appRole: existingUser.appRole || 'user',
        },
      });

      return toPublicUser(updatedUser);
    }

    const createdUser = await userQuery.create({
      data: {
        username: profile.email,
        email,
        provider: 'google',
        confirmed: true,
        blocked: false,
        role: authenticatedRoleId,
        googleId,
        name: profile.name || profile.email,
        picture: profile.picture || null,
        appRole: 'user',
        isNitk,
      },
    });

    return toPublicUser(createdUser);
  },

  async getUserById(strapi, userId) {
    const user = await getUserQuery(strapi).findOne({
      where: { id: Number(userId) || userId },
    });

    return toPublicUser(user);
  },
};
