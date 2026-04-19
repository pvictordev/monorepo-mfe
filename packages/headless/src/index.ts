import type { Permission, PermissionAnalysis, PermissionFinding, Role, RoleId, User } from "@repo/contracts";

const permissionOrder: Permission[] = [
  "read_users",
  "edit_users",
  "read_reports",
  "export_reports",
  "manage_billing",
  "view_invoices",
  "publish_content",
  "manage_roles",
];

export const permissionLabels: Record<Permission, string> = {
  read_users: "Read users",
  edit_users: "Edit users",
  read_reports: "Read reports",
  export_reports: "Export reports",
  manage_billing: "Manage billing",
  view_invoices: "View invoices",
  publish_content: "Publish content",
  manage_roles: "Manage roles",
};

export const highSensitivityPermissions = new Set<Permission>([
  "edit_users",
  "manage_billing",
  "publish_content",
  "manage_roles",
]);

export function resolvePermissions(roles: Role[]): Permission[] {
  const permissions = new Set<Permission>();

  for (const role of roles) {
    for (const permission of role.permissions) {
      permissions.add(permission);
    }
  }

  return permissionOrder.filter((permission) => permissions.has(permission));
}

export function getRolesForUser(user: User, roles: Role[]): Role[] {
  const rolesById = new Map<RoleId, Role>(roles.map((role) => [role.id, role]));

  return user.roleIds.map((roleId) => rolesById.get(roleId)).filter((role): role is Role => Boolean(role));
}

export function detectRedundantRoles(roles: Role[]): PermissionFinding[] {
  const roleIds = new Set(roles.map((role) => role.id));
  const findings: PermissionFinding[] = [];

  if (roleIds.has("admin") && roleIds.has("viewer")) {
    findings.push({
      kind: "redundant",
      severity: "warning",
      title: "Viewer is redundant with Admin",
      detail: "Admin already grants every viewer permission, so keeping both roles adds noise.",
    });
  }

  if (roleIds.has("editor") && roleIds.has("viewer")) {
    findings.push({
      kind: "redundant",
      severity: "info",
      title: "Viewer overlaps with Editor",
      detail: "Editor already includes the read permissions provided by Viewer.",
    });
  }

  return findings;
}

export function detectConflicts(roles: Role[]): PermissionFinding[] {
  const roleIds = new Set(roles.map((role) => role.id));

  if (roleIds.has("billing") && roleIds.has("editor")) {
    return [
      {
        kind: "conflict",
        severity: "warning",
        title: "Billing plus Editor needs review",
        detail: "This combines financial operations with content/user editing in one account.",
      },
    ];
  }

  return [];
}

export function detectMissingRecommended(roles: Role[], permissions: Permission[]): PermissionFinding[] {
  const roleIds = new Set(roles.map((role) => role.id));
  const permissionSet = new Set(permissions);
  const findings: PermissionFinding[] = [];

  if (roleIds.has("billing") && !permissionSet.has("read_reports")) {
    findings.push({
      kind: "missing_recommended",
      severity: "info",
      title: "Billing is missing report context",
      detail: "Billing users can manage invoices, but read_reports is recommended for invoice reconciliation.",
    });
  }

  if (roleIds.has("editor") && !permissionSet.has("publish_content")) {
    findings.push({
      kind: "missing_recommended",
      severity: "info",
      title: "Editor cannot publish",
      detail: "Editors can prepare content but require an Admin handoff for publishing.",
    });
  }

  return findings;
}

export function detectOverPrivilege(permissions: Permission[]): PermissionFinding[] {
  const highSensitivityCount = permissions.filter((permission) => highSensitivityPermissions.has(permission)).length;

  if (highSensitivityCount >= 3) {
    return [
      {
        kind: "over_privilege",
        severity: "critical",
        title: "High-sensitivity access is broad",
        detail: "This user has three or more high-sensitivity permissions. Consider splitting duties.",
      },
    ];
  }

  return [];
}

export function buildPermissionAnalysis(user: User, roles: Role[], now = new Date()): PermissionAnalysis {
  const userRoles = getRolesForUser(user, roles);
  const permissions = resolvePermissions(userRoles);
  const findings = [
    ...detectRedundantRoles(userRoles),
    ...detectConflicts(userRoles),
    ...detectMissingRecommended(userRoles, permissions),
    ...detectOverPrivilege(permissions),
  ];

  return {
    userId: user.id,
    userName: user.name,
    roles: userRoles,
    permissions,
    findings,
    updatedAt: now.toISOString(),
  };
}
