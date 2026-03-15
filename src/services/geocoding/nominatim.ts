/**
 * Nominatim 反向地理编码服务
 *
 * 使用 OpenStreetMap 的 Nominatim API 将经纬度坐标转换为地理位置信息
 * API 文档: https://nominatim.org/release-docs/latest/api/Reverse/
 */

import type { GeocodingResult } from '@/types/entities';

/** Nominatim API 响应接口 */
interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    state_district?: string;
    city_district?: string;
    country?: string;
    country_code?: string;
    [key: string]: string | undefined;
  };
  display_name: string;
  error?: string;
}
/** 国家代码到大洲的映射表 */
const COUNTRY_TO_CONTINENT: Record<string, string> = {
  cn: 'Asia', jp: 'Asia', kr: 'Asia', in: 'Asia', th: 'Asia',
  vn: 'Asia', id: 'Asia', my: 'Asia', sg: 'Asia', ph: 'Asia',
  kh: 'Asia', la: 'Asia', mm: 'Asia', bn: 'Asia', tl: 'Asia',
  mn: 'Asia', kz: 'Asia', uz: 'Asia', tm: 'Asia', kg: 'Asia',
  tj: 'Asia', af: 'Asia', pk: 'Asia', bd: 'Asia', lk: 'Asia',
  np: 'Asia', bt: 'Asia', mv: 'Asia', ir: 'Asia', iq: 'Asia',
  sy: 'Asia', jo: 'Asia', lb: 'Asia', il: 'Asia', ps: 'Asia',
  sa: 'Asia', ye: 'Asia', om: 'Asia', ae: 'Asia', qa: 'Asia',
  bh: 'Asia', kw: 'Asia', tr: 'Asia', am: 'Asia', az: 'Asia',
  ge: 'Asia', cy: 'Asia',
  gb: 'Europe', fr: 'Europe', de: 'Europe', it: 'Europe', es: 'Europe',
  pt: 'Europe', nl: 'Europe', be: 'Europe', lu: 'Europe', ch: 'Europe',
  at: 'Europe', pl: 'Europe', cz: 'Europe', sk: 'Europe', hu: 'Europe',
  ro: 'Europe', bg: 'Europe', gr: 'Europe', se: 'Europe', no: 'Europe',
  dk: 'Europe', fi: 'Europe', is: 'Europe', ie: 'Europe', ua: 'Europe',
  by: 'Europe', ru: 'Europe', ee: 'Europe', lv: 'Europe', lt: 'Europe',
  md: 'Europe', rs: 'Europe', hr: 'Europe', si: 'Europe', ba: 'Europe',
  mk: 'Europe', al: 'Europe', me: 'Europe', xk: 'Europe',
  us: 'North America', ca: 'North America', mx: 'North America',
  gt: 'North America', bz: 'North America', sv: 'North America',
  hn: 'North America', ni: 'North America', cr: 'North America',
  pa: 'North America', cu: 'North America', jm: 'North America',
  ht: 'North America', do: 'North America', bs: 'North America',
  tt: 'North America', bb: 'North America', gd: 'North America',
  lc: 'North America', vc: 'North America', ag: 'North America',
  dm: 'North America', kn: 'North America',
  br: 'South America', ar: 'South America', cl: 'South America',
  co: 'South America', pe: 'South America', ve: 'South America',
  ec: 'South America', bo: 'South America', py: 'South America',
  uy: 'South America', gy: 'South America', sr: 'South America',
  gf: 'South America',
  eg: 'Africa', za: 'Africa', ng: 'Africa', ke: 'Africa', et: 'Africa',
  tz: 'Africa', ug: 'Africa', dz: 'Africa', ma: 'Africa', tn: 'Africa',
  ly: 'Africa', sd: 'Africa', ss: 'Africa', so: 'Africa', dj: 'Africa',
  er: 'Africa', gh: 'Africa', ci: 'Africa', cm: 'Africa', ne: 'Africa',
  bf: 'Africa', ml: 'Africa', sn: 'Africa', gn: 'Africa', sl: 'Africa',
  lr: 'Africa', tg: 'Africa', bj: 'Africa', mw: 'Africa', zm: 'Africa',
  zw: 'Africa', mz: 'Africa', bw: 'Africa', na: 'Africa', ls: 'Africa',
  sz: 'Africa', mg: 'Africa', mu: 'Africa', sc: 'Africa', km: 'Africa',
  ao: 'Africa', cd: 'Africa', cg: 'Africa', ga: 'Africa', gq: 'Africa',
  cf: 'Africa', td: 'Africa', rw: 'Africa', bi: 'Africa',
  au: 'Oceania', nz: 'Oceania', pg: 'Oceania', fj: 'Oceania',
  sb: 'Oceania', vu: 'Oceania', nc: 'Oceania', pf: 'Oceania',
  ws: 'Oceania', ki: 'Oceania', to: 'Oceania', fm: 'Oceania',
  mh: 'Oceania', pw: 'Oceania', nr: 'Oceania', tv: 'Oceania',
  aq: 'Antarctica',
};

export const getContinent = (countryCode: string): string => {
  return COUNTRY_TO_CONTINENT[countryCode.toLowerCase()] || 'Unknown';
};
/**
 * 反向地理编码：将经纬度坐标转换为地理位置信息
 *
 * @param latitude - 纬度
 * @param longitude - 经度
 * @param mapZoom - 地图缩放级别，zoom<=5 显示省/州，zoom>=6 显示城市
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  mapZoom?: number
): Promise<GeocodingResult> => {
  if (latitude < -90 || latitude > 90) {
    throw new Error('纬度必须在 -90 到 90 之间');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('经度必须在 -180 到 180 之间');
  }

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('accept-language', 'zh-CN,en');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'JourneyHub/1.0 (https://github.com/AeroSm1th/JourneyHub)',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`Nominatim API 请求失败: ${response.status} ${response.statusText}`);
    }
    const data: NominatimResponse = await response.json();
    if (data.error) {
      throw new Error(`Nominatim API 错误: ${data.error}`);
    }
    const address = data.address;
    if (!address) {
      throw new Error('无法获取地址信息');
    }

    const zoom = mapZoom ?? 10;
    const { state, state_district, city, county, town, village, municipality } = address;
    console.log('[Nominatim] address:', JSON.stringify(address));

    let cityName: string;
    if (zoom <= 5) {
      // 省/州级视图：中国显示省，国外显示 state
      cityName = state || address.country || '未知城市';
    } else {
      // 城市级视图（zoom >= 6）
      if (address.country_code === 'cn') {
        // 中国：优先用以"市"结尾的 city，其次 state_district
        cityName =
          (city && /市$/.test(city) ? city : undefined) ||
          (state_district && /市$/.test(state_district) ? state_district : undefined) ||
          city || town || village || county || state || '未知城市';
      } else {
        cityName = city || town || village || municipality || county || state || '未知城市';
      }
    }
    console.log('[Nominatim] zoom:', zoom, '| cityName:', cityName);

    const countryName = address.country || '未知国家';
    const continent = getContinent(address.country_code || '');
    return { cityName, countryName, continent, latitude, longitude };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('反向地理编码请求超时，请检查网络连接');
      }
      throw error;
    }
    throw new Error('反向地理编码失败，请稍后重试');
  }
};