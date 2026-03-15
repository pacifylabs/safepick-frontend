import { authHandlers } from "./auth.handlers";
import { childrenHandlers } from "./children.handlers";
import { schoolsHandlers } from "./schools.handlers";
import { delegatesHandlers } from "./delegates.handlers";
import { authorizationsHandlers } from "./authorizations.handlers";

export const handlers = [
  ...authHandlers,
  ...childrenHandlers,
  ...schoolsHandlers,
  ...delegatesHandlers,
  ...authorizationsHandlers,
];
