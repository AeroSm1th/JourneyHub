/**
 * Vitest 测试环境配置
 *
 * 配置全局测试环境，包括 DOM 测试库和自定义匹配器
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// 每个测试后自动清理
afterEach(() => {
  cleanup();
});
