"use strict";

module.exports = async (policyContext, config) => {
  try {
    const user = policyContext.state.user;

    // JWT authentication must happen first
    if (!user) {
      return policyContext.unauthorized(
        "Authentication required"
      );
    }

    const allowedRoles = config?.roles || [];

    if (!allowedRoles.includes(user.role)) {
      return policyContext.forbidden(
        "You do not have permission to perform this action"
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Role authorization failed:",
      error instanceof Error ? error.message : error
    );

    return false;
  }
};