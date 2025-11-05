const { query } = require('../config/mysql');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.profilePicture = data.profile_picture;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.lastLogin = data.last_login;
  }

  static async findById(id) {
    try {
      const users = await query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      return users.length > 0 ? new User(users) : null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const users = await query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return users.length > 0 ? new User(users) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async create(userData) {
    try {
      const { name, email, password, role = 'student' } = userData;
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      const result = await query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, role]
      );

      // Create associated profile and stats
      const userId = result.insertId;
      
      await query(
        'INSERT INTO user_profiles (user_id) VALUES (?)',
        [userId]
      );
      
      await query(
        'INSERT INTO user_stats (user_id) VALUES (?)',
        [userId]
      );

      return await User.findById(userId);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async updateById(id, updateData) {
    try {
      const allowedFields = ['name', 'email', 'profile_picture'];
      const updates = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);
      
      await query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      return await User.findById(id);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      const result = await query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  static async findAll(filters = {}, pagination = {}) {
    try {
      const { role, search } = filters;
      const { limit = 20, offset = 0 } = pagination;

      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];

      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }

      if (search) {
        sql += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const users = await query(sql, params);
      
      return users.map(user => new User(user));
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  static async count(filters = {}) {
    try {
      const { role, search } = filters;
      
      let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
      const params = [];

      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }

      if (search) {
        sql += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      const [result] = await query(sql, params);
      return result.count;
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
  }

  async updateLastLogin() {
    try {
      await query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [this.id]
      );
      
      this.lastLogin = new Date();
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  async setRefreshToken(token) {
    try {
      await query(
        'UPDATE users SET refresh_token = ? WHERE id = ?',
        [token, this.id]
      );
    } catch (error) {
      throw new Error(`Error setting refresh token: ${error.message}`);
    }
  }

  async clearRefreshToken() {
    try {
      await query(
        'UPDATE users SET refresh_token = NULL WHERE id = ?',
        [this.id]
      );
    } catch (error) {
      throw new Error(`Error clearing refresh token: ${error.message}`);
    }
  }

  async verifyPassword(password) {
    try {
      const users = await query(
        'SELECT password_hash FROM users WHERE id = ?',
        [this.id]
      );
      
      if (users.length === 0) {
        return false;
      }

      return await bcrypt.compare(password, users.password_hash);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  async updatePassword(newPassword) {
    try {
      const passwordHash = await bcrypt.hash(newPassword, 12);
      
      await query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [passwordHash, this.id]
      );
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      profilePicture: this.profilePicture,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = User;
