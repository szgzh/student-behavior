// 学生行为记录系统 - 类型定义

export interface Student {
  id: string;
  name: string;
  class: string;
  gender: '男' | '女';
  avatar: string;
  createdAt: string;
}

export interface Behavior {
  id: string;
  name: string;
  category: 'positive' | 'negative';
  score: number;
  description: string;
  icon: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  behaviorId: string;
  score: number;
  date: string;
}

export interface MonthlyRecord {
  month: string; // 格式: "2026-05"
  studentId: string;
  records: BehaviorRecord[];
  totalScore: number;
}

export interface StudentStats {
  studentId: string;
  totalScore: number;
  weeklyScore: number;
  monthlyScore: number;
  recordCount: number;
  positiveCount: number;
  negativeCount: number;
}

export interface StarTitle {
  title: string;
  minScore: number;
  icon: string;
  color: string;
}

export const STAR_TITLES: StarTitle[] = [
  { title: '学习之星', minScore: 100, icon: '📚', color: 'text-yellow-500' },
  { title: '进步之星', minScore: 50, icon: '🚀', color: 'text-blue-500' },
  { title: '文明之星', minScore: 30, icon: '🌟', color: 'text-green-500' },
  { title: '劳动之星', minScore: 20, icon: '🏆', color: 'text-orange-500' },
  { title: '团结之星', minScore: 10, icon: '🤝', color: 'text-purple-500' },
];

export const DEFAULT_BEHAVIORS: Behavior[] = [
  // 正面行为
  { id: 'b1', name: '课堂积极发言', category: 'positive', score: 1, description: '在课堂上主动回答问题或提出疑问', icon: '✋' },
  { id: 'b2', name: '作业优秀', category: 'positive', score: 3, description: '作业完成质量优秀', icon: '📝' },
  { id: 'b3', name: '好人好事', category: 'positive', score: 5, description: '主动帮助他人，做了好事', icon: '🤝' },
  { id: 'b4', name: '卫生打扫认真负责', category: 'positive', score: 2, description: '认真负责完成卫生打扫工作', icon: '🧹' },
  { id: 'b5', name: '获得老师表扬', category: 'positive', score: 1, description: '因出色表现获得老师表扬', icon: '⭐' },
  { id: 'b6', name: '竞赛获奖', category: 'positive', score: 5, description: '在校级及以上竞赛中获奖', icon: '🏆' },
  { id: 'b7', name: '全勤', category: 'positive', score: 2, description: '当月无请假、无迟到、无旷课', icon: '✅' },
  { id: 'b8', name: '单科成绩前3', category: 'positive', score: 3, description: '单科考试成绩排名班级前3名', icon: '📊' },
  { id: 'b9', name: '全校前100', category: 'positive', score: 3, description: '考试成绩排名全校前100名', icon: '🎯' },
  { id: 'b10', name: '进步50+', category: 'positive', score: 3, description: '成绩或表现进步显著，进步名次50名以上', icon: '📈' },
  // 负面行为
  { id: 'n1', name: '迟到', category: 'negative', score: -1, description: '上课或集会迟到', icon: '⏰' },
  { id: 'n2', name: '旷课', category: 'negative', score: -2, description: '无故缺课', icon: '❌' },
  { id: 'n3', name: '作业未完成或抄袭', category: 'negative', score: -2, description: '未按时完成作业或抄袭他人作业', icon: '📕' },
  { id: 'n4', name: '上课说小话做小动作吃零食', category: 'negative', score: -2, description: '上课（含自习课）说小话、做小动作、吃零食扰乱课堂秩序', icon: '⚠️' },
  { id: 'n5', name: '顶撞老师', category: 'negative', score: -10, description: '不尊重老师，顶撞老师', icon: '😠' },
  { id: 'n6', name: '卫生不认真负责，逃避', category: 'negative', score: -2, description: '逃避卫生劳动或不认真负责', icon: '🚫' },
  { id: 'n7', name: '带手机、游戏机等电子产品', category: 'negative', score: -5, description: '带电子产品到校玩耍或不服从班干部合理管理', icon: '📱' },
  { id: 'n8', name: '乱扔垃圾、破坏公共卫生', category: 'negative', score: -2, description: '乱扔垃圾或破坏公共卫生环境', icon: '🗑️' },
  { id: 'n9', name: '给同学起侮辱性外号、嘲笑他人', category: 'negative', score: -3, description: '侮辱、嘲笑他人', icon: '💢' },
  { id: 'n10', name: '打架斗殴', category: 'negative', score: -50, description: '与同学发生打架斗殴', icon: '💥' },
  { id: 'n11', name: '带烟抽烟、偷窃等严重违纪', category: 'negative', score: -20, description: '严重违纪行为', icon: '🚨' },
  { id: 'n12', name: '故意损坏公物', category: 'negative', score: -5, description: '故意损坏学校公共财物', icon: '🔨' },
];
