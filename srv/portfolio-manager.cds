using { certification_system.db as db } from '../db/schema';
service PortfolioManager @(path: '/portfolioManager') {

    // The portfolio-manager is allowed to change Exams and Certifications
    entity Exams as projection on db.Exams;
    entity Certifications as projection on db.Certifications;
}