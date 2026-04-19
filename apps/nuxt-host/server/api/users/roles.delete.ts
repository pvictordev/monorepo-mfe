import { RoleAssignmentRequestSchema } from "@repo/contracts";
import { removeRole } from "../../utils/permission-store";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const request = RoleAssignmentRequestSchema.parse({
    userId: query.userId,
    roleId: query.roleId,
  });

  return removeRole(request);
});
