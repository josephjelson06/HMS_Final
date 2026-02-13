import { useState, useEffect } from 'react';
import type { Kiosk, FirmwareRelease } from '../../domain/entities/Kiosk';
import { repositories } from '../../infrastructure/config/container';

export function useKiosks() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [firmware, setFirmware] = useState<FirmwareRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([
      repositories.kiosks.getAll(),
      repositories.kiosks.getFirmwareReleases(),
    ])
      .then(([k, f]) => { setKiosks(k); setFirmware(f); })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { kiosks, firmware, loading, error };
}
