import type { IUserRepository } from "../../domain/contracts/IUserRepository";
import type { User, Role } from "../../domain/entities/User";
import { httpClient } from "../http/client";
import type { ApiPermissionDTO, ApiRoleDTO, ApiUserDTO } from "../dto/backend";
import {
  deleteCacheKey,
  getCached,
  globalKey,
  setCached,
  setCachedIfChanged,
} from "../storage/idbClient";

const ROLE_STORE = "roles";
const PERMISSION_STORE = "permissions";
const USER_STORE = "users";
const USER_LIST_KEY = globalKey("users");

export class ApiUserRepository implements IUserRepository {
  private baseUrl = "api/platform/users/";
  private roleUrl = "api/platform/roles/";

  private mapUser = (data: ApiUserDTO): User => ({
    id: String(data.id),
    readableId: data.readable_id ?? undefined,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? data.mobile ?? undefined,
    mobile: data.mobile ?? data.phone ?? undefined,
    status: data.status ?? undefined,
    lastLogin: data.last_login ?? undefined,
    avatar: data.avatar ?? undefined,
    dateAdded: data.date_added ?? undefined,
    tenantId: data.tenant_id ? String(data.tenant_id) : undefined,
    // employeeId not in DTO
    isAdmin: data.is_admin,
    role: data.role ? this.mapRole(data.role) : undefined,
  });

  private mapRole = (data: ApiRoleDTO): Role => ({
    id: String(data.id),
    name: data.name,
    description: data.description ?? "",
    status: data.status === false ? "Inactive" : "Active",
    color: data.color ?? "blue",
    permissions: data.permissions ?? [],
    userCount: undefined, // Backend doesn't return count on generic DTO usually
  });

  async getAll(): Promise<User[]> {
    const cached = await getCached<User[]>(USER_STORE, USER_LIST_KEY);
    if (cached) return cached;

    const data = await httpClient.get<ApiUserDTO[]>(this.baseUrl);
    const mapped = data.map(this.mapUser);
    await setCached(USER_STORE, USER_LIST_KEY, mapped);
    return mapped;
  }

  async getById(id: string): Promise<User | null> {
    try {
      const result = await httpClient.get<ApiUserDTO>(`${this.baseUrl}${id}`);
      return this.mapUser(result);
    } catch (_error) {
      return null;
    }
  }

