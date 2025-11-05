const { startServer } = require('./app');
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
