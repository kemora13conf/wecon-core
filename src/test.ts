// import express from "express";
// import Route from "./lib/Route";
// import Routes from "./lib/Routes";
// import RoutesParam from "./lib/RoutesParam";
// import TheLastMiddleware from "./lib/TheLastMiddleware";

// const routes = new Routes({
//   prefix: "/user/users",
//   mergeParams: true,
//   params: [
//     new RoutesParam("userId", (req, res, next, value) => {
//       console.log("User ID param value:", value);
//       req.userId = value;
//       next();
//     }),
//   ],
//   middlewares: [
//     async (req, res, next) => {
//       console.log("Global middleware for /user/users");
//       next();
//     },
//   ],
//   routes: [
//     new Route({
//       path: "/:userId",
//       method: "GET",
//       name: "Get user by ID",
//       description: "Fetch a user by their unique ID",
//       roles: ["admin", "user", "guest"],
//       rai: "user.users:getById",
//       middlewares: [
//         (req, res) => {
//           res.json({
//             message: `User data for ID: ${req.userId || "unknown"}`,
//           });
//         },
//       ],
//     }),
//     new Route({
//       path: "/list",
//       method: "GET",
//       name: "Get all users",
//       description: "Fetch all users from the database",
//       roles: ["admin", "user", "guest"],
//       rai: "user.users:list",
//       middlewares: [
//         (req, res) => {
//           res.json({ message: "List of users" });
//         },
//       ],
//     }),
//     new Routes({
//       // prefix: "/profile",
//       params: [
//         new RoutesParam("userId", (req, res, next, value) => {
//           console.log("Profile ID param value:", value);
//           next();
//         }),
//       ],
//       routes: [
//         new Route({
//           path: "/view",
//           method: "GET",
//           name: "View user profile",
//           description: "View the profile of the logged-in user",
//           roles: ["admin", "user", "guest"],
//           rai: "user.profile:view.me",
//           middlewares: [
//             (req, res) => {
//               res.json({ message: "User profile data" });
//             },
//           ],
//         }),
//         new Route({
//           path: "/update",
//           method: "POST",
//           name: "Update user profile",
//           description: "Update the profile of the logged-in user",
//           roles: ["admin", "user"],
//           rai: "user.profile:update.me",
//           middlewares: [
//             (req, res) => {
//               res.json({ message: "User profile updated" });
//             },
//           ],
//         }),
//       ],
//     }),

//     new Route({
//       path: "/create",
//       method: "POST",
//       name: "Create a new user",
//       description: "Create a new user in the database",
//       roles: ["admin"],
//       rai: "user.profile:update",
//       middlewares: [
//         (req, res) => {
//           res.json({ message: "User created" });
//         },
//       ],
//     }),
//   ],
//   postman: {
//     folderName: "User Management",
//   },
// });

// const app = express();

// app.use(express.json());

// // Use the routes' middleware
// app.use(
//   TheLastMiddleware({
//     rootRoutes: routes,
//     roles: ["admin", "user", "guest"],
//     guestRole: "guest",
//   })
// );

// /**
//  * Error Handler Middleware
//  */
// app.use(
//   (
//     err: any,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     console.error("Message:", err.message);
//     if (err.meta) {
//       console.error("Meta Info:", JSON.stringify(err.meta));
//     }
//     if (err?.meta?.code === "RAI_NOT_FOUND") {
//       res.status(404);
//     } else {
//       res.status(500);
//     }
//     res.json({ error: err.message, meta: err.meta || null });
//   }
// );

// app.listen(3000, () => {
//   console.log("Server is running on http://localhost:3000");
// });
