export interface Job {
  id: string
  company: string
  role: string
  period: string
  location?: string
  summary: string
  scale?: string
  responsibilities: string[]
  tags: string[]
}

export const jobs: Job[] = [
  {
    id: 'lilly',
    company: 'Eli Lilly and Company',
    role: 'Java Full Stack Developer',
    period: 'April 2023 – Present',
    summary: 'Cloud-native Java and Spring Boot microservices with Angular front-ends for enterprise healthcare workflows.',
    responsibilities: [
      'Designed and developed cloud-native microservices on Java 21 and Spring Boot 3, with RESTful APIs secured by Spring Security, OAuth 2.0 and JWT.',
      'Built responsive Angular and TypeScript applications with reusable components, RxJS services and NgRx state management, integrated with Spring Boot REST APIs.',
      'Built REST and WebSocket communication between Angular apps and Spring Boot services for real-time data exchange.',
      'Implemented event-driven microservices with Apache Kafka and Kafka Streams, using Schema Registry and dead-letter queues for reliable asynchronous messaging and high-volume healthcare data.',
      'Worked across PostgreSQL and MongoDB: SQL queries, index tuning, Spring Data repositories and data-access patterns.',
      'Containerized and deployed services with Docker and Kubernetes on AWS EKS, using S3 and API Gateway, with CI/CD automation, rollbacks and production releases.',
      'Wrote unit, integration and API tests with JUnit 5, Mockito, REST Assured and Selenium, raising test coverage by 40–50%.',
      'Built 20+ Spring Batch workflows for high-volume inbound and outbound healthcare data, improving processing speed by 30% and reducing manual file-handling errors.',
      'Integrated AI capabilities into the Spring Boot architecture: REST-based AI services, prompt orchestration, document retrieval and RAG workflows connected to Angular apps.',
      'Worked in Agile/Scrum: sprint planning, stand-ups, backlog refinement, code reviews and production support.',
    ],
    tags: ['Java 21', 'Spring Boot 3', 'Angular', 'Kafka', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS EKS', 'RAG'],
  },
  {
    id: 'dell',
    company: 'Dell Technologies',
    role: 'Full Stack Developer',
    period: 'February 2020 – December 2021',
    summary: 'Java and Spring Boot microservices with React front-ends, plus legacy modernization and CI/CD.',
    responsibilities: [
      'Built backend microservices in Java and Spring Boot, with reactive REST APIs on Spring WebFlux and R2DBC that improved concurrent request handling by 60%.',
      'Built React and TypeScript applications with reusable components, hooks and state management, integrated with Spring Boot REST APIs.',
      'Designed contract-first REST APIs with OpenAPI/Swagger, API versioning and standard request/response models, reducing integration defects by 35%.',
      'Implemented microservice communication with asynchronous messaging and Saga patterns to improve transaction reliability.',
      'Optimized SQL, Spring Data and MongoDB operations with indexing and Redis caching, cutting database query latency by 55%.',
      'Modernized legacy monoliths into Spring Boot microservices on OpenShift, with Istio traffic management for canary deployments.',
      'Tested with JUnit 5, Mockito, REST Assured, Cypress and Pact, reaching about 85% coverage.',
      'Built CI/CD pipelines in Jenkins with SonarQube and Checkmarx for code-quality and security analysis.',
      'Added resilience patterns (rate limiting, throttling, circuit breakers, async processing) to keep services stable under peak traffic and downstream failures.',
    ],
    tags: ['Java', 'Spring WebFlux', 'React', 'TypeScript', 'OpenAPI', 'MongoDB', 'Redis', 'OpenShift', 'Istio', 'Jenkins'],
  },
  {
    id: 'bhel',
    company: 'BHEL',
    role: 'Machine Learning Intern',
    period: 'Internship',
    summary: 'Machine-learning analysis of PLC and CNC machine data with Python.',
    responsibilities: [
      'Collected PLC and CNC machine readings over OPC-UA and documented baseline performance metrics.',
      'Cleaned and structured machine data with Python, Pandas and NumPy.',
      'Used scikit-learn for feature selection and to identify indicators of abnormal machine behavior.',
      'Built and tested scikit-learn models on historical data to detect operating patterns and raise early condition alerts.',
      'Compared model output with actual machine behavior with the engineering team, contributing to a 30% improvement in diagnostic time and a 45% improvement in data-processing throughput.',
    ],
    tags: ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'OPC-UA'],
  },
]
