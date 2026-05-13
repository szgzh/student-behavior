import { Router } from 'express';
import { getSupabaseClient } from '../../src/storage/database/supabase-client';

const router = Router();

// 健康检查接口
router.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.COZE_PROJECT_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 字段名映射：数据库 snake_case -> 前端 camelCase
function mapStudentFromDb(s: { id: string; name: string; class: string; gender: string; avatar: string; created_at: string }) {
  return {
    id: s.id,
    name: s.name,
    class: s.class,
    gender: s.gender,
    avatar: s.avatar,
    createdAt: s.created_at
  };
}

function mapRecordFromDb(r: { id: string; student_id: string; behavior_id: string; score: number; record_date: string }) {
  return {
    id: r.id,
    studentId: r.student_id,
    behaviorId: r.behavior_id,
    score: r.score,
    date: r.record_date
  };
}

// 获取所有数据
router.get('/api/data', async (req, res) => {
  try {
    const client = getSupabaseClient();
    
    // 获取学生
    const { data: students, error: studentsError } = await client
      .from('students')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (studentsError) throw new Error(`获取学生失败: ${studentsError.message}`);
    
    // 获取行为记录
    const { data: records, error: recordsError } = await client
      .from('behavior_records')
      .select('*')
      .order('record_date', { ascending: false });
    
    if (recordsError) throw new Error(`获取记录失败: ${recordsError.message}`);
    
    // 映射字段名
    const mappedStudents = (students || []).map(mapStudentFromDb);
    const mappedRecords = (records || []).map(mapRecordFromDb);
    
    res.json({
      success: true,
      data: {
        students: mappedStudents,
        records: mappedRecords
      }
    });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get data' });
  }
});

// 保存全部数据（同步用）
router.post('/api/data', async (req, res) => {
  try {
    const { students, records } = req.body;
    if (!students || !records) {
      res.status(400).json({ error: 'Missing students or records data' });
      return;
    }
    
    const client = getSupabaseClient();
    
    // 先清空现有数据
    await client.from('behavior_records').delete().neq('id', 'never-match');
    await client.from('students').delete().neq('id', 'never-match');
    
    // 插入学生（前端 camelCase -> 数据库 snake_case）
    if (students.length > 0) {
      const { error: insertStudentsError } = await client
        .from('students')
        .insert(students.map((s: { id: string; name: string; class: string; gender: string; avatar: string; createdAt?: string }) => ({
          id: s.id,
          name: s.name,
          class: s.class,
          gender: s.gender,
          avatar: s.avatar,
          created_at: s.createdAt || new Date().toISOString()
        })));
      
      if (insertStudentsError) throw new Error(`保存学生失败: ${insertStudentsError.message}`);
    }
    
    // 插入记录（前端 camelCase -> 数据库 snake_case）
    if (records.length > 0) {
      const { error: insertRecordsError } = await client
        .from('behavior_records')
        .insert(records.map((r: { id: string; studentId: string; behaviorId: string; score: number; date?: string }) => ({
          id: r.id,
          student_id: r.studentId,
          behavior_id: r.behaviorId,
          score: r.score,
          record_date: r.date || new Date().toISOString()
        })));
      
      if (insertRecordsError) throw new Error(`保存记录失败: ${insertRecordsError.message}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to save data' });
  }
});

// 获取学生列表
router.get('/api/students', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('students')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(`获取学生失败: ${error.message}`);
    
    // 映射字段名
    const mappedData = (data || []).map(mapStudentFromDb);
    
    res.json({
      success: true,
      students: mappedData
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get students' });
  }
});

// 添加学生
router.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student || !student.name || !student.class) {
      res.status(400).json({ error: 'Missing student data' });
      return;
    }
    
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('students')
      .insert({
        id: student.id || `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: student.name,
        class: student.class,
        gender: student.gender || '男',
        avatar: student.avatar || '👦',
        created_at: student.createdAt || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`添加学生失败: ${error.message}`);
    
    // 映射字段名
    const mappedData = data ? mapStudentFromDb(data as any) : null;
    
    res.json({ success: true, student: mappedData });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add student' });
  }
});

// 删除学生
router.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Missing student id' });
      return;
    }
    
    const client = getSupabaseClient();
    
    // 先删除该学生的所有记录（级联删除）
    const { error: deleteRecordsError } = await client
      .from('behavior_records')
      .delete()
      .eq('student_id', id);
    
    if (deleteRecordsError) throw new Error(`删除学生记录失败: ${deleteRecordsError.message}`);
    
    // 删除学生
    const { error: deleteStudentError } = await client
      .from('students')
      .delete()
      .eq('id', id);
    
    if (deleteStudentError) throw new Error(`删除学生失败: ${deleteStudentError.message}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete student' });
  }
});

// 批量导入学生
router.post('/api/students/import', async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: 'Missing or invalid students data' });
      return;
    }
    
    const client = getSupabaseClient();
    const studentsToInsert = students.map(s => ({
      id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: s.name,
      class: s.class,
      gender: s.gender || '男',
      avatar: s.avatar || (s.gender === '女' ? '👧' : '👦'),
      created_at: new Date().toISOString()
    }));
    
    const { data, error } = await client
      .from('students')
      .insert(studentsToInsert)
      .select();
    
    if (error) throw new Error(`导入学生失败: ${error.message}`);
    
    res.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    console.error('Import students error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import students' });
  }
});

// 获取行为记录
router.get('/api/records', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('behavior_records')
      .select('*')
      .order('record_date', { ascending: false });
    
    if (error) throw new Error(`获取记录失败: ${error.message}`);
    
    // 映射字段名
    const mappedData = (data || []).map(mapRecordFromDb);
    
    res.json({
      success: true,
      records: mappedData
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get records' });
  }
});

// 添加行为记录
router.post('/api/records', async (req, res) => {
  try {
    const record = req.body;
    if (!record || !record.studentId || !record.behaviorId) {
      res.status(400).json({ error: 'Missing record data' });
      return;
    }
    
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('behavior_records')
      .insert({
        id: record.id || `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        student_id: record.studentId,
        behavior_id: record.behaviorId,
        score: record.score,
        record_date: record.date || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`添加记录失败: ${error.message}`);
    
    // 映射字段名
    const mappedData = data ? mapRecordFromDb(data as any) : null;
    
    res.json({ success: true, record: mappedData });
  } catch (error) {
    console.error('Add record error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add record' });
  }
});

// 重置数据
router.post('/api/reset', async (req, res) => {
  try {
    const client = getSupabaseClient();
    
    // 删除所有记录
    await client.from('behavior_records').delete().neq('id', 'never-match');
    
    // 删除所有学生
    await client.from('students').delete().neq('id', 'never-match');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Reset data error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to reset data' });
  }
});

export default router;
