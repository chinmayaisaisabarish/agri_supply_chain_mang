const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQRCode = async (data) => {
  try {
    // Create qrcodes directory if it doesn't exist
    const qrDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `qr_${Date.now()}.png`;
    const filepath = path.join(qrDir, filename);

    // Generate QR code
    await QRCode.toFile(filepath, data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });

    // Return the relative path to the QR code
    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateQRCode
}; 