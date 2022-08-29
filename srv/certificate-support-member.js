const cds = require('@sap/cds');
const { Certificates, Exams, Results } = cds.entities;

module.exports = cds.service.impl(async srv => {
    srv.after('CREATE', 'Results', async (data) => afterCreateResult(data));
    srv.after('UPDATE', 'Results', async (data) => afterUpdateResult(data));
});

async function afterCreateResult(data) {
    let certificate;
    if (data.status === 'PASSED') {
        const getCertificationIdQuery = SELECT.from(Exams)
            .columns('certificationID_ID')
            .where({ID: data.exam_ID});
        const certificationId = await cds.run(getCertificationIdQuery);

        const newCertQuery = INSERT.into(Certificates, [{
            holder_ID: data.achiever_ID,
            certification_ID: certificationId[0].certificationID_ID,
            achievedAt: new Date(data.examinedAt),
            valid: true,
            resultId_ID: data.ID
        }]);
        certificate = await cds.run(newCertQuery);
        return certificate.req.data;
    }
}

async function afterUpdateResult(data) {
    if (data.status) {
        const resultStatus = await getResultStatusById(data.ID);
        if (resultStatus !== data.status) {
            const results = {
                PASSED: true,
                FAILED: false
            };
            const isCertValid = results[resultStatus[0].status];
            await updateCertificateByResultId(data.ID, {valid: isCertValid})
        }
    }
    if (data.examinedAt) {
        const isCertExpired = _diffBetweenDatesInMonths(data.examinedAt, new Date()) > 6;
        if (isCertExpired) {
            await updateCertificateByResultId(data.ID, {valid: false})
        }
    }
}

async function updateCertificateByResultId(resultId, data) {
    const getCertIdQuery = SELECT.from(Certificates)
        .columns('ID')
        .where({resultId_ID: resultId});
    const certId = await cds.run(getCertIdQuery);

    const updateCertQuery = UPDATE(Certificates, {ID: certId}).with(data);
    await cds.run(updateCertQuery);
}

async function getResultStatusById(resultId) {
    const getResultIdQuery = SELECT.from(Results)
        .columns('status')
        .where({ID: resultId});
    return await cds.run(getResultIdQuery);
}

function _diffBetweenDatesInMonths(date1, date2) {
    const avgNumberOfDaysInMonth = 30.417;
    const diffTime = Math.abs(new Date(date1) - new Date(date2));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays / avgNumberOfDaysInMonth;
}