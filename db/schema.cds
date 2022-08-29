namespace certification_system.db;
using { cuid, managed } from '@sap/cds/common';

entity Exams {
    key ID: UUID;
    name: String(150);
    prerequisiteExamId: String(100); // self accociation
    certificationID: Association to Certifications;
}

entity Certifications {
    key ID: UUID;
    name: String(150);
}

entity Results {
    key ID: UUID;
    exam: Association to Exams;
    achiever: Association to Users;
    examinedAt: Date;
    status: ResultStatus;
}

entity Users {
    key ID: UUID;
    name: String(100);
}

entity Certificates {
    key ID: UUID;
    holder: Association to Users;
    certification: Association to Certifications;
    achievedAt: Timestamp;
    valid: Boolean;
    resultId: Association to Results;
}

type ResultStatus : String enum {
    PASSED;
    FAILED;
}