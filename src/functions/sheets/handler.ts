import { GoogleSpreadsheet } from 'google-spreadsheet'
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";



const sheets: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    
    const doc = new GoogleSpreadsheet(event.body.sheetId)

    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
    })

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[event.body.sheetTitle];

    const newRow = {};

    Object.entries(event.body.data).forEach(([key, value]) => {
      newRow[`${key}`] = `${value}`;
    });

    await sheet.addRow(newRow);

    return formatJSONResponse({
      success: true,
    });

  } catch (error) {
    
    console.log(error);

    return formatJSONResponse({
      success: false,
      message: error.toJSON().message || 'Something went wrong'
    }, 500);

  }
};

export const main = middyfy(sheets);
