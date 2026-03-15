/**
 * Nominatim 反向地理编码服务
 *
 * 使用 OpenStreetMap 的 Nominatim API 将经纬度坐标转换为地理位置信息
 * API 文档: https://nominatim.org/release-docs/latest/api/Reverse/
 */

import type { GeocodingResult } from '@/types/entities';

/**
 * Nominatim API 响应接口
 */
interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  display_name: string;
  error?: string;
}

/**
 * 国家代码到大洲的映射表
 * 基于 ISO 3166-1 alpha-2 国家代码
 */
const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // 亚洲
  cn: 'Asia',
  jp: 'Asia',
  kr: 'Asia',
  in: 'Asia',
  th: 'Asia',
  vn: 'Asia',
  id: 'Asia',
  my: 'Asia',
  sg: 'Asia',
  ph: 'Asia',
  kh: 'Asia',
  la: 'Asia',
  mm: 'Asia',
  bn: 'Asia',
  tl: 'Asia',
  mn: 'Asia',
  kz: 'Asia',
  uz: 'Asia',
  tm: 'Asia',
  kg: 'Asia',
  tj: 'Asia',
  af: 'Asia',
  pk: 'Asia',
  bd: 'Asia',
  lk: 'Asia',
  np: 'Asia',
  bt: 'Asia',
  mv: 'Asia',
  ir: 'Asia',
  iq: 'Asia',
  sy: 'Asia',
  jo: 'Asia',
  lb: 'Asia',
  il: 'Asia',
  ps: 'Asia',
  sa: 'Asia',
  ye: 'Asia',
  om: 'Asia',
  ae: 'Asia',
  qa: 'Asia',
  bh: 'Asia',
  kw: 'Asia',
  tr: 'Asia',
  am: 'Asia',
  az: 'Asia',
  ge: 'Asia',
  cy: 'Asia',

  // 欧洲
  gb: 'Europe',
  fr: 'Europe',
  de: 'Europe',
  it: 'Europe',
  es: 'Europe',
  pt: 'Europe',
  nl: 'Europe',
  be: 'Europe',
  lu: 'Europe',
  ch: 'Europe',
  at: 'Europe',
  pl: 'Europe',
  cz: 'Europe',
  sk: 'Europe',
  hu: 'Europe',
  ro: 'Europe',
  bg: 'Europe',
  gr: 'Europe',
  se: 'Europe',
  no: 'Europe',
  dk: 'Europe',
  fi: 'Europe',
  is: 'Europe',
  ie: 'Europe',
  ua: 'Europe',
  by: 'Europe',
  ru: 'Europe',
  ee: 'Europe',
  lv: 'Europe',
  lt: 'Europe',
  md: 'Europe',
  rs: 'Europe',
  hr: 'Europe',
  si: 'Europe',
  ba: 'Europe',
  mk: 'Europe',
  al: 'Europe',
  me: 'Europe',
  xk: 'Europe',

  // 北美洲
  us: 'North America',
  ca: 'North America',
  mx: 'North America',
  gt: 'North America',
  bz: 'North America',
  sv: 'North America',
  hn: 'North America',
  ni: 'North America',
  cr: 'North America',
  pa: 'North America',
  cu: 'North America',
  jm: 'North America',
  ht: 'North America',
  do: 'North America',
  bs: 'North America',
  tt: 'North America',
  bb: 'North America',
  gd: 'North America',
  lc: 'North America',
  vc: 'North America',
  ag: 'North America',
  dm: 'North America',
  kn: 'North America',

  // 南美洲
  br: 'South America',
  ar: 'South America',
  cl: 'South America',
  co: 'South America',
  pe: 'South America',
  ve: 'South America',
  ec: 'South America',
  bo: 'South America',
  py: 'South America',
  uy: 'South America',
  gy: 'South America',
  sr: 'South America',
  gf: 'South America',

  // 非洲
  eg: 'Africa',
  za: 'Africa',
  ng: 'Africa',
  ke: 'Africa',
  et: 'Africa',
  tz: 'Africa',
  ug: 'Africa',
  dz: 'Africa',
  ma: 'Africa',
  tn: 'Africa',
  ly: 'Africa',
  sd: 'Africa',
  ss: 'Africa',
  so: 'Africa',
  dj: 'Africa',
  er: 'Africa',
  gh: 'Africa',
  ci: 'Africa',
  cm: 'Africa',
  ne: 'Africa',
  bf: 'Africa',
  ml: 'Africa',
  sn: 'Africa',
  gn: 'Africa',
  sl: 'Africa',
  lr: 'Africa',
  tg: 'Africa',
  bj: 'Africa',
  mw: 'Africa',
  zm: 'Africa',
  zw: 'Africa',
  mz: 'Africa',
  bw: 'Africa',
  na: 'Africa',
  ls: 'Africa',
  sz: 'Africa',
  mg: 'Africa',
  mu: 'Africa',
  sc: 'Africa',
  km: 'Africa',
  ao: 'Africa',
  cd: 'Africa',
  cg: 'Africa',
  ga: 'Africa',
  gq: 'Africa',
  cf: 'Africa',
  td: 'Africa',
  rw: 'Africa',
  bi: 'Africa',

  // 大洋洲
  au: 'Oceania',
  nz: 'Oceania',
  pg: 'Oceania',
  fj: 'Oceania',
  sb: 'Oceania',
  vu: 'Oceania',
  nc: 'Oceania',
  pf: 'Oceania',
  ws: 'Oceania',
  ki: 'Oceania',
  to: 'Oceania',
  fm: 'Oceania',
  mh: 'Oceania',
  pw: 'Oceania',
  nr: 'Oceania',
  tv: 'Oceania',

  // 南极洲
  aq: 'Antarctica',
};

