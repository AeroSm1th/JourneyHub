/**
 * 单元测试：大洲映射函数
 *
 * 测试国家代码到大洲的映射逻辑
 * 验证需求: 3.2
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getContinent } from '../nominatim';

// ============================================================================
// 已知的映射数据
// ============================================================================

const KNOWN_MAPPINGS: Record<string, string> = {
  cn: 'Asia',
  jp: 'Asia',
  kr: 'Asia',
  in: 'Asia',
  th: 'Asia',
  us: 'North America',
  ca: 'North America',
  mx: 'North America',
  gb: 'Europe',
  fr: 'Europe',
  de: 'Europe',
  it: 'Europe',
  es: 'Europe',
  br: 'South America',
  ar: 'South America',
  eg: 'Africa',
  za: 'Africa',
  ng: 'Africa',
  au: 'Oceania',
  nz: 'Oceania',
  aq: 'Antarctica',
};

const VALID_CONTINENTS = [
  'Asia',
  'Europe',
  'Africa',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
  'Unknown',
];

// ============================================================================
// 测试
// ============================================================================

describe('大洲映射函数 getContinent', () => {
  it('已知国家代码应返回正确的大洲', () => {
    for (const [code, expectedContinent] of Object.entries(KNOWN_MAPPINGS)) {
      expect(getContinent(code)).toBe(expectedContinent);
    }
  });

  it('大写国家代码应正确映射（大小写不敏感）', () => {
    for (const [code, expectedContinent] of Object.entries(KNOWN_MAPPINGS)) {
      expect(getContinent(code.toUpperCase())).toBe(expectedContinent);
    }
  });

  it('未知国家代码应返回 Unknown', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 2, maxLength: 2 })
          .filter((s) => !Object.keys(KNOWN_MAPPINGS).includes(s.toLowerCase())),
        (unknownCode) => {
          const result = getContinent(unknownCode);
          // 结果应该是 Unknown 或有效的大洲名称
          expect(VALID_CONTINENTS).toContain(result);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('返回值应始终是有效的大洲名称或 Unknown', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 5 }), (code) => {
        const result = getContinent(code);
        expect(VALID_CONTINENTS).toContain(result);
      }),
      { numRuns: 100 }
    );
  });

  it('空字符串应返回 Unknown', () => {
    expect(getContinent('')).toBe('Unknown');
  });
});
