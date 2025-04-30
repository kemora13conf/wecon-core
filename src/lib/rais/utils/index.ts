import Route from "../../../core/Route";
import Routes from "../../../core/Routes";
import { InvalidRouteError } from "../../../errors";
import { IRAI } from "../types";

function extractRoutesAndroles(
  routes: Routes[] | Route[],
  prefix: string = "",
  depth = 0
) {
  const rais: IRAI[] = [];
  const roles = new Set<string>();

  for (let i = 0; i < routes.length; i++) {
    if (routes[i] instanceof Routes) {
      const route = routes[i] as Routes;
      const newPrefix = (prefix + route.prefix) as string;
      const { routes: nestedRoutes, roles: nestedroles } =
        extractRoutesAndroles(route.routes as Routes[], newPrefix, depth + 1);
      rais.push(...nestedRoutes);
      nestedroles.forEach((p) => roles.add(p));
    } else if (routes[i] instanceof Route) {
      const route = routes[i] as Route;
      if (!route.roles?.length) {
        throw new InvalidRouteError(`
INVALID roles FIELD:
    METHOD : ${prefix + route.method}
    PATH : ${route.path}
    NAME : ${route.name}
    DESCRIPTION : ${route.description}
    RESOURCE : ${route.rai}
        `);
      }

      const rai: IRAI = {
        _id: route.rai,
        method: route.method,
        path: prefix + route.path,
        name: route.name,
        description: route.description,
        rai: route.rai,
        roles: route.roles,
        children: [],
        isStopped: false,
      };

      rais.push(rai);

      route.roles.forEach((role) => roles.add(role));
    }
  }
  return { routes: rais, roles: Array.from(roles) };
}

export { extractRoutesAndroles };
