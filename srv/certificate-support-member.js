const cds = require('@sap/cds');
const { Certificates, Exams, Results } = cds.entities;

module.exports = cds.service.impl(srv => {

    srv.after('CREATE', 'Results', async (req) => {
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
    });

    srv.on('UPDATE', 'Results', async (req) => {
        if (req.data.status) {
            const resultStatus = await getResultStatusById(req.data.ID);
            if (resultStatus !== req.data.status) {
                const results = {
                    PASSED: true,
                    FAILED: false
                };
                const isCertValid = results[resultStatus];
                await updateCertificateByResultId(req.data.ID, { valid: isCertValid })
            }
        }
        if (req.data.examinedAt) {
            const isCertExpired = _diffBetweenDatesInMonths(req.data.examinedAt, new Date()) > 6;
            if (isCertExpired) {
                await updateCertificateByResultId(req.data.ID, { valid: false })
            }
        }
    })

    async function updateCertificateByResultId(resultId, data) {
        const getCertIdQuery = SELECT.from(Certificates)
            .columns('ID')
            .where({ resultId_ID: resultId });
        const certId = await cds.run(getCertIdQuery);

        const updateCertQuery = UPDATE(Certificates, certId).with(data);
        await cds.run(updateCertQuery);
    }

    async function getResultStatusById(resultId) {
        const getResultIdQuery = SELECT.from(Results)
            .columns('status')
            .where({ ID: resultId });
        return await cds.run(getResultIdQuery);
    }

    function _diffBetweenDatesInMonths(date1, date2) {
        const avgNumberOfDaysInMonth = 30.417;
        const diffTime = Math.abs(new Date(date1) - new Date(date2));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays / avgNumberOfDaysInMonth;
    }
})