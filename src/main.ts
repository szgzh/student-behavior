// 学生行为记录系统 - 主应用
import { store } from './store';
import { Student, BehaviorRecord, Behavior, StudentStats, DEFAULT_BEHAVIORS } from './types';

let unsubscribe: (() => void) | null = null;

export async function initApp(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App element not found');
    return;
  }

  // 显示加载中
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">正在加载数据...</p>
      </div>
    </div>
  `;

  // 等待数据加载完成
  await store.waitForData();

  unsubscribe = store.subscribe(render);
  render();
}

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const view = store.getView();
  
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <!-- 顶部导航 -->
      <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                📋
              </div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                学生行为记录系统
              </h1>
            </div>
            <nav class="flex items-center gap-1">
              ${getNavItem('dashboard', '仪表盘', '📊')}
              ${getNavItem('students', '学生管理', '👥')}
              ${getNavItem('record', '行为记录', '✏️')}
              ${getNavItem('leaderboard', '积分排行', '🏆')}
              ${getNavItem('history', '历史记录', '📅')}
              ${getNavItem('report', '分析报告', '📈')}
            </nav>
          </div>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        ${renderView(view)}
      </main>
    </div>
  `;

  attachEventListeners();
}

function getNavItem(view: string, label: string, icon: string): string {
  const currentView = store.getView();
  const isActive = currentView === view || (view === 'report' && currentView === 'studentDetail');
  return `
    <button 
      data-nav="${view}"
      class="nav-item px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-100 text-blue-700 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }"
    >
      <span class="mr-1.5">${icon}</span>
      ${label}
    </button>
  `;
}

function renderView(view: string): string {
  switch (view) {
    case 'dashboard':
      return renderDashboard();
    case 'students':
      return renderStudents();
    case 'record':
      return renderRecordForm();
    case 'leaderboard':
      return renderLeaderboard();
    case 'history':
      return renderHistory();
    case 'studentDetail':
      return renderStudentDetail(store.getSelectedStudentId()!);
    case 'report':
      return renderReportSelection();
    default:
      return renderDashboard();
  }
}

