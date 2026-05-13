// 模拟数据
import { Student, BehaviorRecord } from './types';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function generateRandomDate(start: Date, end: Date): string {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  const date = new Date(randomTime);
  return date.toISOString().split('T')[0];
}

function generateRandomTime(start: Date, end: Date): string {
  const date = generateRandomDate(start, end);
  const hours = Math.floor(Math.random() * 9) + 8;
  const minutes = Math.floor(Math.random() * 60);
  return `${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}

export const mockStudents: Student[] = [
  { id: 's1', name: '张小明', class: '一年级一班', gender: '男', avatar: '👦', createdAt: '2024-09-01' },
  { id: 's2', name: '李小红', class: '一年级一班', gender: '女', avatar: '👧', createdAt: '2024-09-01' },
  { id: 's3', name: '王小强', class: '一年级二班', gender: '男', avatar: '👦', createdAt: '2024-09-01' },
  { id: 's4', name: '陈思思', class: '一年级二班', gender: '女', avatar: '👧', createdAt: '2024-09-01' },
  { id: 's5', name: '刘子轩', class: '一年级三班', gender: '男', avatar: '👦', createdAt: '2024-09-01' },
  { id: 's6', name: '赵雨萱', class: '一年级三班', gender: '女', avatar: '👧', createdAt: '2024-09-01' },
  { id: 's7', name: '孙浩然', class: '二年级一班', gender: '男', avatar: '👦', createdAt: '2024-09-01' },
  { id: 's8', name: '周雅琪', class: '二年级一班', gender: '女', avatar: '👧', createdAt: '2024-09-01' },
];

const positiveScores = [1, 3, 5, 2, 1, 5, 2, 3, 3, 3];
const negativeScores = [1, 2, 2, 2, 10, 2, 5, 2, 3, 50, 20, 5];

const behaviorIds = [
  'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10',
  'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12'
];

const notes = [
  '表现很好，继续保持',
  '值得表扬',
  '希望再接再厉',
  '',
  '进步明显',
  '还需努力',
  '需加强自律',
  '',
  '优秀表现',
  '继续保持'
];

export function generateMockRecords(): BehaviorRecord[] {
  const records: BehaviorRecord[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  for (const student of mockStudents) {
    const recordCount = Math.floor(Math.random() * 30) + 20;
    
    for (let i = 0; i < recordCount; i++) {
      const behaviorId = behaviorIds[Math.floor(Math.random() * behaviorIds.length)];
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      records.push({
        id: `r${records.length + 1}`,
        studentId: student.id,
        behaviorId,
        score: behaviorId.startsWith('b') ? 
          positiveScores[parseInt(behaviorId.slice(1)) - 1] :
          -negativeScores[parseInt(behaviorId.slice(1)) - 1],
        date: generateRandomTime(threeMonthsAgo, now)
      });
    }
  }
  
  return records;
}

export const mockRecords = generateMockRecords();

export function calculateStudentStats(studentId: string, records: BehaviorRecord[]) {
  const studentRecords = records.filter(r => r.studentId === studentId);
  const now = new Date();
  const weekStart = getWeekStart(now);
  const monthStart = getMonthStart(now);
  
  const weeklyRecords = studentRecords.filter(r => new Date(r.date) >= weekStart);
  const monthlyRecords = studentRecords.filter(r => new Date(r.date) >= monthStart);
  
  const positiveRecords = studentRecords.filter(r => r.score > 0);
  const negativeRecords = studentRecords.filter(r => r.score < 0);
  
  return {
    totalScore: studentRecords.reduce((sum, r) => sum + r.score, 0),
    weeklyScore: weeklyRecords.reduce((sum, r) => sum + r.score, 0),
    monthlyScore: monthlyRecords.reduce((sum, r) => sum + r.score, 0),
    recordCount: studentRecords.length,
    positiveCount: positiveRecords.length,
    negativeCount: negativeRecords.length
  };
}
