import { query, isConnected, memoryStore } from '../config/db.js';

export const createResume = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { template_name, content, ats_score } = req.body;

    if (isConnected) {
      const result = await query(
        `INSERT INTO resumes (student_id, template_name, ats_score, content) VALUES (?, ?, ?, ?)`,
        [student_id, template_name || 'Modern', ats_score || 85, JSON.stringify(content || {})]
      );
      return res.status(201).json({ success: true, message: 'Resume created successfully!', resumeId: result.insertId });
    } else {
      const newResume = {
        resume_id: memoryStore.resumes.length + 1,
        student_id,
        template_name: template_name || 'Modern',
        ats_score: ats_score || 85,
        content: content || {},
        created_at: new Date()
      };
      memoryStore.resumes.push(newResume);
      return res.status(201).json({ success: true, message: 'Resume created successfully!', resumeId: newResume.resume_id });
    }
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { resume_id, template_name, content, ats_score } = req.body;

    if (isConnected) {
      await query(
        `UPDATE resumes SET template_name = ?, content = ?, ats_score = ? WHERE resume_id = ? AND student_id = ?`,
        [template_name || 'Modern', JSON.stringify(content || {}), ats_score || 85, resume_id, student_id]
      );
      return res.json({ success: true, message: 'Resume updated successfully!' });
    } else {
      const idx = memoryStore.resumes.findIndex(r => r.resume_id === parseInt(resume_id) && r.student_id === student_id);
      if (idx !== -1) {
        memoryStore.resumes[idx] = {
          ...memoryStore.resumes[idx],
          template_name: template_name || memoryStore.resumes[idx].template_name,
          content: content || memoryStore.resumes[idx].content,
          ats_score: ats_score || memoryStore.resumes[idx].ats_score
        };
      }
      return res.json({ success: true, message: 'Resume updated successfully!' });
    }
  } catch (error) {
    next(error);
  }
};

export const getStudentResumes = async (req, res, next) => {
  try {
    const student_id = req.user.id;

    if (isConnected) {
      const resumes = await query('SELECT * FROM resumes WHERE student_id = ? ORDER BY created_at DESC', [student_id]);
      return res.json({ success: true, resumes });
    } else {
      const resumes = memoryStore.resumes.filter(r => r.student_id === student_id);
      return res.json({ success: true, resumes });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { id } = req.params;

    if (isConnected) {
      await query('DELETE FROM resumes WHERE resume_id = ? AND student_id = ?', [id, student_id]);
      return res.json({ success: true, message: 'Resume deleted.' });
    } else {
      const idx = memoryStore.resumes.findIndex(r => r.resume_id === parseInt(id) && r.student_id === student_id);
      if (idx !== -1) memoryStore.resumes.splice(idx, 1);
      return res.json({ success: true, message: 'Resume deleted.' });
    }
  } catch (error) {
    next(error);
  }
};