function renderDashboard(): string {
  const stats = store.getAllStats();
  const totalStudents = store.getStudents().length;
  const totalRecords = store.getRecords().length;
  const avgScore = Array.from(stats.values()).reduce((sum, s) => sum + s.totalScore, 0) / totalStudents;
  const weeklyLeaderboard = store.getWeeklyLeaderboard();
  const monthlyLeaderboard = store.getMonthlyLeaderboard();

  return `
    <div class="space-y-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">学生总数</p>
              <p class="text-3xl font-bold text-gray-900">${totalStudents}</p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">👥</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">行为记录</p>
              <p class="text-3xl font-bold text-gray-900">${totalRecords}</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">✏️</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">平均积分</p>
              <p class="text-3xl font-bold text-gray-900">${avgScore.toFixed(1)}</p>
            </div>
            <div class="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">📊</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">本周之星</p>
              ${weeklyLeaderboard.length > 0 ? `
                <p class="text-lg font-bold text-gray-900">${weeklyLeaderboard[0].avatar} ${weeklyLeaderboard[0].name}</p>
                <p class="text-sm text-yellow-600">+${weeklyLeaderboard[0].weeklyScore}分</p>
              ` : '<p class="text-lg text-gray-400">暂无</p>'}
            </div>
            <div class="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
          </div>
        </div>
      </div>

      <!-- 排行榜预览 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 周榜 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📅</span> 本周排行 TOP 5
            </h2>
            <button data-nav="leaderboard" class="text-sm text-blue-600 hover:text-blue-700 font-medium">查看全部 →</button>
          </div>
          <div class="divide-y divide-gray-50">
            ${weeklyLeaderboard.slice(0, 5).map((s, i) => `
              <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }">${i + 1}</div>
                  <span class="text-xl">${s.avatar}</span>
                  <div>
                    <p class="font-medium text-gray-900">${s.name}</p>
                    <p class="text-sm text-gray-500">${s.class}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold ${s.weeklyScore >= 0 ? 'text-green-600' : 'text-red-600'}">${s.weeklyScore >= 0 ? '+' : ''}${s.weeklyScore}</p>
                  <p class="text-xs text-gray-400">本周积分</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 月榜 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>🗓️</span> 本月排行 TOP 5
            </h2>
            <button data-nav="leaderboard" class="text-sm text-blue-600 hover:text-blue-700 font-medium">查看全部 →</button>
          </div>
          <div class="divide-y divide-gray-50">
            ${monthlyLeaderboard.slice(0, 5).map((s, i) => `
              <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }">${i + 1}</div>
                  <span class="text-xl">${s.avatar}</span>
                  <div>
                    <p class="font-medium text-gray-900">${s.name}</p>
                    <p class="text-sm text-gray-500">${s.class}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold ${s.monthlyScore >= 0 ? 'text-green-600' : 'text-red-600'}">${s.monthlyScore >= 0 ? '+' : ''}${s.monthlyScore}</p>
                  <p class="text-xs text-gray-400">本月积分</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div class="flex flex-wrap gap-4">
          <button data-action="quick-record" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2">
            <span>✏️</span> 快速记录行为
          </button>
          <button data-action="add-student" class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-200 transition-all flex items-center gap-2">
            <span>➕</span> 添加学生
          </button>
          <button data-action="view-report" class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2">
            <span>📊</span> 查看分析报告
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderStudents(): string {
  const students = store.getStudents();
  const stats = store.getAllStats();

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">学生管理</h2>
        <div class="flex gap-3 flex-wrap">
          <button data-action="add-student-manual" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2">
            <span>➕</span> 添加学生
          </button>
          <button data-action="import-students" class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-200 transition-all flex items-center gap-2">
            <span>📥</span> 表格导入
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${students.map(s => {
          const stat = stats.get(s.id)!;
          const star = store.getStarTitle(stat.totalScore);
          return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                      ${s.avatar}
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">${s.name}</h3>
                      <p class="text-sm text-gray-500">${s.class}</p>
                      <span class="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">${s.gender}</span>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">总积分</span>
                    <span class="font-semibold ${stat.totalScore >= 0 ? 'text-green-600' : 'text-red-600'}">${stat.totalScore >= 0 ? '+' : ''}${stat.totalScore}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">本周</span>
                    <span class="font-semibold ${stat.weeklyScore >= 0 ? 'text-green-600' : 'text-red-600'}">${stat.weeklyScore >= 0 ? '+' : ''}${stat.weeklyScore}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">本月</span>
                    <span class="font-semibold ${stat.monthlyScore >= 0 ? 'text-green-600' : 'text-red-600'}">${stat.monthlyScore >= 0 ? '+' : ''}${stat.monthlyScore}</span>
                  </div>
                </div>

                ${star ? `
                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${star.color} bg-current/10">
                      ${star.icon} ${star.title}
                    </span>
                  </div>
                ` : ''}

                <div class="mt-4 flex gap-2">
                  <button data-action="view-student" data-id="${s.id}" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    查看详情
                  </button>
                  <button data-action="record-for" data-id="${s.id}" class="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                    记录行为
                  </button>
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <button data-action="delete-student" data-id="${s.id}" class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-2">
                    <span>🗑️</span> 删除学生
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderRecordForm(): string {
  const students = store.getStudents();
  const behaviors = store.getBehaviors();
  const positiveBehaviors = behaviors.filter(b => b.category === 'positive');
  const negativeBehaviors = behaviors.filter(b => b.category === 'negative');

  return `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">记录学生行为</h2>
        <p class="text-gray-500">选择学生和行为类型，系统将自动计算积分</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <!-- 学生选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <span class="flex items-center gap-2">
              <span>👤</span> 选择学生
            </span>
          </label>
          <select id="student-select" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white">
            <option value="">请选择学生...</option>
            ${students.map(s => `
              <option value="${s.id}">${s.avatar} ${s.name} - ${s.class}</option>
            `).join('')}
          </select>
        </div>

        <!-- 行为类别 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <span class="flex items-center gap-2">
              <span>🏷️</span> 行为类型
            </span>
          </label>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <button data-behavior-type="positive" class="behavior-type-btn px-4 py-3 rounded-xl border-2 border-gray-200 text-left hover:border-green-300 hover:bg-green-50 transition-all">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xl">👍</span>
                <span class="font-medium text-gray-900">正面行为</span>
              </div>
              <p class="text-xs text-gray-500">帮助、表扬、进步等</p>
            </button>
            <button data-behavior-type="negative" class="behavior-type-btn px-4 py-3 rounded-xl border-2 border-gray-200 text-left hover:border-red-300 hover:bg-red-50 transition-all">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xl">👎</span>
                <span class="font-medium text-gray-900">负面行为</span>
              </div>
              <p class="text-xs text-gray-500">迟到、违纪、违规等</p>
            </button>
          </div>
        </div>

        <!-- 行为选择 -->
        <div id="behavior-list" class="space-y-3">
          <p class="text-center text-gray-400 py-8">请先选择行为类型</p>
        </div>

        <!-- 积分预览 -->
        <div id="score-preview" class="hidden p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">本次积分变化</span>
            <span id="score-value" class="text-2xl font-bold text-blue-600">+0</span>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button id="submit-record" disabled class="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2">
          <span>✨</span> 提交记录
        </button>
      </div>
    </div>
  `;
}

function renderBehaviorOptions(behaviors: Behavior[], isPositive: boolean): string {
  return behaviors.map(b => `
    <button data-behavior-id="${b.id}" class="behavior-option w-full px-4 py-3 rounded-xl border border-gray-200 text-left hover:border-blue-300 hover:bg-blue-50 transition-all ${isPositive ? 'hover:bg-green-50 hover:border-green-300' : 'hover:bg-red-50 hover:border-red-300'}">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900">${b.name}</p>
          <p class="text-sm text-gray-500">${b.description}</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold ${b.score >= 0 ? 'text-green-600' : 'text-red-600'}">${b.score >= 0 ? '+' : ''}${b.score}</p>
          <p class="text-xs text-gray-400">积分</p>
        </div>
      </div>
    </button>
  `).join('');
}

function renderLeaderboard(): string {
  const weeklyLeaderboard = store.getWeeklyLeaderboard();
  const monthlyLeaderboard = store.getMonthlyLeaderboard();
  const totalLeaderboard = store.getTotalLeaderboard();

  return `
    <div class="space-y-8">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">积分排行榜</h2>
        <p class="text-gray-500">查看学生的积分排名和获得称号</p>
      </div>

      <!-- 切换标签 -->
      <div class="flex justify-center gap-4 mb-8">
        <button data-leaderboard-tab="weekly" class="leaderboard-tab px-6 py-3 rounded-xl font-medium bg-blue-100 text-blue-700">本周排行</button>
        <button data-leaderboard-tab="monthly" class="leaderboard-tab px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">本月排行</button>
        <button data-leaderboard-tab="total" class="leaderboard-tab px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">总排行</button>
      </div>

      <!-- 排行榜内容 -->
      <div id="leaderboard-content">
        ${renderLeaderboardTable(weeklyLeaderboard, 'weekly')}
      </div>

      <!-- 称号说明 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏅</span> 学生称号说明
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center p-4 bg-yellow-50 rounded-xl">
            <div class="text-3xl mb-2">📚</div>
            <p class="font-medium text-yellow-700">学习之星</p>
            <p class="text-sm text-yellow-600">100分+</p>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-3xl mb-2">🚀</div>
            <p class="font-medium text-blue-700">进步之星</p>
            <p class="text-sm text-blue-600">50分+</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <div class="text-3xl mb-2">🌟</div>
            <p class="font-medium text-green-700">文明之星</p>
            <p class="text-sm text-green-600">30分+</p>
          </div>
          <div class="text-center p-4 bg-orange-50 rounded-xl">
            <div class="text-3xl mb-2">🏆</div>
            <p class="font-medium text-orange-700">劳动之星</p>
            <p class="text-sm text-orange-600">20分+</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <div class="text-3xl mb-2">🤝</div>
            <p class="font-medium text-purple-700">团结之星</p>
            <p class="text-sm text-purple-600">10分+</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 排行榜数据通用类型
type LeaderboardStudent = {
  id: string;
  name: string;
  class: string;
  avatar: string;
  totalScore: number;
  weeklyScore?: number;
  monthlyScore?: number;
  recordCount?: number;
};

function renderLeaderboardTable(data: Array<Student & StudentStats>, type: string): string {
  return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="divide-y divide-gray-100">
        ${(data as unknown as LeaderboardStudent[]).map((s, i) => {
          const star = store.getStarTitle(s.totalScore || 0);
          const displayScore = type === 'weekly' ? (s.weeklyScore || 0) : type === 'monthly' ? (s.monthlyScore || 0) : (s.totalScore || 0);
          const scoreColor = displayScore >= 0 ? 'text-green-600' : 'text-red-600';
          return `
            <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" data-student-link="${s.id}">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700 text-lg' :
                  i === 1 ? 'bg-gray-100 text-gray-700 text-lg' :
                  i === 2 ? 'bg-orange-100 text-orange-700 text-lg' :
                  'bg-gray-50 text-gray-500'
                }">
                  ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <span class="text-2xl">${s.avatar}</span>
                <div>
                  <p class="font-medium text-gray-900">${s.name}</p>
                  <p class="text-sm text-gray-500">${s.class}</p>
                </div>
              </div>
              <div class="flex items-center gap-6">
                ${star ? `
                  <span class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${star.color} bg-current/10">
                    ${star.icon} ${star.title}
                  </span>
                ` : ''}
                <div class="text-right">
                  <p class="text-xl font-bold ${scoreColor}">
                    ${displayScore >= 0 ? '+' : ''}${displayScore}
                  </p>
                  <p class="text-xs text-gray-400">
                    ${type === 'weekly' ? '本周积分' : type === 'monthly' ? '本月积分' : '总积分'}
                  </p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderReportSelection(): string {
  const students = store.getStudents();

  return `
    <div class="space-y-6">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">学生分析报告</h2>
        <p class="text-gray-500">选择学生查看详细的行为分析报告</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${students.map(s => `
          <button data-action="view-student-report" data-id="${s.id}" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-blue-200 transition-all group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ${s.avatar}
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">${s.name}</h3>
                <p class="text-sm text-gray-500">${s.class}</p>
              </div>
            </div>
            <div class="flex items-center justify-end text-blue-600 font-medium">
              查看报告 →
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStudentDetail(studentId: string): string {
  const report = store.getStudentReport(studentId);
  if (!report) {
    return '<p class="text-center text-gray-500">学生不存在</p>';
  }

  const { student, stats, starTitle, recentRecords, behaviorBreakdown, weeklyTrend } = report;
  const behaviors = store.getBehaviors();
  const maxTrend = Math.max(...weeklyTrend.map(w => Math.abs(w.score)), 1);

  return `
    <div class="space-y-8">
      <!-- 返回按钮 -->
      <button data-action="back-to-report" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
        <span>←</span> 返回报告选择
      </button>

      <!-- 学生概览 -->
      <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-5xl">
              ${student.avatar}
            </div>
            <div>
              <h2 class="text-3xl font-bold mb-2">${student.name}</h2>
              <p class="text-white/80">${student.class}</p>
              ${starTitle ? `
                <div class="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full">
                  ${starTitle.icon} <span>${starTitle.title}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="text-right">
            <p class="text-5xl font-bold">${stats.totalScore >= 0 ? '+' : ''}${stats.totalScore}</p>
            <p class="text-white/80">总积分</p>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p class="text-3xl font-bold text-green-600">+${stats.positiveCount}</p>
          <p class="text-sm text-gray-500 mt-1">正面行为</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p class="text-3xl font-bold text-red-600">${stats.negativeCount}</p>
          <p class="text-sm text-gray-500 mt-1">负面行为</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p class="text-3xl font-bold ${stats.weeklyScore >= 0 ? 'text-blue-600' : 'text-red-600'}">${stats.weeklyScore >= 0 ? '+' : ''}${stats.weeklyScore}</p>
          <p class="text-sm text-gray-500 mt-1">本周积分</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p class="text-3xl font-bold ${stats.monthlyScore >= 0 ? 'text-purple-600' : 'text-red-600'}">${stats.monthlyScore >= 0 ? '+' : ''}${stats.monthlyScore}</p>
          <p class="text-sm text-gray-500 mt-1">本月积分</p>
        </div>
      </div>

      <!-- 行为趋势图 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📈</span> 每周积分趋势
        </h3>
        ${weeklyTrend.length > 0 ? `
          <div class="flex items-end justify-between gap-2 h-40">
            ${weeklyTrend.map(w => {
              const height = Math.abs(w.score) / maxTrend * 100;
              const isPositive = w.score >= 0;
              return `
                <div class="flex-1 flex flex-col items-center gap-2">
                  <div class="w-full flex items-end justify-center" style="height: 100px;">
                    <div class="w-8 rounded-t-lg transition-all ${isPositive ? 'bg-green-400' : 'bg-red-400'}" style="height: ${Math.max(height, 5)}%;"></div>
                  </div>
                  <p class="text-xs text-gray-400">${w.week.slice(5)}</p>
                  <p class="text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}">${isPositive ? '+' : ''}${w.score}</p>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <p class="text-center text-gray-400 py-12">暂无数据</p>
        `}
      </div>

      <!-- 最近行为记录 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>📋</span> 最近行为记录
          </h3>
        </div>
        <div class="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          ${recentRecords.length > 0 ? recentRecords.map(r => {
            const behavior = behaviors.find(b => b.id === r.behaviorId);
            return `
              <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center ${behavior?.category === 'positive' ? 'bg-green-100' : 'bg-red-100'}">
                    ${behavior?.category === 'positive' ? '👍' : '👎'}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">${behavior?.name || '未知行为'}</p>
                    <p class="text-sm text-gray-500">${new Date(r.date).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
                <p class="text-lg font-bold ${r.score >= 0 ? 'text-green-600' : 'text-red-600'}">${r.score >= 0 ? '+' : ''}${r.score}</p>
              </div>
            `;
          }).join('') : `
            <p class="text-center text-gray-400 py-12">暂无记录</p>
          `}
        </div>
      </div>

      <!-- 生成报告按钮 -->
      <div class="text-center">
        <button data-action="generate-report" data-id="${studentId}" class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 transition-all inline-flex items-center gap-2">
          <span>📄</span> 生成详细报告
        </button>
      </div>
    </div>
  `;
}

function attachEventListeners(): void {
  // 导航点击
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = (e.currentTarget as HTMLElement).dataset.nav!;
      store.setView(view);
    });
  });

  // 排行榜标签切换
  document.querySelectorAll('.leaderboard-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = (e.currentTarget as HTMLElement).dataset.leaderboardTab!;
      document.querySelectorAll('.leaderboard-tab').forEach(b => {
        b.classList.remove('bg-blue-100', 'text-blue-700');
        b.classList.add('bg-gray-100', 'text-gray-600');
      });
      (e.currentTarget as HTMLElement).classList.remove('bg-gray-100', 'text-gray-600');
      (e.currentTarget as HTMLElement).classList.add('bg-blue-100', 'text-blue-700');
      
      const content = document.getElementById('leaderboard-content')!;
      let html = '';
      switch (tab) {
        case 'weekly': 
          html = renderLeaderboardTable(store.getWeeklyLeaderboard() as Array<Student & StudentStats>, 'weekly'); 
          break;
        case 'monthly': 
          html = renderLeaderboardTable(store.getMonthlyLeaderboard() as Array<Student & StudentStats>, 'monthly'); 
          break;
        case 'total': 
          html = renderLeaderboardTable(store.getTotalLeaderboard(), 'total'); 
          break;
      }
      content.innerHTML = html;
      attachEventListeners();
    });
  });

  // 学生链接点击
  document.querySelectorAll('[data-student-link]').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.studentLink!;
      store.selectStudent(id);
    });
  });

  // 历史记录月份选择
  document.querySelectorAll('.month-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const month = (e.currentTarget as HTMLElement).dataset.month!;
      store.setSelectedMonth(month);
    });
  });

  // 学生月度记录点击
  document.querySelectorAll('[data-student-history]').forEach(item => {
    item.addEventListener('click', (e) => {
      const studentId = (e.currentTarget as HTMLElement).dataset.studentHistory!;
      const detailContainer = document.getElementById('student-monthly-detail')!;
      const currentMonth = store.getSelectedMonth();
      const student = store.getStudents().find(s => s.id === studentId);
      const records = store.getStudentMonthlyRecords(studentId, currentMonth);
      
      if (!student) return;
      
      const totalScore = records.reduce((sum, r) => sum + r.score, 0);
      const scoreColor = totalScore >= 0 ? 'text-green-600' : 'text-red-600';
      
      detailContainer.classList.remove('hidden');
      detailContainer.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>${student.avatar}</span> ${student.name} - ${currentMonth.replace('-', '年')}月 行为记录
              </h3>
              <span class="text-xl font-bold ${scoreColor}">${totalScore >= 0 ? '+' : ''}${totalScore}分</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">${student.class} · ${student.gender}</p>
          </div>
          ${records.length === 0 ? `
            <div class="p-8 text-center text-gray-400">暂无本月行为记录</div>
          ` : `
            <div class="divide-y divide-gray-50">
              ${records.map(r => {
                const behavior = store.getBehaviors().find(b => b.id === r.behaviorId);
                const scoreClass = r.score >= 0 ? 'text-green-600' : 'text-red-600';
                return `
                  <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div class="flex items-center gap-4">
                      <span class="text-2xl">${behavior?.icon || '📋'}</span>
                      <div>
                        <p class="font-medium text-gray-900">${behavior?.name || '未知行为'}</p>
                        <p class="text-sm text-gray-500">${r.date}</p>
                      </div>
                    </div>
                    <span class="text-lg font-bold ${scoreClass}">${r.score >= 0 ? '+' : ''}${r.score}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    });
  });

  // 操作按钮
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = (e.currentTarget as HTMLElement).dataset.action!;
      handleAction(action, e.currentTarget as HTMLElement);
    });
  });

  // 行为类型选择
  document.querySelectorAll('.behavior-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = (e.currentTarget as HTMLElement).dataset.behaviorType!;
      const behaviors = store.getBehaviors().filter(b => b.category === type);
      const behaviorList = document.getElementById('behavior-list')!;
      behaviorList.innerHTML = renderBehaviorOptions(behaviors, type === 'positive');
      attachEventListeners();
    });
  });

  // 行为选项选择
  document.querySelectorAll('.behavior-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const behaviorId = (e.currentTarget as HTMLElement).dataset.behaviorId!;
      const behavior = store.getBehaviorById(behaviorId);
      if (!behavior) return;

      // 更新选中状态
      document.querySelectorAll('.behavior-option').forEach(b => {
        b.classList.remove('border-blue-400', 'bg-blue-50', 'border-red-400', 'bg-red-50');
      });
      (e.currentTarget as HTMLElement).classList.add('border-2');
      if (behavior.category === 'positive') {
        (e.currentTarget as HTMLElement).classList.add('border-green-400', 'bg-green-50');
      } else {
        (e.currentTarget as HTMLElement).classList.add('border-red-400', 'bg-red-50');
      }

      // 显示积分预览
      const preview = document.getElementById('score-preview')!;
      const scoreValue = document.getElementById('score-value')!;
      preview.classList.remove('hidden');
      scoreValue.textContent = `${behavior.score >= 0 ? '+' : ''}${behavior.score}`;
      scoreValue.className = `text-2xl font-bold ${behavior.score >= 0 ? 'text-green-600' : 'text-red-600'}`;

      // 启用提交按钮
      const submitBtn = document.getElementById('submit-record') as HTMLButtonElement;
      const studentSelect = document.getElementById('student-select') as HTMLSelectElement;
      submitBtn.disabled = !studentSelect.value;
      submitBtn.dataset.selectedBehavior = behaviorId;
    });
  });

  // 学生选择变化
  const studentSelect = document.getElementById('student-select') as HTMLSelectElement;
  if (studentSelect) {
    studentSelect.addEventListener('change', () => {
      const submitBtn = document.getElementById('submit-record') as HTMLButtonElement;
      submitBtn.disabled = !studentSelect.value || !submitBtn.dataset.selectedBehavior;
    });
  }

  // 提交记录
  const submitBtn = document.getElementById('submit-record') as HTMLButtonElement;
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const studentId = (document.getElementById('student-select') as HTMLSelectElement).value;
      const behaviorId = submitBtn.dataset.selectedBehavior!;
      const behavior = store.getBehaviorById(behaviorId);

      if (!studentId || !behaviorId || !behavior) {
        alert('请选择学生和行为类型');
        return;
      }

      store.addRecord({
        studentId,
        behaviorId,
        score: behavior.score,
        date: new Date().toISOString()
      });

      alert('记录成功！');
      store.setView('dashboard');
    });
  }
}

function handleAction(action: string, element: HTMLElement): void {
  switch (action) {
    case 'quick-record':
      store.setView('record');
      break;
    case 'add-student':
      showAddStudentModal();
      break;
    case 'view-report':
      store.setView('report');
      break;
    case 'view-student':
      store.selectStudent(element.dataset.id!);
      break;
    case 'record-for':
      store.setView('record');
      setTimeout(() => {
        const select = document.getElementById('student-select') as HTMLSelectElement;
        if (select) {
          select.value = element.dataset.id!;
          select.dispatchEvent(new Event('change'));
        }
      }, 100);
      break;
    case 'delete-student':
      showDeleteConfirmModal(element.dataset.id!);
      break;
    case 'view-student-report':
      store.selectStudent(element.dataset.id!);
      break;
    case 'back-to-report':
      store.setView('report');
      break;
    case 'generate-report':
      generatePDFReport(element.dataset.id!);
      break;
    case 'import-students':
      showImportModal();
      break;
    case 'add-student-manual':
      showAddStudentModal();
      break;
  }
}

function showAddStudentModal(): void {
  const modal = document.createElement('div');
  modal.id = 'add-student-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
      <h3 class="text-xl font-bold text-gray-900 mb-6">添加新学生</h3>
      <form id="add-student-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="请输入学生姓名">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">班级</label>
          <input type="text" name="class" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="如：一班">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
          <div class="flex gap-4">
            <label class="cursor-pointer flex-1">
              <input type="radio" name="gender" value="男" checked class="hidden peer">
              <div class="w-full py-3 text-center border-2 border-gray-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-all font-medium">
                👦 男
              </div>
            </label>
            <label class="cursor-pointer flex-1">
              <input type="radio" name="gender" value="女" class="hidden peer">
              <div class="w-full py-3 text-center border-2 border-gray-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-all font-medium">
                👧 女
              </div>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">头像</label>
          <div class="grid grid-cols-6 gap-2">
            ${['👦', '👧', '🧑', '👱', '🧒', '👶', '🧒', '👨', '👩', '🧔', '👴', '👵'].map(emoji => `
              <label class="cursor-pointer">
                <input type="radio" name="avatar" value="${emoji}" class="hidden peer">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-all">
                  ${emoji}
                </div>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" data-action="close-modal" class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            取消
          </button>
          <button type="submit" class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
            保存
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // 默认选中第一个头像
  (modal.querySelector('input[name="avatar"]') as HTMLInputElement).checked = true;

  // 关闭弹窗
  modal.querySelector('[data-action="close-modal"]')?.addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // 提交表单
  modal.querySelector('#add-student-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const gender = formData.get('gender') as '男' | '女' || '男';
    store.addStudent({
      name: formData.get('name') as string,
      class: formData.get('class') as string,
      gender: gender,
      avatar: (formData.get('avatar') as string) || '👦'
    });
    modal.remove();
    store.setView('students');
  });
}

function generatePDFReport(studentId: string): void {
  const report = store.getStudentReport(studentId);
  if (!report) return;

  const reportContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          学 生 行 为 分 析 报 告                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
│ 学生姓名: ${report.student.name}                                                     │
│ 所在班级: ${report.student.class}                                                     │
│ 报告生成: ${new Date().toLocaleDateString('zh-CN')}                                                    │
╠══════════════════════════════════════════════════════════════════════════════╣
│                                  基 本 信 息                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ${report.student.avatar} 综合积分: ${report.student.avatar}${report.stats.totalScore >= 0 ? '+' : ''}${report.stats.totalScore} 分                                           │
│ ${report.student.avatar} 本周积分: ${report.student.avatar}${report.stats.weeklyScore >= 0 ? '+' : ''}${report.stats.weeklyScore} 分                                           │
│ ${report.student.avatar} 本月积分: ${report.student.avatar}${report.stats.monthlyScore >= 0 ? '+' : ''}${report.stats.monthlyScore} 分                                           │
│ ${report.student.avatar} 获得称号: ${report.starTitle ? report.starTitle.icon + ' ' + report.starTitle.title : '暂无'}                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                  行为统计                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ 正面行为次数: ${report.behaviorBreakdown.positive} 次                                                 │
│ 负面行为次数: ${report.behaviorBreakdown.negative} 次                                                 │
│ 行为记录总数: ${report.stats.recordCount} 条                                                 │
╠══════════════════════════════════════════════════════════════════════════════╣
│                                近 期 行 为 记 录                                │
${report.recentRecords.slice(0, 10).map((r, i) => {
  const behavior = store.getBehaviorById(r.behaviorId);
  return `│ ${(i + 1).toString().padStart(2)}. ${behavior?.name || '未知'}(${r.score >= 0 ? '+' : ''}${r.score}分) - ${new Date(r.date).toLocaleDateString('zh-CN')}`.padEnd(80) + '│';
}).join('\n')}
╠══════════════════════════════════════════════════════════════════════════════╣
║                              报 告 结 束                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `;

  // 创建下载
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.student.name}_行为分析报告_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const DELETE_PASSWORD = '86713279';

function showDeleteConfirmModal(studentId: string): void {
  const modal = document.createElement('div');
  modal.id = 'delete-confirm-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">⚠️</span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">确认删除学生</h3>
        <p class="text-gray-500">删除后所有相关记录也将被删除，此操作不可恢复。</p>
      </div>
      <form id="delete-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">请输入管理员密码确认删除</label>
          <input type="password" id="delete-password" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="请输入密码">
        </div>
        <p id="password-error" class="text-red-500 text-sm hidden">密码错误，请重试</p>
        <div class="flex gap-4 pt-2">
          <button type="button" data-action="close-modal" class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            取消
          </button>
          <button type="submit" class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
            确认删除
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // 关闭弹窗
  modal.querySelector('[data-action="close-modal"]')?.addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // 提交表单
  modal.querySelector('#delete-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordInput = modal.querySelector('#delete-password') as HTMLInputElement;
    const passwordError = modal.querySelector('#password-error') as HTMLElement;
    
    if (passwordInput.value === DELETE_PASSWORD) {
      store.deleteStudent(studentId);
      modal.remove();
    } else {
      passwordError.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
}

function renderHistory(): string {
  const months = store.getAvailableMonths();
  const currentMonth = store.getSelectedMonth();
  const history = store.getMonthlyHistory();

  return `
    <div class="space-y-6">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">历史记录</h2>
        <p class="text-gray-500">查看每月学生行为记录汇总</p>
      </div>

      <!-- 月份选择 -->
      <div class="flex flex-wrap gap-3 justify-center">
        ${months.map(month => {
          const isActive = month === currentMonth;
          const displayMonth = month.replace('-', '年') + '月';
          return `
            <button data-month="${month}" class="month-btn px-4 py-2 rounded-xl font-medium transition-all ${
              isActive 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }">
              ${displayMonth}
            </button>
          `;
        }).join('')}
      </div>

      <!-- 学生名单 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>👥</span> ${currentMonth.replace('-', '年')}月 学生名单
          </h3>
          <p class="text-sm text-gray-500 mt-1">点击学生姓名查看该月行为记录</p>
        </div>
        <div class="divide-y divide-gray-50">
          ${(() => {
            const students = store.getStudents();
            if (students.length === 0) {
              return `<p class="text-center text-gray-400 py-12">暂无学生数据</p>`;
            }
            return students.map((s, i) => {
              const monthlyRecords = store.getStudentMonthlyRecords(s.id, currentMonth);
              const totalScore = monthlyRecords.reduce((sum, r) => sum + r.score, 0);
              const scoreColor = totalScore >= 0 ? 'text-green-600' : 'text-red-600';
              return `
                <div class="px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer" data-student-history="${s.id}">
                  <div class="flex items-center gap-4">
                    <span class="text-xl">${s.avatar}</span>
                    <div>
                      <p class="font-medium text-gray-900">${s.name}</p>
                      <p class="text-sm text-gray-500">${s.class} · ${s.gender}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm ${monthlyRecords.length > 0 ? 'text-gray-600' : 'text-gray-400'}">
                      ${monthlyRecords.length}条记录
                    </span>
                    <span class="text-lg font-bold ${scoreColor}">
                      ${totalScore >= 0 ? '+' : ''}${totalScore}
                    </span>
                  </div>
                </div>
              `;
            }).join('');
          })()}
        </div>
      </div>
      
      <!-- 学生月度记录详情 -->
      <div id="student-monthly-detail" class="hidden"></div>
    </div>
  `;
}

function showImportModal(): void {
  const modal = document.createElement('div');
  modal.id = 'import-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>📥</span> 批量导入学生
      </h3>
      
      <div class="mb-6 p-4 bg-blue-50 rounded-xl">
        <p class="text-sm text-blue-800 font-medium mb-2">导入说明：</p>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>支持 CSV、TXT、Excel 格式</li>
          <li>格式：班级,姓名,性别（例：一年级一班,张三,男）</li>
          <li>每行一条学生信息，性别填写"男"或"女"</li>
          <li>姓名和班级不能为空</li>
        </ul>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">粘贴学生数据</label>
        <textarea id="import-data" rows="10" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" placeholder="一年级一班,张三,男
一年级一班,李四,女
二年级一班,王五,男"></textarea>
      </div>

      <div id="preview-section" class="hidden mb-6">
        <p class="text-sm font-medium text-gray-700 mb-2">预览（共 <span id="preview-count">0</span> 名学生）：</p>
        <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-600">班级</th>
                <th class="px-4 py-2 text-left font-medium text-gray-600">姓名</th>
                <th class="px-4 py-2 text-left font-medium text-gray-600">性别</th>
              </tr>
            </thead>
            <tbody id="preview-body" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
      </div>

      <div id="import-result" class="hidden mb-6 p-4 rounded-xl"></div>

      <div class="flex gap-4">
        <button data-action="close-modal" class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          取消
        </button>
        <button id="preview-btn" class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          预览
        </button>
        <button id="import-btn" disabled class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          确认导入
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const importData = modal.querySelector('#import-data') as HTMLTextAreaElement;
  const previewSection = modal.querySelector('#preview-section') as HTMLElement;
  const previewBody = modal.querySelector('#preview-body') as HTMLElement;
  const previewCount = modal.querySelector('#preview-count') as HTMLElement;
  const previewBtn = modal.querySelector('#preview-btn') as HTMLButtonElement;
  const importBtn = modal.querySelector('#import-btn') as HTMLButtonElement;
  const importResult = modal.querySelector('#import-result') as HTMLElement;

  let parsedData: Array<{ name: string; class: string; gender: '男' | '女' }> = [];

  // 预览功能
  previewBtn.addEventListener('click', () => {
    const text = importData.value.trim();
    if (!text) {
      alert('请输入学生数据');
      return;
    }

    parsedData = [];
    const lines = text.split('\n').filter(line => line.trim());
    const validLines: Array<{ name: string; class: string; gender: '男' | '女' }> = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(/[,，\t]/).map(p => p.trim()).filter(p => p);
      if (parts.length >= 3) {
        const studentClass = parts[0];
        const name = parts[1];
        const gender = parts[2] as '男' | '女';
        
        if (name && studentClass && (gender === '男' || gender === '女')) {
          validLines.push({ name, class: studentClass, gender });
        } else {
          errors.push(`第${index + 1}行：性别必须是"男"或"女"`);
        }
      } else if (parts.length > 0) {
        errors.push(`第${index + 1}行：格式错误，需要 班级,姓名,性别`);
      }
    });

    parsedData = validLines;

    if (errors.length > 0 && validLines.length === 0) {
      importResult.className = 'hidden mb-6 p-4 rounded-xl';
      alert('数据格式错误：\n' + errors.join('\n'));
      return;
    }

    previewCount.textContent = String(parsedData.length);
    previewBody.innerHTML = parsedData.map(s => `
      <tr>
        <td class="px-4 py-2">${s.class}</td>
        <td class="px-4 py-2 font-medium">${s.name}</td>
        <td class="px-4 py-2">
          <span class="px-2 py-0.5 bg-gray-100 rounded text-xs">${s.gender}</span>
        </td>
      </tr>
    `).join('');
    previewSection.classList.remove('hidden');
    importBtn.disabled = parsedData.length === 0;

    if (errors.length > 0) {
      importResult.className = 'mb-6 p-4 bg-yellow-50 rounded-xl text-sm text-yellow-700';
      importResult.innerHTML = `<strong>部分数据跳过：</strong><br>${errors.slice(0, 5).join('<br>')}${errors.length > 5 ? '<br>...' : ''}`;
    }
  });

  // 导入功能
  importBtn.addEventListener('click', () => {
    if (parsedData.length === 0) return;
    
    const added = store.addStudentsFromImport(parsedData);
    
    importResult.className = 'mb-6 p-4 bg-green-50 rounded-xl text-sm text-green-700';
    importResult.innerHTML = `<strong>导入成功！</strong><br>成功导入 ${added} 名学生${added < parsedData.length ? `<br>（${parsedData.length - added} 名已存在，自动跳过）` : ''}`;
    importBtn.disabled = true;
    previewBtn.disabled = true;
    importData.disabled = true;

    setTimeout(() => {
      modal.remove();
    }, 1500);
  });

  // 关闭弹窗
  modal.querySelector('[data-action="close-modal"]')?.addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}
