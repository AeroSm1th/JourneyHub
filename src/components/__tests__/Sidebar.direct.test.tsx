/**
 * Sidebar 组件直接导入测试（不使用 mock）
 */

import { describe, it, expect } from 'vitest';

describe('Sidebar Direct Import', () => {
  it('should be able to import the module', async () => {
    const module = await import('../Sidebar');
    console.log('Module:', module);
    console.log('Module keys:', Object.keys(module));
    console.log('Sidebar:', module.Sidebar);
    expect(module).toBeDefined();
  });
});
