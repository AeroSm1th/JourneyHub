/**
 * Nominatim 反向地理编码服务使用示例
 */

import { reverseGeocode, getContinent } from './nominatim';

// 示例 1: 基本用法 - 获取北京的地理信息
async function example1() {
  try {
    const result = await reverseGeocode(39.9042, 116.4074);
    console.log('北京:', result);
    // 输出: { cityName: '北京市', countryName: '中国', continent: 'Asia', ... }
  } catch (error) {
    console.error('错误:', error);
  }
}

// 示例 2: 获取纽约的地理信息
async function example2() {
  try {
    const result = await reverseGeocode(40.7128, -74.006);
    console.log('纽约:', result);
    // 输出: { cityName: 'New York', countryName: 'United States', continent: 'North America', ... }
  } catch (error) {
    console.error('错误:', error);
  }
}

// 示例 3: 在地图点击事件中使用
async function handleMapClick(lat: number, lng: number) {
  try {
    const location = await reverseGeocode(lat, lng);
    console.log('点击位置:', location);
    // 可以用于预填充表单
  } catch (error) {
    console.error('无法获取位置信息:', error);
  }
}

// 示例 4: 使用 getContinent 函数
function example4() {
  console.log(getContinent('cn')); // 'Asia'
  console.log(getContinent('us')); // 'North America'
  console.log(getContinent('gb')); // 'Europe'
  console.log(getContinent('br')); // 'South America'
  console.log(getContinent('au')); // 'Oceania'
}

// 示例 5: 错误处理
async function example5() {
  try {
    // 无效的纬度
    await reverseGeocode(91, 0);
  } catch (error) {
    console.error('参数错误:', error);
    // 输出: 纬度必须在 -90 到 90 之间
  }
}
