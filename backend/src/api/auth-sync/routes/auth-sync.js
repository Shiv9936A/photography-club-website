module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth-sync/user",
      handler: "auth-sync.syncUser",
      config: {
        auth: false,
      },
    },
  ],
};