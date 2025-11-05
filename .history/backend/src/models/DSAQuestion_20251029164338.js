const { query } = require('../config/mysql');

class DSAQuestion {
  constructor(data) {
    this.id = data.id;
    this.questionId = data.question_id;
    this.title = data.title;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.category = data.category;
    this.tags = data.tags ? JSON.parse(data.tags) : [];
    this.examples = data.examples ? JSON.parse(data.examples) : [];
    this.constraints = data.constraints ? JSON.parse(data.constraints) : [];
    this.testCases = data.test_cases ? JSON.parse(data.test_cases) : [];
    this.starterCode = data.starter_code ? JSON.parse(data.starter_code) : {};
    this.solution = data.solution ? JSON.parse(data.solution) : {};
    this.hints = data.hints;
    this.acceptanceRate = data.acceptance_rate;
    this.submissionCount = data.submission_count;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    try {
      const questions = await query(
        'SELECT * FROM dsa_questions WHERE id = ? OR question_id = ?',
        [id, id]
      );
      
      return questions.length > 0 ? new DSAQuestion(questions) : null;
    } catch (error) {
      throw new Error(`Error finding question by ID: ${error.message}`);
    }
  }

  static async findAll(filters = {}, pagination = {}) {
    try {
      const { difficulty, category, tags } = filters;
      const { limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = pagination;

      let sql = 'SELECT * FROM dsa_questions WHERE 1=1';
      const params = [];

      if (difficulty) {
        sql += ' AND difficulty = ?';
        params.push(difficulty);
      }

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (tags && tags.length > 0) {
        sql += ' AND JSON_OVERLAPS(tags, ?)';
        params.push(JSON.stringify(tags));
      }

      // Add sorting
      const allowedSortFields = ['created_at', 'title', 'difficulty', 'acceptance_rate', 'submission_count'];
      if (allowedSortFields.includes(sortBy)) {
        sql += ` ORDER BY ${sortBy} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}`;
      }

      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const questions = await query(sql, params);
      
      return questions.map(question => new DSAQuestion(question));
    } catch (error) {
      throw new Error(`Error finding questions: ${error.message}`);
    }
  }

  static async count(filters = {}) {
    try {
      const { difficulty, category, tags } = filters;
      
      let sql = 'SELECT COUNT(*) as count FROM dsa_questions WHERE 1=1';
      const params = [];

      if (difficulty) {
        sql += ' AND difficulty = ?';
        params.push(difficulty);
      }

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (tags && tags.length > 0) {
        sql += ' AND JSON_OVERLAPS(tags, ?)';
        params.push(JSON.stringify(tags));
      }

      const [result] = await query(sql, params);
      return result.count;
    } catch (error) {
      throw new Error(`Error counting questions: ${error.message}`);
    }
  }

  static async create(questionData) {
    try {
      const {
        questionId,
        title,
        description,
        difficulty,
        category,
        tags = [],
        examples = [],
        constraints = [],
        testCases = [],
        starterCode = {},
        solution = {},
        hints = ''
      } = questionData;

      const result = await query(
        `INSERT INTO dsa_questions 
        (question_id, title, description, difficulty, category, tags, examples, constraints, 
         test_cases, starter_code, solution, hints) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          questionId,
          title,
          description,
          difficulty,
          category,
          JSON.stringify(tags),
          JSON.stringify(examples),
          JSON.stringify(constraints),
          JSON.stringify(testCases),
          JSON.stringify(starterCode),
          JSON.stringify(solution),
          hints
        ]
      );

      return await DSAQuestion.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating question: ${error.message}`);
    }
  }

  static async updateById(id, updateData) {
    try {
      const allowedFields = [
        'title', 'description', 'difficulty', 'category', 'tags',
        'examples', 'constraints', 'test_cases', 'starter_code', 'solution', 'hints'
      ];
      
      const updates = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          
          // Handle JSON fields
          if (['tags', 'examples', 'constraints', 'test_cases', 'starter_code', 'solution'].includes(key)) {
            values.push(JSON.stringify(updateData[key]));
          } else {
            values.push(updateData[key]);
          }
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);
      
      await query(
        `UPDATE dsa_questions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      return await DSAQuestion.findById(id);
    } catch (error) {
      throw new Error(`Error updating question: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      const result = await query(
        'DELETE FROM dsa_questions WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting question: ${error.message}`);
    }
  }

  static async getCategories() {
    try {
      const categories = await query(
        'SELECT DISTINCT category, COUNT(*) as count FROM dsa_questions GROUP BY category ORDER BY count DESC'
      );
      
      return categories;
    } catch (error) {
      throw new Error(`Error getting categories: ${error.message}`);
    }
  }

  static async getTags() {
    try {
      const tags = await query(
        'SELECT tags FROM dsa_questions WHERE tags IS NOT NULL'
      );
      
      const allTags = new Set();
      tags.forEach(row => {
        const questionTags = JSON.parse(row.tags || '[]');
        questionTags.forEach(tag => allTags.add(tag));
      });
      
      return Array.from(allTags).sort();
    } catch (error) {
      throw new Error(`Error getting tags: ${error.message}`);
    }
  }

  static async getRandomByDifficulty(difficulty, count = 1) {
    try {
      const questions = await query(
        'SELECT * FROM dsa_questions WHERE difficulty = ? ORDER BY RAND() LIMIT ?',
        [difficulty, count]
      );
      
      return questions.map(question => new DSAQuestion(question));
    } catch (error) {
      throw new Error(`Error getting random questions: ${error.message}`);
    }
  }

  async incrementSubmissionCount() {
    try {
      await query(
        'UPDATE dsa_questions SET submission_count = submission_count + 1 WHERE id = ?',
        [this.id]
      );
      
      this.submissionCount += 1;
    } catch (error) {
      throw new Error(`Error incrementing submission count: ${error.message}`);
    }
  }

  async updateAcceptanceRate(acceptedSubmissions, totalSubmissions) {
    try {
      const rate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
      
      await query(
        'UPDATE dsa_questions SET acceptance_rate = ? WHERE id = ?',
        [rate, this.id]
      );
      
      this.acceptanceRate = rate;
    } catch (error) {
      throw new Error(`Error updating acceptance rate: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      questionId: this.questionId,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      category: this.category,
      tags: this.tags,
      examples: this.examples,
      constraints: this.constraints,
      testCases: this.testCases,
      starterCode: this.starterCode,
      solution: this.solution,
      hints: this.hints,
      acceptanceRate: this.acceptanceRate,
      submissionCount: this.submissionCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = DSAQuestion;
