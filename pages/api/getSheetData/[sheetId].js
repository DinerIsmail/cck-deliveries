import { GoogleSpreadsheet } from 'google-spreadsheet';

const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
// const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY;

export default async (req, res) => {
	const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
	const {
		query: { sheetId },
	} = req;

	try {
		await doc.useServiceAccountAuth({
			client_email: CLIENT_EMAIL,
			private_key: PRIVATE_KEY,
		});
		// loads document properties and worksheets
		await doc.loadInfo();
		const sheet = doc.sheetsById[sheetId];
		const rows = await sheet.getRows();

		const data = rows
			.filter((row) => row.Name && row.Name.length > 0)
			.map((row) => {
				return {
					id: row._rowNumber,
					name: row.Name,
					phone: row.Phone,
					address: row.Address,
					plusCode: row.PlusCode,
					allergies: row['Allergies?'],
					deliveries: {
						tue: row.Tue,
						thu: row.Thur,
						sun: row.Sun,
					},
					notes: row.Notes,
					optimalRoute: row['optimal route'],
				};
			});

		res.status(200).json({ rows: data });
	} catch (e) {
		res.status(404).json({ error: 'Something went wrong' });
		// eslint-disable-next-line no-console
		console.error('Error: ', e);
	}
};