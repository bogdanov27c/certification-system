using { certification_system.db as db } from '../db/schema';
service PortfolioManager @(path: '/portfolioManager') {

    entity Exams as projection on db.Exams;
    entity Certifications as projection on db.Certifications;
}