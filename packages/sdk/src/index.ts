import {
  EffectivePermissionsResponseSchema,
  RolesResponseSchema,
  UsersResponseSchema,
  WorkspaceStateResponseSchema,
  type EffectivePermissionsResponse,
  type RoleAssignmentRequest,
  type RolesResponse,
  type UsersResponse,
  type WorkspaceStateResponse,
} from "@repo/contracts";

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type Parser<Output> = {
  parse: (value: unknown) => Output;
};

export type PermissionApiClientOptions = {
  baseUrl?: string;
  fetcher?: FetchLike;
};

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${normalizedBase}${path}`;
}

async function readJson(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

function encodeAssignmentQuery(request: RoleAssignmentRequest): string {
  const params = new URLSearchParams({
    userId: request.userId,
    roleId: request.roleId,
  });

  return params.toString();
}

export function createPermissionApiClient(options: PermissionApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "/api";
  const fetcher = options.fetcher ?? fetch;

  async function getParsed<Output>(
    path: string,
    schema: Parser<Output>,
    init?: RequestInit,
  ): Promise<Output> {
    const response = await fetcher(joinUrl(baseUrl, path), init);
    const json = await readJson(response);

    return schema.parse(json);
  }

  return {
    getState(): Promise<WorkspaceStateResponse> {
      return getParsed("/state", WorkspaceStateResponseSchema);
    },
    getUsers(): Promise<UsersResponse> {
      return getParsed("/users", UsersResponseSchema);
    },
    getRoles(): Promise<RolesResponse> {
      return getParsed("/roles", RolesResponseSchema);
    },
    getEffectivePermissions(userId: string): Promise<EffectivePermissionsResponse> {
      return getParsed(`/users/${encodeURIComponent(userId)}/permissions`, EffectivePermissionsResponseSchema);
    },
    assignRole(request: RoleAssignmentRequest): Promise<EffectivePermissionsResponse> {
      return getParsed("/users/roles", EffectivePermissionsResponseSchema, {
        body: JSON.stringify(request),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
    },
    removeRole(request: RoleAssignmentRequest): Promise<EffectivePermissionsResponse> {
      return getParsed(`/users/roles?${encodeAssignmentQuery(request)}`, EffectivePermissionsResponseSchema, {
        method: "DELETE",
      });
    },
  };
}
