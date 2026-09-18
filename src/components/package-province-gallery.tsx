import { CmsMediaImage } from "@/components/cms-media-image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import type { PackageProvince } from "@/lib/cms-pages";
import { toUrlSlug } from "@/lib/slug";

function provinceTitle(province: PackageProvince, locale: Locale) {
  if (locale === "dari" && province.title_dari) return province.title_dari;
  if (locale === "ps" && province.title_pashto) return province.title_pashto;
  return province.title_en;
}

/**
 * One photo per province covered by the package. Admins set these per package on
 * each destination row; provinces without a photo still appear as a labelled card.
 */
export function PackageProvinceGallery({
  provinces,
  locale,
  heading,
  daysLabel,
}: {
  provinces: PackageProvince[];
  locale: Locale;
  heading: string;
  daysLabel: string;
}) {
  if (provinces.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {provinces.map((province) => (
          <Link
            key={province.slug}
            href={`/destinations/${toUrlSlug(province.slug)}`}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40"
          >
            <div className="relative aspect-[4/3] bg-muted/40">
              {province.image_url ? (
                <CmsMediaImage
                  src={province.image_url}
                  alt={provinceTitle(province, locale)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : null}
            </div>
            <div className="p-4">
              <h3 className="font-semibold group-hover:text-primary">{provinceTitle(province, locale)}</h3>
              {province.days != null ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {province.days} {daysLabel}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
