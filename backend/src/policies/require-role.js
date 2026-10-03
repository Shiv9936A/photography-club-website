// @ts-nocheck
"use strict";

module.exports = async (policyContext, config) => {
  try {
    const user = policyContext.state.user;

    console.log("========== REQUIRE ROLE ==========");
    console.log("USER APP ROLE:", user?.appRole);
    console.log("USER ROLE:", user?.role);
    console.log("ALLOWED ROLES:", config?.roles);
    console.log("==================================");

    if (!user) {
      return false;
    }

    const allowedRoles = config?.roles || [];
    const userRole = user.appRole;

    if (!allowedRoles.includes(userRole)) {
      console.log("ROLE REJECTED:", userRole);
      return false;
    }

    console.log("ROLE ACCEPTED:", userRole);
    return true;

  } catch (error) {
    console.error(
      "Role authorization failed:",
      error instanceof Error ? error.message : error
    );

    return false;
  }
};