  async create(data: Omit<User, "id">): Promise<User> {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone ?? data.mobile,
      role_id: data.role?.id,
      tenant_id: data.tenantId, // Added tenant_id
      password: "password123",
    };
    const result = await httpClient.post<ApiUserDTO>(this.baseUrl, payload);
    const mapped = this.mapUser(result);
    const list = await getCached<User[]>(USER_STORE, USER_LIST_KEY);
    if (list) await setCached(USER_STORE, USER_LIST_KEY, [...list, mapped]);
    return mapped;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.status !== undefined) payload.status = data.status;
    if (data.role?.id !== undefined) payload.role_id = data.role.id;
    if (data.tenantId !== undefined) payload.tenant_id = data.tenantId; // Added tenant_id
    if (data.phone !== undefined || data.mobile !== undefined) {
      payload.phone = data.phone ?? data.mobile;
    }

    const result = await httpClient.patch<ApiUserDTO>(
      `${this.baseUrl}${id}`,
      payload,
    );
    const mapped = this.mapUser(result);
    const list = await getCached<User[]>(USER_STORE, USER_LIST_KEY);
    if (list) {
      await setCached(
        USER_STORE,
        USER_LIST_KEY,
        list.map((item) => (item.id === id ? mapped : item)),
      );
    }
    return mapped;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}${id}`);
    const list = await getCached<User[]>(USER_STORE, USER_LIST_KEY);
    if (list) {
      await setCached(
        USER_STORE,
        USER_LIST_KEY,
        list.filter((item) => item.id !== id),
      );
    }
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    const key = globalKey("roles");
    const cached = await getCached<Role[]>(ROLE_STORE, key);
    if (cached) {
      void this.revalidateRoles(key);
      return cached;
    }

    const data = await httpClient.get<ApiRoleDTO[]>(this.roleUrl);
    const mapped = data.map(this.mapRole);
    await setCached(ROLE_STORE, key, mapped);
    return mapped;
  }

  async createRole(data: Role): Promise<Role> {
    const payload = {
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status === "Active",
    };
    const result = await httpClient.post<ApiRoleDTO>(this.roleUrl, payload);
    const mapped = this.mapRole(result);
    await this.updateCachedRoles((items) => [...items, mapped]);
    return mapped;
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.color !== undefined) payload.color = data.color;
    if (data.status !== undefined) payload.status = data.status === "Active";

    const result = await httpClient.patch<ApiRoleDTO>(
      `${this.roleUrl}${id}`,
      payload,
    );
    const mapped = this.mapRole(result);
    await this.updateCachedRoles((items) =>
      items.map((item) => (item.id === id ? mapped : item)),
    );
    return mapped;
  }

  async deleteRole(id: string): Promise<void> {
    await httpClient.delete(`${this.roleUrl}${id}`);
    await this.updateCachedRoles((items) => items.filter((item) => item.id !== id));
  }

  // Permissions
  async getAvailablePermissions(): Promise<
    { id: string; key: string; description: string }[]
  > {
    const key = globalKey("permissions");
    const cached = await getCached<
      { id: string; key: string; description: string }[]
    >(PERMISSION_STORE, key);
    if (cached) {
      void this.revalidatePermissions(key);
      return cached;
    }

    const data = await httpClient.get<ApiPermissionDTO[]>("api/permissions/");
    const mapped = data.map((item) => ({
      id: item.id,
      key: item.key,
      description: item.description ?? "",
    }));
    await setCached(PERMISSION_STORE, key, mapped);
    return mapped;
  }

  async getRolePermissions(
    roleId: string,
  ): Promise<{ role_id: string; role_name: string; permissions: string[] }> {
    const key = globalKey("roles", `permissions:${roleId}`);
    const cached = await getCached<
      { role_id: string; role_name: string; permissions: string[] }
    >(ROLE_STORE, key);
    if (cached) {
      void this.revalidateRolePermissions(roleId, key);
      return cached;
    }

    const data = await httpClient.get<any>(
      `${this.roleUrl}${roleId}/permissions`,
    );
    const mapped = Array.isArray(data)
      ? { role_id: roleId, role_name: "", permissions: data }
      : data;
    await setCached(ROLE_STORE, key, mapped);
    return mapped;
  }

  async setRolePermissions(
    roleId: string,
    permissions: string[],
  ): Promise<void> {
    await httpClient.put(`${this.roleUrl}${roleId}/permissions`, {
      permissions,
    });
    await this.invalidateRolesCache(roleId);
  }

  private async revalidateRoles(key: string) {
    try {
      const data = await httpClient.get<ApiRoleDTO[]>(this.roleUrl);
      const mapped = data.map(this.mapRole);
      await setCachedIfChanged(ROLE_STORE, key, mapped);
    } catch {
      // Ignore background refresh failures
    }
  }

  private async revalidatePermissions(key: string) {
    try {
      const data = await httpClient.get<ApiPermissionDTO[]>("api/permissions/");
      const mapped = data.map((item) => ({
        id: item.id,
        key: item.key,
        description: item.description ?? "",
      }));
      await setCachedIfChanged(PERMISSION_STORE, key, mapped);
    } catch {
      // Ignore background refresh failures
    }
  }

  private async revalidateRolePermissions(roleId: string, key: string) {
    try {
      const data = await httpClient.get<any>(
        `${this.roleUrl}${roleId}/permissions`,
      );
      const mapped = Array.isArray(data)
        ? { role_id: roleId, role_name: "", permissions: data }
        : data;
      await setCachedIfChanged(ROLE_STORE, key, mapped);
    } catch {
      // Ignore background refresh failures
    }
  }

  private async invalidateRolesCache(roleId?: string) {
    await deleteCacheKey(ROLE_STORE, globalKey("roles"));
    if (roleId) {
      await deleteCacheKey(ROLE_STORE, globalKey("roles", roleId));
      await deleteCacheKey(
        ROLE_STORE,
        globalKey("roles", `permissions:${roleId}`),
      );
    }
  }

  private async updateCachedRoles(
    updater: (items: Role[]) => Role[],
  ) {
    const key = globalKey("roles");
    const cached = await getCached<Role[]>(ROLE_STORE, key);
    if (!cached) return;
    await setCached(ROLE_STORE, key, updater(cached));
  }
}
