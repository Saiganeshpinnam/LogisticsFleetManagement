// Debug environment variables
console.log('=== Environment Debug ===');
console.log('FORCE_SQLITE:', process.env.FORCE_SQLITE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'not set');
console.log('==========================');
