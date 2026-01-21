const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees.controller');
// const  protect  = require('../middlewares/auth.middleware');
// const   restrictTo  = require('../middlewares/auth.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');


// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/employees/my-team:
 *   get:
 *     summary: Get current manager's team
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/my-team', employeesController.getMyTeam);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees (Admin/Manager only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIF, SUSPENDU, QUITTE]
 *         description: Filter by employee status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or matricule
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
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       matricule:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       hire_date:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                       position_id:
 *                         type: string
 *                       annual_leave_balance:
 *                         type: number
 */
router.get('/', restrictTo('ADMIN_RH', 'MANAGER'), employeesController.getAllEmployees);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee (Admin RH only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, first_name, last_name, matricule, hire_date, manager_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the associated user
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               matricule:
 *                 type: string
 *                 example: EMP001
 *               cin:
 *                 type: string
 *                 example: AB123456
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               hire_date:
 *                 type: string
 *                 format: date
 *                 example: 2023-01-15
 *               address:
 *                 type: string
 *               manager_id:
 *                 type: string
 *                 description: ID of the manager to assign to this employee (required)
 *               status:
 *                 type: string
 *                 enum: [ACTIF, SUSPENDU, QUITTE]
 *                 default: ACTIF
 *               position_id:
 *                 type: string
 *               annual_leave_balance:
 *                 type: number
 *                 default: 30
 *               social_security_number:
 *                 type: string
 *               emergency_contact_name:
 *                 type: string
 *               emergency_contact_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created successfully
 */
router.post('/', restrictTo('ADMIN_RH'), employeesController.createEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee details by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details
 *       404:
 *         description: Employee not found
 */
router.get('/:id', employeesController.getEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   patch:
 *     summary: Update employee information (Admin/Manager only)
 *     tags: [Employees]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIF, SUSPENDU, QUITTE]
 *               annual_leave_balance:
 *                 type: number
 *               emergency_contact_name:
 *                 type: string
 *               emergency_contact_phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 */
router.patch('/:id', restrictTo('ADMIN_RH', 'MANAGER'), employeesController.updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee (Admin only)
 *     tags: [Employees]
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
 *         description: Employee deleted successfully
 */
router.delete('/:id', restrictTo('ADMIN_RH'), employeesController.deleteEmployee);

module.exports = router;