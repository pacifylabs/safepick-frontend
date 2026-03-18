import { authHandlers } from "./auth.handlers";
import { childrenHandlers } from "./children.handlers";
import { schoolsHandlers } from "./schools.handlers";
import { delegatesHandlers } from "./delegates.handlers";
import { authorizationsHandlers } from "./authorizations.handlers";
import { verificationHandlers } from "./verification.handlers";
import { delegateAuthHandlers } from "./delegate-auth.handlers";
import { auditHandlers } from "./audit.handlers";
import { pickupHandlers } from "./pickup.handlers";
import { secondaryGuardianHandlers } from "./secondary-guardian.handlers";

export const handlers = [
  ...authHandlers,
  ...childrenHandlers,
  ...schoolsHandlers,
  ...delegatesHandlers,
  ...authorizationsHandlers,
  ...verificationHandlers,
  ...pickupHandlers,
  ...secondaryGuardianHandlers,
  ...delegateAuthHandlers,
  ...auditHandlers,
];
