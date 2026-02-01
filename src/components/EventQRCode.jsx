import { QRCodeSVG } from 'qrcode.react';

export default function EventQRCode({ url, title, size = 120 }) {
  const handleDownload = () => {
    const svg = document.getElementById('event-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'event'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-xl shadow-md">
        <QRCodeSVG
          id="event-qr-code"
          value={url}
          size={size}
          level="M"
          includeMargin={false}
          fgColor="#881337"
          bgColor="#ffffff"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">Scan to view event</p>
      <button
        onClick={handleDownload}
        className="mt-2 text-xs text-pink hover:text-burgundy transition-colors underline"
      >
        Download QR
      </button>
    </div>
  );
}
