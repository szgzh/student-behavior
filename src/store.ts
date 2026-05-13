// 状态管理 - 使用 localStorage 本地存储
import { Student, BehaviorRecord, Behavior, StudentStats, DEFAULT_BEHAVIORS, STAR_TITLES } from './types';
import { mockStudents, mockRecords, calculateStudentStats } from './mockData';

type Listener = () => void;

const STORAGE_KEY = 'student-behavior-data';

class Store {
  private students: Student[] = [...mockStudents];
  private records: BehaviorRecord[] = [...mockRecords];
  private behaviors: Behavior[] = DEFAULT_BEHAVIORS;
  private listeners: Set<Listener> = new Set();
  private currentView: string = 'dashboard';
  private selectedStudentId: string | null = null;
  private selectedMonth: string = this.getCurrentMonth();
  private initialized: boolean = false;
  private dataLoaded: boolean = false;

  constructor() {
    // 从 localStorage 加载数据
    this.loadFromLocalStorage();
  }

  // 从 localStorage 加载数据
  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.students = data.students || [...mockStudents];
        this.records = data.records || [...mockRecords];
        console.log('✅ 数据已从本地加载');
      } else {
        console.log('📝 首次使用，加载默认数据');
      }
    } catch (e) {
      console.error('❌ 加载数据失败，使用默认数据', e);
    }
    this.dataLoaded = true;
    this.initialized = true;
  }

  // 保存数据到 localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        students: this.students,
        records: this.records
      }));
      console.log('✅ 数据已保存');
    } catch (e) {
      console.error('❌ 保存数据失败', e);
    }
  }

  // 等待数据加载完成（兼容旧代码）
  async waitForData(): Promise<void> {
    // localStorage 是同步的，直接返回
    return Promise.resolve();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  setView(view: string): void {
    this.currentView = view;
    if (view !== 'studentDetail') {
      this.selectedStudentId = null;
    }
    this.notify();
  }

  getView(): string {
    return this.currentView;
  }

  selectStudent(id: string | null): void {
    this.selectedStudentId = id;
    if (id) {
      this.currentView = 'studentDetail';
    }
    this.notify();
  }

  getSelectedStudentId(): string | null {
    return this.selectedStudentId;
  }

  // 学生管理 - 同步返回当前数据
  getStudents(): Student[] {
    return [...this.students];
  }

  getStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const newStudent: Student = {
      ...student,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.students.push(newStudent);
    this.saveToLocalStorage();
    this.notify();
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): void {
    const index = this.students.findIndex(s => s.id === id);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...updates };
      this.saveToLocalStorage();
      this.notify();
    }
  }

  deleteStudent(id: string): void {
    this.students = this.students.filter(s => s.id !== id);
    this.records = this.records.filter(r => r.studentId !== id);
    if (this.selectedStudentId === id) {
      this.selectedStudentId = null;
      this.currentView = 'dashboard';
    }
    this.saveToLocalStorage();
    this.notify();
  }

  // 行为记录 - 同步返回当前数据
  getRecords(): BehaviorRecord[] {
    return [...this.records];
  }

  getRecordsByStudent(studentId: string): BehaviorRecord[] {
    return this.records.filter(r => r.studentId === studentId);
  }

  getBehaviors(): Behavior[] {
    return [...this.behaviors];
  }

  getBehaviorById(id: string): Behavior | undefined {
    return this.behaviors.find(b => b.id === id);
  }

  addRecord(record: Omit<BehaviorRecord, 'id'>): BehaviorRecord {
    const newRecord: BehaviorRecord = {
      ...record,
      id: `r${Date.now()}`
    };
    this.records.push(newRecord);
    this.saveToLocalStorage();
    this.notify();
    return newRecord;
  }

  deleteRecord(id: string): void {
    this.records = this.records.filter(r => r.id !== id);
    this.saveToLocalStorage();
    this.notify();
  }

  // 统计数据
  getAllStats(): Map<string, StudentStats> {
    const stats = new Map<string, StudentStats>();
    for (const student of this.students) {
      stats.set(student.id, {
        studentId: student.id,
        ...calculateStudentStats(student.id, this.records)
      });
    }
    return stats;
  }

  getStudentStats(studentId: string): StudentStats {
    return {
      studentId,
      ...calculateStudentStats(studentId, this.records)
    };
  }

  // 排行榜
  getWeeklyLeaderboard(): Array<Student & StudentStats> {
    const stats = this.getAllStats();
    return this.students
      .map(s => ({ ...s, ...stats.get(s.id)! }))
      .sort((a, b) => b.weeklyScore - a.weeklyScore)
      .slice(0, 10);
  }

  getMonthlyLeaderboard(month?: string): Array<Student & StudentStats> | Array<Student & { monthlyScore: number; recordCount: number }> {
    if (!month) {
      const stats = this.getAllStats();
      return this.students
        .map(s => ({ ...s, ...stats.get(s.id)! }))
        .sort((a, b) => b.monthlyScore - a.monthlyScore)
        .slice(0, 10);
    }
    
    const stats = this.getMonthlyStats(month);
    return this.students
      .map(s => {
        const sStats = stats.get(s.id) || { records: [], totalScore: 0 };
        return {
          ...s,
          monthlyScore: sStats.totalScore,
          recordCount: sStats.records.length
        };
      })
      .sort((a, b) => b.monthlyScore - a.monthlyScore)
      .slice(0, 20);
  }

  getTotalLeaderboard(): Array<Student & StudentStats> {
    const stats = this.getAllStats();
    return this.students
      .map(s => ({ ...s, ...stats.get(s.id)! }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  }

  getStarTitle(score: number): { title: string; icon: string; color: string } | null {
    for (const star of STAR_TITLES) {
      if (score >= star.minScore) {
        return { title: star.title, icon: star.icon, color: star.color };
      }
    }
    return null;
  }

  // 学生分析报告
  getStudentReport(studentId: string): {
    student: Student;
    stats: StudentStats;
    starTitle: { title: string; icon: string; color: string } | null;
    recentRecords: BehaviorRecord[];
    behaviorBreakdown: { positive: number; negative: number };
    weeklyTrend: Array<{ week: string; score: number }>;
  } | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const stats = this.getStudentStats(studentId);
    const starTitle = this.getStarTitle(stats.totalScore);
    const records = this.getRecordsByStudent(studentId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const recentRecords = records.slice(0, 20);
    
    const positiveRecords = records.filter(r => r.score > 0);
    const negativeRecords = records.filter(r => r.score < 0);

    const weeklyTrend = this.calculateWeeklyTrend(studentId);

    return {
      student,
      stats,
      starTitle,
      recentRecords,
      behaviorBreakdown: {
        positive: positiveRecords.length,
        negative: negativeRecords.length
      },
      weeklyTrend
    };
  }

  private calculateWeeklyTrend(studentId: string): Array<{ week: string; score: number }> {
    const records = this.records.filter(r => r.studentId === studentId);
    const weeks: Map<string, number> = new Map();
    
    for (const record of records) {
      const date = new Date(record.date);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      weeks.set(weekKey, (weeks.get(weekKey) || 0) + record.score);
    }
    
    return Array.from(weeks.entries())
      .map(([week, score]) => ({ week, score }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // 历史记录
  setSelectedMonth(month: string): void {
    this.selectedMonth = month;
    this.notify();
  }

  getSelectedMonth(): string {
    return this.selectedMonth;
  }

  getAvailableMonths(): string[] {
    const months = new Set<string>();
    for (const record of this.records) {
      const date = new Date(record.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(month);
    }
    months.add(this.getCurrentMonth());
    return Array.from(months).sort().reverse();
  }

  getMonthlyRecords(month: string): BehaviorRecord[] {
    return this.records.filter(r => {
      const date = new Date(r.date);
      const recordMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return recordMonth === month;
    });
  }

  getStudentMonthlyRecords(studentId: string, month: string): BehaviorRecord[] {
    return this.getMonthlyRecords(month).filter(r => r.studentId === studentId);
  }

  getMonthlyStats(month: string): Map<string, { records: BehaviorRecord[]; totalScore: number }> {
    const monthlyRecords = this.getMonthlyRecords(month);
    const stats = new Map<string, { records: BehaviorRecord[]; totalScore: number }>();
    
    for (const record of monthlyRecords) {
      if (!stats.has(record.studentId)) {
        stats.set(record.studentId, { records: [], totalScore: 0 });
      }
      const current = stats.get(record.studentId)!;
      current.records.push(record);
      current.totalScore += record.score;
    }
    
    return stats;
  }

  getMonthlyHistory(): Array<{ month: string; totalRecords: number; totalScore: number }> {
    const months = this.getAvailableMonths();
    return months.map(month => {
      const records = this.getMonthlyRecords(month);
      return {
        month,
        totalRecords: records.length,
        totalScore: records.reduce((sum, r) => sum + r.score, 0)
      };
    });
  }

  addStudentsFromImport(students: Array<{ name: string; class: string; gender: '男' | '女' }>): number {
    let added = 0;
    for (const s of students) {
      const exists = this.students.some(st => st.name === s.name && st.class === s.class);
      if (!exists) {
        const avatar = s.gender === '男' ? '👦' : '👧';
        this.students.push({
          ...s,
          avatar,
          id: `s${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString().split('T')[0]
        });
        added++;
      }
    }
    if (added > 0) {
      this.saveToLocalStorage();
      this.notify();
    }
    return added;
  }

  resetToDefault(): void {
    this.students = [...mockStudents];
    this.records = [...mockRecords];
    this.saveToLocalStorage();
    this.notify();
  }
}

export const store = new Store();
