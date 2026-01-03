import { ImageResponse } from 'next/og';
import { LOGO_ONLY } from '@/lib/brand-assets';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={LOGO_ONLY}
          alt=""
          width={32}
          height={32}
          style={{ width: 32, height: 32 }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
