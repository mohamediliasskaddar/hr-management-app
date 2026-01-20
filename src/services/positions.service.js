const Position = require('../models/positions.model');
const AppError = require('../utils/appError');

class PositionsService {
  // Get all positions
  async getAllPositions(filters = {}) {
    const { department, is_active, search, page = 1, limit = 20 } = filters;

    const query = {};

    if (department) {
      query.department = new RegExp(department, 'i');
    }

    if (is_active !== undefined) {
      query.is_active = is_active;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const total = await Position.countDocuments(query);
    const positions = await Position.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ hierarchy_level: 1 });

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      positions
    };
  }

  // Get single position
  async getPositionById(id) {
    const position = await Position.findById(id);

    if (!position) {
      throw new AppError('Position not found', 404);
    }

    return position;
  }

  // Create position
  async createPosition(data) {
    const { title, department, hierarchy_level, description } = data;

    if (!title || !department || !hierarchy_level) {
      throw new AppError('Title, department and hierarchy_level are required', 400);
    }

    if (hierarchy_level < 1 || hierarchy_level > 5) {
      throw new AppError('Hierarchy level must be between 1 and 5', 400);
    }

    const position = await Position.create({
      title,
      department,
      hierarchy_level,
      description
    });

    return position;
  }

  // Update position
  async updatePosition(id, data) {
    const { title, department, hierarchy_level, description, is_active } = data;

    const position = await Position.findById(id);

    if (!position) {
      throw new AppError('Position not found', 404);
    }

    if (hierarchy_level && (hierarchy_level < 1 || hierarchy_level > 5)) {
      throw new AppError('Hierarchy level must be between 1 and 5', 400);
    }

    if (title) position.title = title;
    if (department) position.department = department;
    if (hierarchy_level) position.hierarchy_level = hierarchy_level;
    if (description !== undefined) position.description = description;
    if (is_active !== undefined) position.is_active = is_active;

    await position.save();

    return position;
  }

  // Delete position
  async deletePosition(id) {
    const position = await Position.findByIdAndDelete(id);

    if (!position) {
      throw new AppError('Position not found', 404);
    }

    return position;
  }

  // Toggle position status
  async togglePositionStatus(id) {
    const position = await Position.findById(id);

    if (!position) {
      throw new AppError('Position not found', 404);
    }

    position.is_active = !position.is_active;
    await position.save();

    return position;
  }
}

module.exports = new PositionsService();
