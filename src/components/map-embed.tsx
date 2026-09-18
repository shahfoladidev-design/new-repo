type MapEmbedProps = {
  latitude: number;
  longitude: number;
  title: string;
};

export function MapEmbed({ latitude, longitude, title }: MapEmbedProps) {
  const delta = 0.15;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <iframe
        title={`Map of ${title}`}
        src={src}
        className="h-64 w-full sm:h-80"
        loading="lazy"
      />
    </div>
  );
}
