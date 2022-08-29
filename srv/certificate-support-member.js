const cds = require('@sap/cds');
const { Certificates, Exams } = cds.entities;

module.exports = cds.service.impl(srv => {

    srv.on('CREATE', 'Results', async (req) => {
        let certificate;
        if (req.data.status === 'PASSED') {
            const getCertificationIdQuery = SELECT.from(Exams)
                .columns('certificationID_ID')
                .where({ ID: req.data.exam_ID });
            const certificationId = await cds.run(getCertificationIdQuery);

            const newCertQuery = INSERT.into(Certificates, [{
                holder_ID: req.data.achiever_ID,
                certification_ID: certificationId[0].certificationID_ID,
                achievedAt: new Date(req.data.examinedAt),
                valid: true
            }]);
            certificate = await cds.run(newCertQuery);
        }
        return certificate.req.data;
    })
})