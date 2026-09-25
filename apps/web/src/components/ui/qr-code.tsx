import QRCode from 'qrcode';

type QrCodeProps = {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
};

export async function QrCodeSvg({
  value,
  size = 140,
  className = '',
  darkColor = '#000000',
  lightColor = '#ffffff',
}: QrCodeProps) {
  if (!value) return null;

  let svgString = '';
  try {
    svgString = await QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code SVG:', err);
    return null;
  }

  return (
    <div
      className={`inline-block overflow-hidden rounded-xl bg-white p-2 shadow-sm ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
