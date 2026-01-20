const express = require('express');
const router = express.Router();
const positionsController = require('../controllers/positions.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: List of positions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     pages:
 *                       type: number
 *                     positions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           department:
 *                             type: string
 *                           hierarchy_level:
 *                             type: number
 *                           description:
 *                             type: string
 *                           is_active:
 *                             type: boolean
 */
router.get('/', positionsController.getAllPositions);

/**
 * @swagger
 * /api/positions:
 *   post:
 *     summary: Create a new position (Admin only)
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, department, hierarchy_level]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Senior Developer
 *               department:
 *                 type: string
 *                 example: IT
 *               hierarchy_level:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               description:
 *                 type: string
 *                 example: Responsible for developing and maintaining software applications
 *     responses:
 *       201:
 *         description: Position created successfully
 */
router.post('/', restrictTo('ADMIN_RH'), positionsController.createPosition);

/**
 * @swagger
 * /api/positions/{id}:
 *   get:
 *     summary: Get position details by ID
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position details
 *       404:
 *         description: Position not found
 */
router.get('/:id', positionsController.getPosition);

/**
 * @swagger
 * /api/positions/{id}:
 *   patch:
 *     summary: Update position (Admin only)
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               hierarchy_level:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Position updated successfully
 */
router.patch('/:id', restrictTo('ADMIN_RH'), positionsController.updatePosition);

/**
 * @swagger
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete position (Admin only)
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Position deleted successfully
 */
router.delete('/:id', restrictTo('ADMIN_RH'), positionsController.deletePosition);

/**
 * @swagger
 * /api/positions/{id}/toggle-status:
 *   patch:
 *     summary: Toggle position active/inactive status (Admin only)
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Position status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 */
router.patch('/:id/toggle-status', restrictTo('ADMIN_RH'), positionsController.togglePositionStatus);

module.exports = router;
