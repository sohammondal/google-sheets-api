import { GoogleSpreadsheet } from 'google-spreadsheet'
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";



const sheets: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {

    console.log(event.body)

    const doc = new GoogleSpreadsheet(event.body.sheetId)

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    })

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[event.body.sheetTitle];

    if(!sheet) return formatJSONResponse({
      success: false,
      message: `Sheet doesn't exist`
    }, 404);

    const newRow = {};

    Object.entries(event.body.data).forEach(([key, value]) => {
      newRow[`${key}`] = `${value}`;
    });

    await sheet.addRow(newRow);

    return formatJSONResponse({
      success: true,
    });

  } catch (error) {
   
    console.log(error.toJSON ? error.toJSON() : error);

    return formatJSONResponse({
      success: false,
      message: 'Something went wrong'
    }, 500);

  }
};

export const main = middyfy(sheets);
