import {
  EffectivePermissionsResponseSchema,
  RoleAssignmentRequestSchema,
  RolesResponseSchema,
  UsersResponseSchema,
  WorkspaceStateResponseSchema,
  type Role,
  type RoleAssignmentRequest,
  type RoleId,
  type User,
} from "@repo/contracts";
import { buildPermissionAnalysis } from "@repo/headless";

const roles: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full operational access for user, billing, reporting, and role management.",
    permissions: [
      "read_users",
      "edit_users",
      "read_reports",
      "export_reports",
      "manage_billing",
      "view_invoices",
      "publish_content",
      "manage_roles",
    ],
  },
  {
    id: "editor",
    name: "Editor",
    description: "Can review users and reports while preparing operational content.",
    permissions: ["read_users", "edit_users", "read_reports"],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only operational visibility.",
    permissions: ["read_users", "read_reports"],
  },
  {
    id: "billing",
    name: "Billing",
    description: "Invoice and billing operations without broad report access.",
    permissions: ["manage_billing", "view_invoices", "export_reports"],
  },
];

let users: User[] = [
  {
    id: "usr_ada",
    name: "Ada Lovelace",
    email: "ada@example.com",
    roleIds: ["admin", "viewer"],
  },
  {
    id: "usr_grace",
    name: "Grace Hopper",
    email: "grace@example.com",
    roleIds: ["editor"],
  },
  {
    id: "usr_katherine",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    roleIds: ["billing"],
  },
];

function cloneUsers(): User[] {
  return users.map((user) => ({ ...user, roleIds: [...user.roleIds] }));
}

function cloneRoles(): Role[] {
  return roles.map((role) => ({ ...role, permissions: [...role.permissions] }));
}

function findUser(userId: string): User {
  const user = users.find((candidate) => candidate.id === userId);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: `User ${userId} was not found.`,
    });
  }

  return user;
}

function assertRole(roleId: RoleId): void {
  if (!roles.some((role) => role.id === roleId)) {
    throw createError({
      statusCode: 404,
      statusMessage: `Role ${roleId} was not found.`,
    });
  }
}

export function getUsersResponse() {
  return UsersResponseSchema.parse({ users: cloneUsers() });
}

export function getRolesResponse() {
  return RolesResponseSchema.parse({ roles: cloneRoles() });
}

export function getWorkspaceStateResponse() {
  return WorkspaceStateResponseSchema.parse({
    users: cloneUsers(),
    roles: cloneRoles(),
  });
}

export function getEffectivePermissionsResponse(userId: string) {
  const user = findUser(userId);

  return EffectivePermissionsResponseSchema.parse({
    analysis: buildPermissionAnalysis(user, roles),
  });
}

export function assignRole(request: RoleAssignmentRequest) {
  const parsedRequest = RoleAssignmentRequestSchema.parse(request);
  const user = findUser(parsedRequest.userId);

  assertRole(parsedRequest.roleId);

  if (!user.roleIds.includes(parsedRequest.roleId)) {
    users = users.map((candidate) =>
      candidate.id === user.id ? { ...candidate, roleIds: [...candidate.roleIds, parsedRequest.roleId] } : candidate,
    );
  }

  return getEffectivePermissionsResponse(parsedRequest.userId);
}

export function removeRole(request: RoleAssignmentRequest) {
  const parsedRequest = RoleAssignmentRequestSchema.parse(request);
  const user = findUser(parsedRequest.userId);

  assertRole(parsedRequest.roleId);

  users = users.map((candidate) =>
    candidate.id === user.id
      ? { ...candidate, roleIds: candidate.roleIds.filter((roleId) => roleId !== parsedRequest.roleId) }
      : candidate,
  );

  return getEffectivePermissionsResponse(parsedRequest.userId);
}
