import type { ISettingsRepository } from '../../domain/contracts/ISettingsRepository';
import type { PlatformSettings } from '../../domain/entities/Settings';
import { httpClient } from '../http/client';

export class ApiSettingsRepository implements ISettingsRepository {
  async getSettings(): Promise<PlatformSettings> {
    return httpClient.get<PlatformSettings>('/api/settings/');
  }

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    return httpClient.put<PlatformSettings>('/api/settings/', settings);
  }
}
