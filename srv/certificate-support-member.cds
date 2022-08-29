using { certification_system.db as db } from '../db/schema';
service CertificateSupportMember @(path: '/certificateSupportMember') {

    @readonly entity Certificates as projection on db.Certificates;
    entity Results as projection on db.Results;
}