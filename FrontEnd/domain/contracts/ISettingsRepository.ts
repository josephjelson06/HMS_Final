import type { PlatformSettings } from '../entities/Settings';

export interface ISettingsRepository {
  getSettings(): Promise<PlatformSettings>;
  updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings>;
}
