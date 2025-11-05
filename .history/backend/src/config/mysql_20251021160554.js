import mysql, { Pool, PoolConnection } from 'mysql2/promise'

let pool: Pool

// ✅ Connect to MySQL database
export const connectMySQL = async (): Promise<void> => {
  try {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL, // Example: mysql://user:pass@localhost:3306/dbname
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0
    })

    // Test connection
    const connection = await pool.getConnection()
    console.log('✅ MySQL connected successfully')

    // Create tables if not exist
    await createTables(connection)
    connection.release()

    // Pool events
    pool.on('error', (error) => {
      console.error('❌ MySQL pool error:', error)
    })

    pool.on('connection', () => {
      console.log('🔌 New MySQL connection established')
    })

  } catch (error) {
    console.error('❌ MySQL connection failed:', error)
    throw error
  }
}

// ✅ Create tables (auto-create if missing)
const createTables = async (connection: PoolConnection): Promise<void> => {
  try {
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'recruiter', 'admin') NOT NULL,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // User profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        bio TEXT,
        skills JSON,
        experience_level VARCHAR(50),
        github_url TEXT,
        linkedin_url TEXT,
        resume_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // User stats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        problems_solved INT DEFAULT 0,
        total_submissions INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        max_streak INT DEFAULT 0,
        total_xp INT DEFAULT 0,
        rank_position INT,
        last_activity TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Problem submissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        problem_id VARCHAR(100) NOT NULL,
        code TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        runtime INT,
        memory_usage INT,
        test_cases_passed INT,
        total_test_cases INT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Interview sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        session_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        questions JSON,
        answers JSON,
        feedback JSON,
        score INT,
        duration INT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Resume analyses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS resume_analyses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        file_url TEXT NOT NULL,
        analysis_results JSON,
        ats_score INT,
        suggestions JSON,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    console.log('✅ MySQL tables created/verified successfully')

  } catch (error) {
    console.error('❌ Error creating MySQL tables:', error)
    throw error
  }
}

// ✅ Get the pool instance
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('MySQL pool not initialized')
  }
  return pool
}

// ✅ Run queries safely
export const query = async (sql: string, params?: any[]): Promise<any> => {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.query(sql, params)
    return rows
  } finally {
    connection.release()
  }
}
