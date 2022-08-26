namespace certification_system.db;
using { managed } from '@sap/cds/common';

entity Exam {
    key id: UUID;
    name: String(150);
    prerequisiteExamId: String(100); // self accociation
    certificationID: Association to Certification;
}

entity Certification {
    key id: UUID;
    name: String(150);
}

entity Result {
    key id: UUID;
    exam: String(100);
    achiever: Association to User;
    examinedAt: Date;
    status: ResultStatus;
}

entity Certificate {
    id: UUID;
    holder: Association to User;
    certification: Association to Certification;
    achievedAt: Timestamp;
    valid: Boolean;
}

entity User {
    id: UUID;
    name: String(100);
}

type ResultStatus : String enum {
    PASSED;
    FAILED;
}