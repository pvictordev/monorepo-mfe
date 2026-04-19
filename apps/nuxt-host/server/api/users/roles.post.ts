import { RoleAssignmentRequestSchema } from "@repo/contracts";
import { assignRole } from "../../utils/permission-store";

export default defineEventHandler(async (event) => {
  const body = await readBody<unknown>(event);
  const request = RoleAssignmentRequestSchema.parse(body);

  return assignRole(request);
});
