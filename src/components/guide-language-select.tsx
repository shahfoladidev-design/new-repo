import { GUIDE_LANGUAGES } from "@/lib/guide-languages";
import { cn } from "@/lib/utils";

type GuideLanguageSelectProps = {
  name?: string;
  anyLabel: string;
  otherLabel?: string;
  className?: string;
  defaultValue?: string;
};

export function GuideLanguageSelect({
  name = "preferred_language",
  anyLabel,
  otherLabel = "Other",
  className,
  defaultValue = "",
}: GuideLanguageSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={cn(
        "w-full min-w-0 max-w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground sm:rounded-xl",
        className,
      )}
    >
      <option value="">{anyLabel}</option>
      {GUIDE_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.code === "other" ? otherLabel : lang.label}
        </option>
      ))}
    </select>
  );
}
