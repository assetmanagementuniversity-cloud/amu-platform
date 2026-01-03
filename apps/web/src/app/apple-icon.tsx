import { ImageResponse } from 'next/og';
import { LOGO_ONLY } from '@/lib/brand-assets';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A2F5C',
        }}
      >
        <img
          src={LOGO_ONLY}
          alt=""
          width={140}
          height={140}
          style={{ width: 140, height: 140 }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
