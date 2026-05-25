export default function BackgroundLayer() {
    return (
        <div className="bg-layer" aria-hidden="true">
            <div className="bg-grid" />
            <div className="bg-vignette" />
            <svg className="bg-noise" xmlns="http://www.w3.org/2000/svg">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}
