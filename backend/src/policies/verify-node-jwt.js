"use strict";

const jwt = require("jsonwebtoken");

module.exports = async (policyContext /** @type {any} */) => {
  try {
    const authHeader =
      policyContext.request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    if (!authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return false;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");
      return false;
    }

    const decoded = jwt.verify(token, secret);

    policyContext.state.user = decoded;

    return true;
  } catch (error) {
    console.error(
      "Node JWT verification failed:",
      error instanceof Error ? error.message : error
    );

    return false;
  }
};