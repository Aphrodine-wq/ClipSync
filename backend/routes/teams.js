import express from 'express';
import { query, transaction } from '../config/database.js';
import { authenticateToken, requirePlan, requireTeamRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all teams for the authenticated user
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.name, t.plan, t.created_at, t.updated_at,
              tm.role, t.owner_id,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
              (SELECT COUNT(*) FROM team_clips WHERE team_id = t.id AND deleted_at IS NULL) as clip_count
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json({ teams: result.rows });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get a single team
router.get('/:teamId', requireTeamRole(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.name, t.plan, t.created_at, t.updated_at, t.owner_id,
              u.name as owner_name, u.email as owner_email, u.picture as owner_picture
       FROM teams t
       JOIN users u ON t.owner_id = u.id
       WHERE t.id = $1`,
      [req.params.teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get members
    const membersResult = await query(
      `SELECT tm.id, tm.role, tm.joined_at,
              u.id as user_id, u.name, u.email, u.picture
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [req.params.teamId]
    );

    const team = result.rows[0];
    team.members = membersResult.rows;

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create a new team
router.post('/', requirePlan(['pro', 'team', 'enterprise']), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const result = await transaction(async (client) => {
      // Create team
      const teamResult = await client.query(
        `INSERT INTO teams (name, owner_id, plan)
         VALUES ($1, $2, $3)
         RETURNING id, name, plan, owner_id, created_at, updated_at`,
        [name.trim(), req.user.id, 'team']
      );

      const team = teamResult.rows[0];

      // Add creator as owner
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [team.id, req.user.id, 'owner']
      );

      return team;
    });

    res.status(201).json({ team: result });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:teamId', requireTeamRole(['owner', 'admin']), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const result = await query(
      `UPDATE teams
       SET name = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, plan, owner_id, created_at, updated_at`,
      [name.trim(), req.params.teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team: result.rows[0] });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:teamId', requireTeamRole(['owner']), async (req, res) => {
  try {
    await query('DELETE FROM teams WHERE id = $1', [req.params.teamId]);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Invite member to team
router.post('/:teamId/members', requireTeamRole(['owner', 'admin']), async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, name, email, picture FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. They need to sign up first.' });
    }

    const user = userResult.rows[0];

    // Check if already a member
    const memberCheck = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.teamId, user.id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Add member
    const result = await query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING id, role, joined_at`,
      [req.params.teamId, user.id, role]
    );

    // Log activity
    await query(
      `INSERT INTO activity_log (team_id, user_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.teamId, req.user.id, 'invited', 'member', user.id, JSON.stringify({ email, role })]
    );

    res.status(201).json({
      member: {
        ...result.rows[0],
        user_id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// Update member role
router.put('/:teamId/members/:memberId', requireTeamRole(['owner', 'admin']), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Can't change owner role
    const memberCheck = await query(
      'SELECT user_id, role FROM team_members WHERE id = $1 AND team_id = $2',
      [req.params.memberId, req.params.teamId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (memberCheck.rows[0].role === 'owner') {
      return res.status(403).json({ error: 'Cannot change owner role' });
    }

    const result = await query(
      `UPDATE team_members
       SET role = $1
       WHERE id = $2 AND team_id = $3
       RETURNING id, user_id, role, joined_at`,
      [role, req.params.memberId, req.params.teamId]
    );

    res.json({ member: result.rows[0] });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member from team
router.delete('/:teamId/members/:memberId', requireTeamRole(['owner', 'admin']), async (req, res) => {
  try {
    // Can't remove owner
    const memberCheck = await query(
      'SELECT role FROM team_members WHERE id = $1 AND team_id = $2',
      [req.params.memberId, req.params.teamId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (memberCheck.rows[0].role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove team owner' });
    }

    await query(
      'DELETE FROM team_members WHERE id = $1 AND team_id = $2',
      [req.params.memberId, req.params.teamId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Leave team
router.post('/:teamId/leave', requireTeamRole(['admin', 'editor', 'viewer']), async (req, res) => {
  try {
    await query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.teamId, req.user.id]
    );

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

// Get team activity log
router.get('/:teamId/activity', requireTeamRole(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT al.id, al.action, al.resource_type, al.resource_id, al.metadata, al.created_at,
              u.name as user_name, u.email as user_email, u.picture as user_picture
       FROM activity_log al
       JOIN users u ON al.user_id = u.id
       WHERE al.team_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.teamId, parseInt(limit), parseInt(offset)]
    );

    res.json({ activities: result.rows });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

export default router;
