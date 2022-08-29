const cds = require('@sap/cds');
const { Certificates, Exams, Results } = cds.entities;

module.exports = cds.service.impl(srv => {

    srv.after('CREATE', 'Results', async (data) => {
        let certificate;
        if (data.status === 'PASSED') {
            const getCertificationIdQuery = SELECT.from(Exams)
                .columns('certificationID_ID')
                .where({ ID: data.exam_ID });
            const certificationId = await cds.run(getCertificationIdQuery);

            const newCertQuery = INSERT.into(Certificates, [{
                holder_ID: data.achiever_ID,
                certification_ID: certificationId[0].certificationID_ID,
                achievedAt: new Date(data.examinedAt),
                valid: true
            }]);
            certificate = await cds.run(newCertQuery);
            return certificate.req.data;
        }
    });

    srv.after('UPDATE', 'Results', async (req) => {
        if (req.status) {
            const resultStatus = await getResultStatusById(req.ID);
            if (resultStatus !== req.status) {
                const results = {
                    PASSED: true,
                    FAILED: false
                };
                const isCertValid = results[resultStatus[0].status];
                await updateCertificateByResultId(req.ID, { valid: isCertValid })
            }
        }
        if (req.examinedAt) {
            const isCertExpired = _diffBetweenDatesInMonths(req.examinedAt, new Date()) > 6;
            if (isCertExpired) {
                await updateCertificateByResultId(req.ID, { valid: false })
            }
        }
    })

    async function updateCertificateByResultId(resultId, data) {
        const getCertIdQuery = SELECT.from(Certificates)
            .columns('ID')
            .where({ resultId_ID: resultId });
        const certId = await cds.run(getCertIdQuery);

        const updateCertQuery = UPDATE(Certificates, {ID: certId}).with(data);
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