/**
 * 根据国家代码获取大洲名称
 *
 * @param countryCode - ISO 3166-1 alpha-2 国家代码（小写）
 * @returns 大洲名称，如果未找到则返回 'Unknown'
 */
export const getContinent = (countryCode: string): string => {
  const code = countryCode.toLowerCase();
  return COUNTRY_TO_CONTINENT[code] || 'Unknown';
};

/**
 * 反向地理编码：将经纬度坐标转换为地理位置信息
 *
 * @param latitude - 纬度（-90 到 90）
 * @param longitude - 经度（-180 到 180）
 * @returns Promise<GeocodingResult> - 包含城市名称、国家、大洲和坐标的结果
 * @throws Error - 当 API 请求失败或响应无效时抛出错误
 *
 * @example
 * ```typescript
 * const result = await reverseGeocode(39.9042, 116.4074);
 * console.log(result);
 * // {
 * //   cityName: '北京市',
 * //   countryName: '中国',
 * //   continent: 'Asia',
 * //   latitude: 39.9042,
 * //   longitude: 116.4074
 * // }
 * ```
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodingResult> => {
  // 验证输入参数
  if (latitude < -90 || latitude > 90) {
    throw new Error('纬度必须在 -90 到 90 之间');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('经度必须在 -180 到 180 之间');
  }

  // 构建 API URL
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('accept-language', 'zh-CN,en');
  url.searchParams.set('zoom', '10'); // 城市级别

  try {
    // 发送请求
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'JourneyHub/1.0 (https://github.com/AeroSm1th/JourneyHub)',
      },
      signal: AbortSignal.timeout(10000), // 10 秒超时
    });

    if (!response.ok) {
      throw new Error(`Nominatim API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data: NominatimResponse = await response.json();

    // 检查 API 错误
    if (data.error) {
      throw new Error(`Nominatim API 错误: ${data.error}`);
    }

    // 提取地址信息
    const address = data.address;
    if (!address) {
      throw new Error('无法获取地址信息');
    }

    // 提取城市名称（优先级：city > town > village > municipality > county > state）
    const cityName =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state ||
      '未知城市';

    // 提取国家名称
    const countryName = address.country || '未知国家';

    // 获取大洲
    const countryCode = address.country_code || '';
    const continent = getContinent(countryCode);

    return {
      cityName,
      countryName,
      continent,
      latitude,
      longitude,
    };
  } catch (error) {
    // 处理网络错误和超时
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('反向地理编码请求超时，请检查网络连接');
      }
      throw error;
    }
    throw new Error('反向地理编码失败，请稍后重试');
  }
};
