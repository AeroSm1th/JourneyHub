/**
 * Sidebar 组件简单导入测试
 */

import { describe, it, expect } from 'vitest';
import Sidebar from '../Sidebar.tsx';

describe('Sidebar Import', () => {
  it('should import Sidebar component', () => {
    expect(Sidebar).toBeDefined();
    expect(typeof Sidebar).toBe('function');
  });
});
