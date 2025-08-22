const { Parser } = require('json2csv');

const generateCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

module.exports = generateCSV; 