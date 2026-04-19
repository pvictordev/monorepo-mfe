import { getEffectivePermissionsResponse } from "../../../utils/permission-store";

export default defineEventHandler((event) => {
  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "A user id is required.",
    });
  }

  return getEffectivePermissionsResponse(userId);
});
