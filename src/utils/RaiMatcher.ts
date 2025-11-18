import { match, MatchFunction, ParamData } from "path-to-regexp";
import errors from "../errors";
import Route from "../lib/Route";

export type RaiRoutesList = Array<Pick<Route, "path" | "method" | "rai">>;

interface CachedRoute {
  matcher: MatchFunction<ParamData>;
  rai: string;
  method: string;
  path: string;
}

/**
 * RAI Matcher with built-in caching for optimal performance
 */
class RaiMatcher {
  private cache: Map<string, CachedRoute>;
  private routesByMethod: Map<string, CachedRoute[]>;
  private exactRoutes: Map<string, string>; // For exact path matches (no params)

  constructor(raisList: RaiRoutesList) {
    this.cache = new Map();
    this.routesByMethod = new Map();
    this.exactRoutes = new Map();
    this.initialize(raisList);
  }

  /**
   * Pre-compile all route matchers and organize by HTTP method for faster lookup
   */
  private initialize(raisList: RaiRoutesList): void {
    for (const route of raisList) {
      if (typeof route.path !== "string" || !route.method) {
        console.warn(`Invalid route configuration:`, route);
        continue;
      }

      const normalizedMethod = route.method.trim().toUpperCase();

      // Check if this is an exact route (no params)
      if (!route.path.includes(":") && !route.path.includes("*")) {
        const exactKey = `${normalizedMethod}:${route.path}`;
        this.exactRoutes.set(exactKey, route.rai);

        // Also add with trailing slash variant
        const withSlash = route.path.endsWith("/")
          ? route.path.slice(0, -1)
          : route.path + "/";
        this.exactRoutes.set(`${normalizedMethod}:${withSlash}`, route.rai);
      }

      const cachedRoute: CachedRoute = {
        matcher: match(route.path, { decode: decodeURIComponent }),
        rai: route.rai,
        method: normalizedMethod,
        path: route.path,
      };

      if (!this.routesByMethod.has(normalizedMethod)) {
        this.routesByMethod.set(normalizedMethod, []);
      }

      this.routesByMethod.get(normalizedMethod)!.push(cachedRoute);
    }

    // Sort routes by specificity (more specific routes first)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, routes] of this.routesByMethod) {
      routes.sort(
        (a, b) =>
          this.getRouteSpecificity(b.path) - this.getRouteSpecificity(a.path)
      );
    }
  }

  /**
   * Calculate route specificity score (higher = more specific)
   * Static segments score higher than dynamic ones
   */
  private getRouteSpecificity(path: string): number {
    let score = 0;
    const segments = path.split("/").filter(Boolean);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segment.startsWith(":")) {
        score += 1; // Dynamic segment
      } else if (segment === "*") {
        score += 0.5; // Wildcard
      } else {
        score += 10; // Static segment (most specific)
      }
      // Earlier segments are more important
      score += (segments.length - i) * 0.1;
    }

    return score;
  }

  /**
   * Normalize route by handling trailing slashes
   */
  private normalizeRoute(route: string): {
    primary: string;
    alternate: string;
  } {
    const primary =
      route.endsWith("/") && route.length > 1 ? route.slice(0, -1) : route;

    const alternate =
      primary === route ? (route === "/" ? route : route + "/") : route;

    return { primary, alternate };
  }

  /**
   * Find RAI for the given request path and method
   */
  public findRai(path: string, method: string): string {
    const normalizedMethod = method.trim().toUpperCase();
    const { primary, alternate } = this.normalizeRoute(path);

    // 1. Check exact match cache first (fastest)
    const exactKey = `${normalizedMethod}:${primary}`;
    if (this.exactRoutes.has(exactKey)) {
      return this.exactRoutes.get(exactKey)!;
    }

    // 2. Check runtime cache for previously matched dynamic routes
    const cacheKey = `${normalizedMethod}:${primary}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached.rai;
    }

    // 3. Get routes for this specific HTTP method
    const methodRoutes = this.routesByMethod.get(normalizedMethod);
    if (!methodRoutes) {
      throw new errors.RequestError(
        `No RAI found for the request URL: ${path} with method: ${method}`,
        {
          code: "RAI_NOT_FOUND",
          route: path,
          method,
        }
      );
    }

    // 4. Try matching against method-specific routes
    for (const route of methodRoutes) {
      const matchResult = route.matcher(primary) || route.matcher(alternate);

      if (matchResult) {
        // Cache this match for future requests
        this.cache.set(cacheKey, route);

        // Limit cache size to prevent memory issues
        if (this.cache.size > 1000) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey!);
        }

        return route.rai;
      }
    }

    // 5. No match found
    throw new errors.RequestError(
      `No RAI found for the request URL: ${path} with method: ${method}`,
      {
        code: "RAI_NOT_FOUND",
        route: path,
        method,
        availableRoutes: methodRoutes.map((r) => r.path),
      }
    );
  }

  /**
   * Clear the runtime cache (useful for testing or after route updates)
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; methods: string[] } {
    return {
      size: this.cache.size,
      methods: Array.from(this.routesByMethod.keys()),
    };
  }
}

export default RaiMatcher;
