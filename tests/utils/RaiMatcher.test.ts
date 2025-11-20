/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "@jest/globals";
import RaiMatcher from "../../src/utils/RaiMatcher.js";
import type { RaiRoutesList } from "../../src/utils/RaiMatcher.js";

describe("RaiMatcher", () => {
  describe("Constructor and Initialization", () => {
    it("should create an instance of RaiMatcher", () => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
      ];
      const matcher = new RaiMatcher(routes);
      expect(matcher).toBeInstanceOf(RaiMatcher);
    });

    it("should initialize with empty routes array", () => {
      const matcher = new RaiMatcher([]);
      expect(matcher).toBeInstanceOf(RaiMatcher);
    });

    it("should handle multiple routes", () => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
        { path: "/users/:id", method: "GET", rai: "users:read" },
        { path: "/users", method: "POST", rai: "users:create" },
      ];
      const matcher = new RaiMatcher(routes);
      expect(matcher).toBeInstanceOf(RaiMatcher);
    });
  });

  describe("Exact Route Matching", () => {
    let matcher: RaiMatcher;

    beforeEach(() => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
        { path: "/products", method: "GET", rai: "products:list" },
        { path: "/admin/dashboard", method: "GET", rai: "admin:dashboard" },
      ];
      matcher = new RaiMatcher(routes);
    });

    it("should find exact match for simple path", () => {
      const rai = matcher.findRai("/users", "GET");
      expect(rai).toBe("users:list");
    });

    it("should find exact match for nested path", () => {
      const rai = matcher.findRai("/admin/dashboard", "GET");
      expect(rai).toBe("admin:dashboard");
    });

    it("should match paths with trailing slash", () => {
      const rai = matcher.findRai("/users/", "GET");
      expect(rai).toBe("users:list");
    });

    it("should match paths without trailing slash", () => {
      const rai = matcher.findRai("/products", "GET");
      expect(rai).toBe("products:list");
    });
  });

  describe("Dynamic Route Matching (Parameters)", () => {
    let matcher: RaiMatcher;

    beforeEach(() => {
      const routes: RaiRoutesList = [
        { path: "/users/:id", method: "GET", rai: "users:read" },
        { path: "/users/:id/posts", method: "GET", rai: "users:posts:list" },
        {
          path: "/users/:userId/posts/:postId",
          method: "GET",
          rai: "users:posts:read",
        },
      ];
      matcher = new RaiMatcher(routes);
    });

    it("should match single parameter route", () => {
      const rai = matcher.findRai("/users/123", "GET");
      expect(rai).toBe("users:read");
    });

    it("should match route with parameter and nested path", () => {
      const rai = matcher.findRai("/users/123/posts", "GET");
      expect(rai).toBe("users:posts:list");
    });

    it("should match multiple parameters", () => {
      const rai = matcher.findRai("/users/123/posts/456", "GET");
      expect(rai).toBe("users:posts:read");
    });

    it("should match parameters with UUID format", () => {
      const rai = matcher.findRai(
        "/users/550e8400-e29b-41d4-a716-446655440000",
        "GET"
      );
      expect(rai).toBe("users:read");
    });

    it("should match parameters with special characters (encoded)", () => {
      const rai = matcher.findRai("/users/test%40example.com", "GET");
      expect(rai).toBe("users:read");
    });
  });

  describe("HTTP Method Differentiation", () => {
    let matcher: RaiMatcher;

    beforeEach(() => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
        { path: "/users", method: "POST", rai: "users:create" },
        { path: "/users/:id", method: "GET", rai: "users:read" },
        { path: "/users/:id", method: "PUT", rai: "users:update" },
        { path: "/users/:id", method: "DELETE", rai: "users:delete" },
      ];
      matcher = new RaiMatcher(routes);
    });

    it("should differentiate GET request", () => {
      const rai = matcher.findRai("/users", "GET");
      expect(rai).toBe("users:list");
    });

    it("should differentiate POST request", () => {
      const rai = matcher.findRai("/users", "POST");
      expect(rai).toBe("users:create");
    });

    it("should differentiate PUT request on same path", () => {
      const rai = matcher.findRai("/users/123", "PUT");
      expect(rai).toBe("users:update");
    });

    it("should differentiate DELETE request", () => {
      const rai = matcher.findRai("/users/123", "DELETE");
      expect(rai).toBe("users:delete");
    });

    it("should handle case-insensitive method matching", () => {
      const rai = matcher.findRai("/users", "get");
      expect(rai).toBe("users:list");
    });

    it("should handle lowercase method", () => {
      const rai = matcher.findRai("/users", "post");
      expect(rai).toBe("users:create");
    });
  });

  describe("Route Specificity and Priority", () => {
    let matcher: RaiMatcher;

    beforeEach(() => {
      const routes: RaiRoutesList = [
        { path: "/users/:id", method: "GET", rai: "users:read" },
        { path: "/users/me", method: "GET", rai: "users:me" },
        {
          path: "/products/:category/:item",
          method: "GET",
          rai: "products:item",
        },
        {
          path: "/products/electronics/phones",
          method: "GET",
          rai: "products:phones",
        },
      ];
      matcher = new RaiMatcher(routes);
    });

    it("should prioritize static route over dynamic route", () => {
      const rai = matcher.findRai("/users/me", "GET");
      expect(rai).toBe("users:me");
    });

    it("should still match dynamic route for other values", () => {
      const rai = matcher.findRai("/users/123", "GET");
      expect(rai).toBe("users:read");
    });

    it("should prioritize fully static nested path", () => {
      const rai = matcher.findRai("/products/electronics/phones", "GET");
      expect(rai).toBe("products:phones");
    });

    it("should match dynamic nested path for other values", () => {
      const rai = matcher.findRai("/products/clothing/shirts", "GET");
      expect(rai).toBe("products:item");
    });
  });

  describe("Error Handling", () => {
    let matcher: RaiMatcher;

    beforeEach(() => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
        { path: "/products/:id", method: "GET", rai: "products:read" },
      ];
      matcher = new RaiMatcher(routes);
    });

    it("should throw error for non-existent route", () => {
      expect(() => {
        matcher.findRai("/nonexistent", "GET");
      }).toThrow();
    });

    it("should throw error for wrong method", () => {
      expect(() => {
        matcher.findRai("/users", "DELETE");
      }).toThrow();
    });

    it("should include helpful error information", () => {
      try {
        matcher.findRai("/unknown", "GET");
      } catch (error: any) {
        expect(error.message).toContain("No RAI found");
        expect(error.message).toContain("/unknown");
      }
    });
  });

  describe("Caching Functionality", () => {
    let matcher: RaiMatcher;

    beforeEach(() => {
      const routes: RaiRoutesList = [
        { path: "/users/:id", method: "GET", rai: "users:read" },
        { path: "/products/:id", method: "GET", rai: "products:read" },
      ];
      matcher = new RaiMatcher(routes);
    });

    it("should return same RAI on repeated calls (cache hit)", () => {
      const rai1 = matcher.findRai("/users/123", "GET");
      const rai2 = matcher.findRai("/users/123", "GET");
      expect(rai1).toBe(rai2);
      expect(rai1).toBe("users:read");
    });

    it("should handle different paths independently", () => {
      const rai1 = matcher.findRai("/users/123", "GET");
      const rai2 = matcher.findRai("/products/456", "GET");
      expect(rai1).toBe("users:read");
      expect(rai2).toBe("products:read");
    });

    it("should provide cache statistics", () => {
      matcher.findRai("/users/123", "GET");
      matcher.findRai("/products/456", "GET");
      const stats = matcher.getCacheStats();
      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("methods");
      expect(stats.methods).toContain("GET");
    });

    it("should clear cache successfully", () => {
      matcher.findRai("/users/123", "GET");
      const statsBefore = matcher.getCacheStats();
      expect(statsBefore.size).toBeGreaterThan(0);

      matcher.clearCache();
      const statsAfter = matcher.getCacheStats();
      expect(statsAfter.size).toBe(0);
    });

    it("should still work after cache clear", () => {
      matcher.findRai("/users/123", "GET");
      matcher.clearCache();
      const rai = matcher.findRai("/users/123", "GET");
      expect(rai).toBe("users:read");
    });
  });

  describe("Edge Cases", () => {
    it("should handle root path", () => {
      const routes: RaiRoutesList = [{ path: "/", method: "GET", rai: "root" }];
      const matcher = new RaiMatcher(routes);
      const rai = matcher.findRai("/", "GET");
      expect(rai).toBe("root");
    });

    it("should handle deeply nested paths", () => {
      const routes: RaiRoutesList = [
        {
          path: "/api/v1/admin/users/permissions/roles",
          method: "GET",
          rai: "admin:roles",
        },
      ];
      const matcher = new RaiMatcher(routes);
      const rai = matcher.findRai(
        "/api/v1/admin/users/permissions/roles",
        "GET"
      );
      expect(rai).toBe("admin:roles");
    });

    it("should handle paths with multiple consecutive slashes (normalized)", () => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
      ];
      const matcher = new RaiMatcher(routes);
      // Note: path-to-regexp handles normalization
      const rai = matcher.findRai("/users", "GET");
      expect(rai).toBe("users:list");
    });

    it("should handle empty method string gracefully", () => {
      const routes: RaiRoutesList = [
        { path: "/users", method: "GET", rai: "users:list" },
      ];
      const matcher = new RaiMatcher(routes);
      expect(() => {
        matcher.findRai("/users", "");
      }).toThrow();
    });

    it("should handle very long parameter values", () => {
      const routes: RaiRoutesList = [
        { path: "/users/:id", method: "GET", rai: "users:read" },
      ];
      const matcher = new RaiMatcher(routes);
      const longId = "A".repeat(1000);
      const rai = matcher.findRai(`/users/${longId}`, "GET");
      expect(rai).toBe("users:read");
    });
  });

  describe("Complex Routing Scenarios", () => {
    it("should handle mixed static and dynamic segments", () => {
      const routes: RaiRoutesList = [
        {
          path: "/api/v1/users/:userId/posts/:postId/comments",
          method: "GET",
          rai: "comments:list",
        },
        {
          path: "/api/v1/users/:userId/posts/:postId/comments/:commentId",
          method: "GET",
          rai: "comments:read",
        },
      ];
      const matcher = new RaiMatcher(routes);

      const rai1 = matcher.findRai(
        "/api/v1/users/123/posts/456/comments",
        "GET"
      );
      expect(rai1).toBe("comments:list");

      const rai2 = matcher.findRai(
        "/api/v1/users/123/posts/456/comments/789",
        "GET"
      );
      expect(rai2).toBe("comments:read");
    });

    it("should handle versioned APIs", () => {
      const routes: RaiRoutesList = [
        { path: "/api/v1/users", method: "GET", rai: "v1:users:list" },
        { path: "/api/v2/users", method: "GET", rai: "v2:users:list" },
      ];
      const matcher = new RaiMatcher(routes);

      const rai1 = matcher.findRai("/api/v1/users", "GET");
      expect(rai1).toBe("v1:users:list");

      const rai2 = matcher.findRai("/api/v2/users", "GET");
      expect(rai2).toBe("v2:users:list");
    });
  });

  describe("Performance Characteristics", () => {
    it("should handle large number of routes", () => {
      const routes: RaiRoutesList = [];
      for (let i = 0; i < 1000; i++) {
        routes.push({
          path: `/route${i}/:id`,
          method: "GET",
          rai: `route${i}:read`,
        });
      }
      const matcher = new RaiMatcher(routes);

      const rai = matcher.findRai("/route500/123", "GET");
      expect(rai).toBe("route500:read");
    });

    it("should maintain performance with repeated lookups", () => {
      const routes: RaiRoutesList = [
        { path: "/users/:id", method: "GET", rai: "users:read" },
      ];
      const matcher = new RaiMatcher(routes);

      // First lookup (uncached)
      const rai1 = matcher.findRai("/users/123", "GET");

      // Subsequent lookups (cached)
      for (let i = 0; i < 100; i++) {
        const rai = matcher.findRai("/users/123", "GET");
        expect(rai).toBe("users:read");
      }

      expect(rai1).toBe("users:read");
    });
  });
});
