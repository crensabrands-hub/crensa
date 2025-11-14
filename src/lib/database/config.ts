

import { Pool, PoolConfig } from 'pg'

export interface DatabaseConfig {
 host: string
 port: number
 database: string
 username: string
 password: string
 ssl?: boolean
 maxConnections?: number
 idleTimeoutMillis?: number
 connectionTimeoutMillis?: number
}

function getDatabaseConfig(): DatabaseConfig {
 const databaseUrl = process.env.DATABASE_URL
 
 if (databaseUrl) {

 const url = new URL(databaseUrl)
 return {
 host: url.hostname,
 port: parseInt(url.port) || 5432,
 database: url.pathname.slice(1),
 username: url.username,
 password: url.password,
 ssl: url.searchParams.get('sslmode') === 'require',
 maxConnections: 20,
 idleTimeoutMillis: 30000,
 connectionTimeoutMillis: 2000
 }
 }

 return {
 host: process.env.DB_HOST || 'localhost',
 port: parseInt(process.env.DB_PORT || '5432'),
 database: process.env.DB_NAME || 'crensa_dev',
 username: process.env.DB_USER || 'postgres',
 password: process.env.DB_PASSWORD || 'password',
 ssl: process.env.DB_SSL === 'true',
 maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
 idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
 connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000')
 }
}

export const databaseConfig = getDatabaseConfig()

const poolConfig: PoolConfig = {
 host: databaseConfig.host,
 port: databaseConfig.port,
 database: databaseConfig.database,
 user: databaseConfig.username,
 password: databaseConfig.password,
 ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : false,
 max: databaseConfig.maxConnections,
 idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
 connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis
}

export const pool = new Pool(poolConfig)

pool.on('error', (err) => {
 console.error('Unexpected error on idle client', err)
 process.exit(-1)
})

export async function testConnection(): Promise<boolean> {
 try {
 const client = await pool.connect()
 await client.query('SELECT NOW()')
 client.release()
 console.log('Database connection successful')
 return true
 } catch (error) {
 console.error('Database connection failed:', error)
 return false
 }
}

export async function closePool(): Promise<void> {
 await pool.end()
}