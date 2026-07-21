process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-not-for-production';
process.env.DB_PATH = ':memory:';
process.env.PORT = '4000';
