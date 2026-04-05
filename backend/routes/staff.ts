import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all staff
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const centerId = req.user?.centerId;

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.phone, 
              sa.classroom_id, sa.role as staff_role, sa.joined_date,
              c.name as classroom_name
       FROM users u
       LEFT JOIN staff_assignments sa ON u.id = sa.user_id
       LEFT JOIN classrooms c ON sa.classroom_id = c.id
       WHERE u.center_id = $1 AND u.role IN ('ADMIN', 'TEACHER')
       ORDER BY u.first_name, u.last_name`,
      [centerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff schedules
router.get('/schedules', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), async (req: AuthRequest, res) => {
  try {
    const centerId = req.user?.centerId;
    const { weekStartDate } = req.query;

    let queryText = `
      SELECT sa.*, u.first_name, u.last_name 
      FROM shift_assignments sa
      JOIN users u ON sa.staff_id = u.id
      WHERE u.center_id = $1
    `;
    const params: any[] = [centerId];

    if (weekStartDate) {
      queryText += ' AND sa.week_start_date = $2';
      params.push(weekStartDate);
    }

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update staff schedule
router.post('/schedules', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { staffId, day, shiftType, weekStartDate } = req.body;
    const centerId = req.user?.centerId;

    // Verify staff belongs to center
    const staffCheck = await query('SELECT id FROM users WHERE id = $1 AND center_id = $2', [staffId, centerId]);
    if (staffCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Delete existing schedule for that day and week
    await query(
      'DELETE FROM shift_assignments WHERE staff_id = $1 AND day = $2 AND week_start_date = $3',
      [staffId, day, weekStartDate]
    );

    // Insert new schedule
    const result = await query(
      `INSERT INTO shift_assignments (staff_id, day, shift_type, week_start_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [staffId, day, shiftType, weekStartDate]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
