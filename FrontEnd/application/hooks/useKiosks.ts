import { useState, useEffect } from 'react';
import type { DetachedKiosk as Kiosk, DetachedFirmwareRelease as FirmwareRelease } from './_detachedTypes';

export function useKiosks() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [firmware, setFirmware] = useState<FirmwareRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setKiosks([]);
    setFirmware([]);
    setError(null);
    setLoading(false);
  }, []);

  return { kiosks, firmware, loading, error };
}
