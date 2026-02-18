import type { ISettingsRepository } from '../../domain/contracts/ISettingsRepository';
import type { PlatformSettings } from '../../domain/entities/Settings';
import { httpClient } from '../http/client';
import type { ApiSettingsDTO } from '../dto/backend';

export class ApiSettingsRepository implements ISettingsRepository {
  private baseUrl = 'api/settings/';

  private mapToEntity(data: ApiSettingsDTO): PlatformSettings {
    return {
      name: data.name ?? '',
      owner: data.owner ?? undefined,
      gstin: data.gstin ?? undefined,
      pan: data.pan ?? undefined,
      address: data.address ?? undefined,
      email: data.email ?? undefined,
      mobile: data.mobile ?? undefined,
      legal_name: data.legal_name ?? undefined,
      logo: data.logo ?? undefined,
    };
  }

  private toUpdatePayload(settings: Partial<PlatformSettings>): Record<string, unknown> {
    return {
      name: settings.name,
      owner: settings.owner,
      gstin: settings.gstin,
      pan: settings.pan,
      address: settings.address,
      email: settings.email,
      mobile: settings.mobile,
      legal_name: settings.legal_name,
      logo: settings.logo,
    };
  }

  async getSettings(): Promise<PlatformSettings> {
    const data = await httpClient.get<ApiSettingsDTO>(this.baseUrl);
    return this.mapToEntity(data);
  }

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const payload = this.toUpdatePayload(settings);
    const data = await httpClient.put<ApiSettingsDTO>(this.baseUrl, payload);
    return this.mapToEntity(data);
  }
}
