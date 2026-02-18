import { useState, useEffect, useCallback } from 'react';
import type { PlatformSettings } from '@/domain/entities/Settings';
import { repositories } from '@/infrastructure/config/container';

export function useSettings() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await repositories.settings.getSettings();
            setSettings(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load settings'));
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = async (data: Partial<PlatformSettings>) => {
        try {
            const updated = await repositories.settings.updateSettings(data);
            setSettings(updated);
            return updated;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Failed to update settings');
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return { settings, loading, error, updateSettings, refetch: fetchSettings };
}
