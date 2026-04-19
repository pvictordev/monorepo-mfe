import { z } from "zod";

export const PermissionSchema = z.enum([
  "read_users",
  "edit_users",
  "read_reports",
  "export_reports",
  "manage_billing",
  "view_invoices",
  "publish_content",
  "manage_roles",
]);

export const RoleIdSchema = z.enum(["admin", "editor", "viewer", "billing"]);

export const PermissionSensitivitySchema = z.enum(["low", "medium", "high"]);

export const RoleSchema = z.object({
  id: RoleIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  permissions: z.array(PermissionSchema),
});

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  roleIds: z.array(RoleIdSchema),
});

export const PermissionFindingSchema = z.object({
  kind: z.enum(["conflict", "redundant", "over_privilege", "missing_recommended", "info"]),
  severity: z.enum(["info", "warning", "critical"]),
  title: z.string().min(1),
  detail: z.string().min(1),
});

export const PermissionAnalysisSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  roles: z.array(RoleSchema),
  permissions: z.array(PermissionSchema),
  findings: z.array(PermissionFindingSchema),
  updatedAt: z.string().datetime(),
});

export const UsersResponseSchema = z.object({
  users: z.array(UserSchema),
});

export const RolesResponseSchema = z.object({
  roles: z.array(RoleSchema),
});

export const RoleAssignmentRequestSchema = z.object({
  userId: z.string().min(1),
  roleId: RoleIdSchema,
});

export const EffectivePermissionsResponseSchema = z.object({
  analysis: PermissionAnalysisSchema,
});

export const WorkspaceStateResponseSchema = z.object({
  users: z.array(UserSchema),
  roles: z.array(RoleSchema),
});

const UserSelectedEventSchema = z.object({
  type: z.literal("USER_SELECTED"),
  payload: z.object({
    userId: z.string().min(1),
  }),
});

const UserRolesUpdatedEventSchema = z.object({
  type: z.literal("USER_ROLES_UPDATED"),
  payload: z.object({
    user: UserSchema,
    roles: z.array(RoleSchema),
    analysis: PermissionAnalysisSchema,
  }),
});

const BusStatusChangedEventSchema = z.object({
  type: z.literal("BUS_STATUS_CHANGED"),
  payload: z.object({
    enabled: z.boolean(),
    reason: z.string().optional(),
  }),
});

const VisualizerDisconnectedEventSchema = z.object({
  type: z.literal("VISUALIZER_DISCONNECTED"),
  payload: z.object({
    reason: z.string().min(1),
  }),
});

const VisualizerRehydratedEventSchema = z.object({
  type: z.literal("VISUALIZER_REHYDRATED"),
  payload: z.object({
    userId: z.string().min(1),
    source: z.literal("api"),
  }),
});

export const DomainEventSchema = z.discriminatedUnion("type", [
  UserSelectedEventSchema,
  UserRolesUpdatedEventSchema,
  BusStatusChangedEventSchema,
  VisualizerDisconnectedEventSchema,
  VisualizerRehydratedEventSchema,
]);

export type Permission = z.infer<typeof PermissionSchema>;
export type RoleId = z.infer<typeof RoleIdSchema>;
export type PermissionSensitivity = z.infer<typeof PermissionSensitivitySchema>;
export type Role = z.infer<typeof RoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type PermissionFinding = z.infer<typeof PermissionFindingSchema>;
export type PermissionAnalysis = z.infer<typeof PermissionAnalysisSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
export type RolesResponse = z.infer<typeof RolesResponseSchema>;
export type RoleAssignmentRequest = z.infer<typeof RoleAssignmentRequestSchema>;
export type EffectivePermissionsResponse = z.infer<typeof EffectivePermissionsResponseSchema>;
export type WorkspaceStateResponse = z.infer<typeof WorkspaceStateResponseSchema>;
export type DomainEvent = z.infer<typeof DomainEventSchema>;
export type DomainEventType = DomainEvent["type"];
