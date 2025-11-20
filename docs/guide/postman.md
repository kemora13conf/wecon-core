# Postman Integration

Wecon automates the tedious task of maintaining API documentation. It generates a full Postman Collection v2.1.0 and Environment file directly from your route definitions.

## Configuration

Enable generation in the `Wecon` builder:

```typescript
.postman({
  name: "My API",
  baseUrl: "http://localhost:3000",
  autoGenerate: true,
  output: {
    collection: "./postman/collection.json",
    environment: "./postman/environment.json"
  }
})
```

## Customizing Folders

Use `PostmanGroup` in your `Routes` definition to customize the folder.

```typescript
import { PostmanGroup } from "@wecon/core";

new Routes({
  prefix: "/auth",
  postman: new PostmanGroup({
    folderName: "Authentication",
    description: "Login and Signup endpoints",
    auth: {
      type: "bearer", // Inherited by all requests in this folder
      bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
    }
  }),
  routes: [...]
});
```

## Customizing Requests

Use `PostmanRoute` in your `Route` definition.

```typescript
import { PostmanRoute } from "@wecon/core";

new Route({
  // ...
  postman: new PostmanRoute({
    name: "User Login",
    description: "Returns a JWT token",
    body: {
      mode: "raw",
      raw: JSON.stringify({ email: "user@example.com", password: "password" })
    },
    event: [
      {
        listen: "test",
        script: {
          exec: [
            "var jsonData = pm.response.json();",
            "pm.environment.set('accessToken', jsonData.token);"
          ]
        }
      }
    ]
  })
});
```

## Variable Extraction

Wecon is smart. It scans your routes and configurations to automatically populate your Postman Environment.

1.  **Path Params**: `/users/:userId` -> `userId` variable created.
2.  **Config Strings**: Any string containing `{{myVar}}` in your Postman config will trigger the creation of `myVar` in the environment.

This ensures your generated environment is always ready to use with no missing variables.
