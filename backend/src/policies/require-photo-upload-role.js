"use strict";

module.exports = async (
  policyContext
) => {
  const user =
    policyContext.state.user;

  if (!user) {
    return false;
  }

  const allowedRoles = [
    "convenor",
    "media_head",
  ];

  return allowedRoles.includes(
    user.appRole
  );
};