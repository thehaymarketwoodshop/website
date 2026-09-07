import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The Haymarket Woodshop — Handcrafted Fine Woodwork';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F5',
          backgroundImage: 'radial-gradient(circle at 25% 20%, #F0EDE8 0%, #FAF8F5 55%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: '#6B4A2D',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', fontSize: 64 }}>🪵</div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            color: '#1C1C1C',
            letterSpacing: -1.5,
          }}
        >
          The Haymarket Woodshop
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 32,
            color: '#6B4A2D',
          }}
        >
          Handcrafted Fine Woodwork
        </div>
      </div>
    ),
    { ...size }
  );
}
