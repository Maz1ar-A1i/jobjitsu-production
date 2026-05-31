/**
 * DOMAIN_PROMPTS
 * Describes the candidate's target role and relevant technology stack.
 * Keys are normalized domain identifiers used throughout the app.
 */
const DOMAIN_PROMPTS = {
    fullstack: `The candidate is applying for a Full Stack Developer role.
Relevant technologies and topics include:
- Frontend: React.js, HTML5, CSS3, JavaScript (ES6+), TypeScript, state management (Redux/Zustand)
- Backend: Node.js, Express.js, REST APIs, GraphQL
- Databases: MongoDB, PostgreSQL, MySQL, Redis
- Authentication: JWT, OAuth, session management
- DevOps: Docker, CI/CD pipelines, cloud deployment (AWS/GCP/Azure)
- Testing: Jest, Cypress, unit and integration testing`,

    // Also accepts the display label "Full Stack Developer" (normalized in manager)
    "Full Stack Developer": `The candidate is applying for a Full Stack Developer role.
Relevant technologies and topics include:
- Frontend: React.js, HTML5, CSS3, JavaScript (ES6+), TypeScript, state management (Redux/Zustand)
- Backend: Node.js, Express.js, REST APIs, GraphQL
- Databases: MongoDB, PostgreSQL, MySQL, Redis
- Authentication: JWT, OAuth, session management
- DevOps: Docker, CI/CD pipelines, cloud deployment (AWS/GCP/Azure)
- Testing: Jest, Cypress, unit and integration testing`,

    aiml: `The candidate is applying for an AI / ML Engineer role.
Relevant technologies and topics include:
- Machine Learning: supervised/unsupervised learning, model evaluation metrics, cross-validation
- Deep Learning: neural network architectures (CNN, RNN, Transformers), backpropagation
- Frameworks: TensorFlow, PyTorch, Keras, Scikit-learn
- Data: Pandas, NumPy, data preprocessing, feature engineering
- MLOps: model deployment, monitoring, versioning, REST APIs for ML models
- NLP and Computer Vision fundamentals`,

    "AI / ML Engineer": `The candidate is applying for an AI / ML Engineer role.
Relevant technologies and topics include:
- Machine Learning: supervised/unsupervised learning, model evaluation metrics, cross-validation
- Deep Learning: neural network architectures (CNN, RNN, Transformers), backpropagation
- Frameworks: TensorFlow, PyTorch, Keras, Scikit-learn
- Data: Pandas, NumPy, data preprocessing, feature engineering
- MLOps: model deployment, monitoring, versioning, REST APIs for ML models
- NLP and Computer Vision fundamentals`,

    java: `The candidate is applying for a Java Developer role.
Relevant technologies and topics include:
- Core Java: OOP principles, collections, generics, multithreading, JVM internals
- Frameworks: Spring Boot, Spring MVC, Spring Data JPA, Hibernate
- REST APIs and microservices architecture
- Build tools: Maven, Gradle
- Testing: JUnit, Mockito, integration testing
- Database: SQL, JPA/JPQL, connection pooling
- Design patterns: Singleton, Factory, Builder, Repository`,

    "Java Developer": `The candidate is applying for a Java Developer role.
Relevant technologies and topics include:
- Core Java: OOP principles, collections, generics, multithreading, JVM internals
- Frameworks: Spring Boot, Spring MVC, Spring Data JPA, Hibernate
- REST APIs and microservices architecture
- Build tools: Maven, Gradle
- Testing: JUnit, Mockito, integration testing
- Database: SQL, JPA/JPQL, connection pooling
- Design patterns: Singleton, Factory, Builder, Repository`,
};

/**
 * Normalize a domain string to its DOMAIN_PROMPTS key.
 * Falls back to the raw value if already a valid key.
 */
const normalizeDomain = (domain) => {
    if (!domain) return 'fullstack';
    if (DOMAIN_PROMPTS[domain]) return domain;
    const lower = domain.toLowerCase().replace(/[\s\/\-_]+/g, '');
    if (lower.includes('full') || lower.includes('stack')) return 'fullstack';
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine')) return 'aiml';
    if (lower.includes('java')) return 'java';
    return domain; // return as-is, will fall back gracefully
};

module.exports = { DOMAIN_PROMPTS, normalizeDomain };
