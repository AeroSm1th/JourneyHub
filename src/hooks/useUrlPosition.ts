import { useMemo } from 'react';

/**
 * 从 URL 查询参数中读取位置（lat/lng）。
 *
 * 约定：支持 `?lat=..&lng=..`（或 `?latitude=..&longitude=..`）。
 * 读取失败时返回 [null, null]。
 */
export function useUrlPosition(): [number | null, number | null] {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    const latRaw = params.get('lat') ?? params.get('latitude');
    const lngRaw = params.get('lng') ?? params.get('longitude');

    const lat = latRaw === null ? null : Number(latRaw);
    const lng = lngRaw === null ? null : Number(lngRaw);

    if (lat === null || lng === null) return [null, null];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [null, null];

    return [lat, lng];
  }, []);
}

