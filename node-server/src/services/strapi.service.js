import axios from "axios";

const STRAPI_URL =
  process.env.STRAPI_URL || "http://localhost:1337";

/**
 * Sync Google user with Strapi
 *
 * @param {{
 *   googleId: string,
 *   email: string,
 *   name?: string,
 *   picture?: string,
 *   isNitk: boolean
 * }} user
 */
export const syncGoogleUser = async ({
  googleId,
  email,
  name,
  picture,
  isNitk,
}) => {
  try {
    const response = await axios.post(
      `${STRAPI_URL}/api/auth-sync/user`,
      {
        googleId,
        email,
        name,
        picture,
        isNitk,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-sync-secret":
            process.env.AUTH_SYNC_SECRET,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Strapi user sync failed:",
        error.response?.data || error.message
      );
    } else {
      console.error(
        "Strapi user sync failed:",
        error
      );
    }

    throw error;
  }
};