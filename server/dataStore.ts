// 服务器端数据存储 - 文件持久化存储
import type { Student, BehaviorRecord } from '../src/types';
import { mockStudents, mockRecords } from '../src/mockData';
import * as fs from 'fs';
import * as path from 'path';

// 定义存储结构
interface ServerData {
  students: Student[];
  records: BehaviorRecord[];
}

// 数据文件路径
const DATA_FILE = path.join(process.cwd(), 'data.json');

// 确保目录存在
function ensureDataDir(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 加载数据
export function loadData(): ServerData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content) as ServerData;
      console.log('✅ 数据已从文件加载:', data.students.length, '学生,', data.records.length, '记录');
      return data;
    }
  } catch (e) {
    console.error('❌ 加载数据失败:', e);
  }
  // 返回默认数据
  console.log('📝 使用默认数据');
  return {
    students: [...mockStudents],
    records: [...mockRecords]
  };
}

// 保存数据到文件
export function saveData(data: ServerData): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ 数据已保存到文件');
  } catch (e) {
    console.error('❌ 保存数据失败:', e);
  }
}

// 获取学生列表
export function getStudents(): Student[] {
  const data = loadData();
  return data.students;
}

// 设置学生列表
export function setStudents(students: Student[]): void {
  const data = loadData();
  data.students = students;
  saveData(data);
}

// 获取行为记录
export function getRecords(): BehaviorRecord[] {
  const data = loadData();
  return data.records;
}

// 设置行为记录
export function setRecords(records: BehaviorRecord[]): void {
  const data = loadData();
  data.records = records;
  saveData(data);
}

// 重置数据
export function resetData(): void {
  const defaultData = {
    students: [...mockStudents],
    records: [...mockRecords]
  };
  saveData(defaultData);
}

// 初始化数据（只调用一次）
let initialized = false;
export function initializeData(): ServerData {
  if (!initialized) {
    initialized = true;
    return loadData();
  }
  return loadData();
}
