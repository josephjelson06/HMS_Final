import { httpClient } from '../http/client';

export interface PlatformSettings {
    name: string;
    gstin?: string;
    pan?: string;
    address?: string;
    email?: string;
    mobile?: string;
    legal_name?: string;
    logo?: string;
}

export const ApiSettingsRepository = {
    getSettings: async (): Promise<PlatformSettings> => {
        const response = await httpClient.get<PlatformSettings>('/api/settings/');
        return response;
    },

    updateSettings: async (settings: Partial<PlatformSettings>): Promise<PlatformSettings> => {
        const response = await httpClient.put<PlatformSettings>('/api/settings/', settings);
        return response;
    }
};
