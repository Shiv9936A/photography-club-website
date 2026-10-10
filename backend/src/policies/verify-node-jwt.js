// @ts-nocheck
"use strict";

const jwt = require("jsonwebtoken");

module.exports = async (policyContext) => {
    try {
        const strapi = global.strapi;

        if (!strapi) {
            console.error("JWT: Strapi instance unavailable");
            return false;
        }

        const authHeader =
            policyContext.request.headers.authorization;

        console.log(
            "JWT AUTH HEADER:",
            authHeader ? "Present" : "Missing"
        );

        if (!authHeader) {
            console.log("JWT: No Authorization header");
            return false;
        }

        if (!authHeader.startsWith("Bearer ")) {
            console.log("JWT: Invalid Authorization format");
            return false;
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            console.log("JWT: Empty token");
            return false;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET is not configured");
            return false;
        }

        let decoded;

        try {
            decoded = jwt.verify(token, secret);
        } catch (jwtError) {
            console.error(
                "JWT VERIFY ERROR:",
                jwtError.message
            );
            return false;
        }

        console.log("JWT DECODED:", decoded);

        const userQuery = strapi.db.query(
            "plugin::users-permissions.user"
        );

        let user = null;

        // Try Strapi user ID
        if (decoded.id) {
            user = await userQuery.findOne({
                where: {
                    id: decoded.id,
                },
            });
        }

        // Try Google ID
        if (!user && decoded.googleId) {
            user = await userQuery.findOne({
                where: {
                    googleId: decoded.googleId,
                },
            });
        }

        // Try email
        if (!user && decoded.email) {
            user = await userQuery.findOne({
                where: {
                    email: decoded.email,
                },
            });
        }

        // Try JWT subject as Google ID
        if (!user && decoded.sub) {
            user = await userQuery.findOne({
                where: {
                    googleId: decoded.sub,
                },
            });
        }

        if (!user) {
            console.log("JWT: Strapi user not found");
            return false;
        }

        console.log("AUTHENTICATED USER:", {
            id: user.id,
            email: user.email,
            isNitk: user.isNitk,
            appRole: user.appRole,
        });

        // Store authenticated Strapi user
        policyContext.state.user = user;

        return true;

    } catch (error) {
        console.error(
            "Node JWT policy error:",
            error instanceof Error
                ? error.message
                : error
        );

        return false;
    }
};