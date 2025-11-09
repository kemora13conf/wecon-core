import Route from "./lib/Route";
import Routes from "./lib/Routes";

const routes = new Routes({
  prefix: "/user/users",
  routes: [
    new Route({
      path: "/list",
      method: "GET",
      name: "Get all users",
      description: "Fetch all users from the database",
      roles: ["admin", "user"],
      rai: "user.users:list",
      middlewares: [
        (req, res) => {
          res.json({ message: "List of users" });
        },
      ],
    }),
    new Routes({
      prefix: "/profile",
      routes: [
        new Route({
          path: "/view",
          method: "GET",
          name: "View user profile",
          description: "View the profile of the logged-in user",
          roles: ["admin", "user", "guest"],
          rai: "user.profile:view",
          middlewares: [
            (req, res) => {
              res.json({ message: "User profile data" });
            },
          ],
        }),
        new Route({
          path: "/update",
          method: "POST",
          name: "Update user profile",
          description: "Update the profile of the logged-in user",
          // roles: ["admin", "user"],
          rai: "user.profile:update",
          middlewares: [
            (req, res) => {
              res.json({ message: "User profile updated" });
            },
          ],
        }),
      ],
    }),

    new Route({
      path: "/create",
      method: "POST",
      name: "Create a new user",
      description: "Create a new user in the database",
      roles: ["admin"],
      rai: "user.users:create",
      middlewares: [
        (req, res) => {
          res.json({ message: "User created" });
        },
      ],
    }),
  ],
  postman: {
    folderName: "User Management",
  },
});
// .groupRoutesByRai();

// console.log(
//   "Grouped Routes by RAI:",
//   new Array(...routes.entries()).flat().filter((item) => {
//     return typeof item !== "string";
//   })
// );
