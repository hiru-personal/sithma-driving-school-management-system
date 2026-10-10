const express = require('express');
const router = express.Router();
const {
  getAllBranches,
  getActiveBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  assignMembersToBranch,
  getBranchMembers,
} = require('../controllers/branchController');
const { authenticate, authorize } = require('../middleware/auth');

// 1. Public / Open dropdown endpoint (used during student self-registration and public selectors)
router.get('/active', getActiveBranches);

// 2. Authenticated Endpoints
router.use(authenticate);

// Read branches
router.get('/', authorize('admin', 'staff'), getAllBranches);
router.get('/:id', authorize('admin', 'staff'), getBranchById);

// Admin-only management endpoints
router.post('/', authorize('admin'), createBranch);
router.put('/:id', authorize('admin'), updateBranch);
router.delete('/:id', authorize('admin'), deleteBranch);

// Member assignment
router.post('/:id/assign', authorize('admin'), assignMembersToBranch);
router.get('/:id/members', authorize('admin'), getBranchMembers);

module.exports = router;
