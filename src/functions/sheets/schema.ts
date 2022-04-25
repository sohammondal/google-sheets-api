export default {
  type: "object",
  properties: {
    sheetId: { type: 'string' },
    sheetTitle: { type: 'string' },
    data: { type: "object"  }
  },
  required: ['sheetId', 'sheetTitle']
} as const;
