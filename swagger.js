
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Document Management System API",
      version: "1.0.0",
      description: "API documentation for your DMS backend",
    },
    servers: [
      {
        url: "http://localhost:4000",
        url: "https://dms-backend-q6ge.onrender.com" 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/authRoutes.js", "./routes/documentRoutes.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
