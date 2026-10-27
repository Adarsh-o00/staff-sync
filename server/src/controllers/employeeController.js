const User = require('../models/User');

// @desc    Get all employees / directory with search & filters
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res) => {
  try {
    const { department, role, isActive, search } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }
    if (role && role !== 'All') {
      query.role = role;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { position: searchRegex },
        { department: searchRegex }
      ];
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee statistics (counts, by department, by role)
// @route   GET /api/employees/stats
// @access  Private
const getEmployeeStats = async (req, res) => {
  try {
    const [total, active, inactive] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);

    const byDepartment = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    const byRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      total,
      active,
      inactive,
      byDepartment,
      byRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin / Manager)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, position, designation, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'TempPassword123!',
      role: role || 'employee',
      department: department || 'General',
      position: position || designation || 'Staff',
      phone: phone || ''
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      position: employee.position,
      phone: employee.phone,
      isActive: employee.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, Manager, or Self)
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check authorization: Admin/Manager can update anyone, employee can only update self (limited fields)
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update other employees' });
    }

    const { name, department, position, designation, phone, avatar, isActive, role } = req.body;

    if (name !== undefined) employee.name = name;
    if (department !== undefined) employee.department = department;
    if (position !== undefined || designation !== undefined) {
      employee.position = position || designation;
    }
    if (phone !== undefined) employee.phone = phone;
    if (avatar !== undefined) employee.avatar = avatar;

    // Only admin or manager can change role and active status
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      if (role) employee.role = role;
      if (isActive !== undefined) employee.isActive = isActive;
    }

    const updatedEmployee = await employee.save();
    const result = updatedEmployee.toObject();
    delete result.password;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete / Deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.isActive = false;
    await employee.save();

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
