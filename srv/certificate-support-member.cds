using { certification_system.db as db } from '../db/schema';
service CertificateSupportMember @(path: '/certificateSupportMember') {

    // The certificate-support-member is allowed to see certificates and change Results
    @readonly entity Certificates as projection on db.Certificates;
    entity Results as projection on db.Results;
}