const PHOTO_UPLOAD_ROLES = new Set(["admin", "sig-coordinator"]);

export const getPhotoUploadSession = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const rawPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = rawPayload.padEnd(
      rawPayload.length + ((4 - (rawPayload.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(payload));
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");

    return {
      token,
      role: decoded.role,
      email: decoded.email || storedUser?.email || "",
      name: storedUser?.name || "",
    };
  } catch {
    return null;
  }
};

export const canUploadPhoto = (session = getPhotoUploadSession()) =>
  Boolean(session && PHOTO_UPLOAD_ROLES.has(session.role));
