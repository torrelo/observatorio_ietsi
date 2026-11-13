#!/usr/bin/env python3

from pathlib import Path
import pandas as pd
import csv


FILES_UNIQUE_BY_RESEARCHER = [
    "researchers_observatory.csv",
    "researcher_profiles_curated.csv",
    "researcher_affiliations_normalized.csv",
    "researcher_photo_manifest.csv",
]

BACKUP_SUFFIX = ".before_unique_fix_backup.csv"


def detect_separator(path):
    text = Path(path).read_text(encoding="utf-8-sig", errors="replace")
    sample = "\n".join(text.splitlines()[:30])

    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=";,|\t")
        return dialect.delimiter
    except Exception:
        header = text.splitlines()[0] if text.splitlines() else ""
        return ";" if header.count(";") >= header.count(",") else ","


def read_csv_auto(path):
    sep = detect_separator(path)

    df = pd.read_csv(
        path,
        sep=sep,
        dtype=str,
        encoding="utf-8-sig",
        engine="python",
        on_bad_lines="warn"
    )

    return df, sep


def clean(value):
    if value is None or pd.isna(value):
        return ""

    value = str(value).strip()

    if value.lower() in {"", "nan", "none", "null", "na", "n/a", "undefined"}:
        return ""

    return value


def drop_empty_unnamed_columns(df):
    unnamed_cols = [c for c in df.columns if str(c).startswith("Unnamed:")]

    drop_cols = []

    for col in unnamed_cols:
        if df[col].apply(clean).eq("").all():
            drop_cols.append(col)

    if drop_cols:
        df = df.drop(columns=drop_cols)

    return df


def non_empty_score(row):
    score = 0

    priority_cols = [
        "orcid",
        "display_name",
        "researcher_name",
        "primary_affiliation_normalized",
        "primary_institution",
        "primary_unit",
        "primary_network",
        "country",
        "photo_url",
        "avatar_initials",
        "n_publications",
        "total_citations",
        "h_index_observatory",
        "updated_at",
        "profile_updated_at",
    ]

    for col in priority_cols:
        if col in row.index and clean(row.get(col)):
            score += 1

    if "profile_review_status" in row.index:
        if clean(row.get("profile_review_status")) == "auto_curated":
            score += 2

    return score


def merge_duplicate_rows(group):
    if len(group) == 1:
        return group.iloc[0]

    group = group.copy()
    group["_score"] = group.apply(non_empty_score, axis=1)
    group = group.sort_values("_score", ascending=False)

    base = group.iloc[0].copy()

    for _, row in group.iloc[1:].iterrows():
        for col in group.columns:
            if col == "_score":
                continue

            if not clean(base.get(col)) and clean(row.get(col)):
                base[col] = row.get(col)

    if "_score" in base.index:
        base = base.drop(labels=["_score"])

    return base


def main():
    for file in FILES_UNIQUE_BY_RESEARCHER:
        path = Path(file)

        if not path.exists():
            print(f"\nNo existe: {file}")
            continue

        print("\nProcesando:", file)

        df, sep = read_csv_auto(path)
        df = drop_empty_unnamed_columns(df)

        if "researcher_id" not in df.columns:
            print("  ERROR: no contiene researcher_id. Se omite.")
            continue

        before = len(df)

        dups = (
            df["researcher_id"]
            .value_counts(dropna=False)
            .reset_index()
        )
        dups.columns = ["researcher_id", "n"]
        dups = dups[dups["n"] > 1]

        print("  Separador detectado:", repr(sep))
        print("  Filas antes:", before)
        print("  researcher_id duplicados:", len(dups))

        if len(dups):
            print(dups.head(20).to_string(index=False))

        fixed = (
            df
            .groupby("researcher_id", dropna=False, sort=False)
            .apply(merge_duplicate_rows)
            .reset_index(drop=True)
        )

        after = len(fixed)

        backup = path.with_name(path.stem + BACKUP_SUFFIX)
        path.rename(backup)

        fixed.to_csv(
            path,
            sep=sep,
            index=False,
            encoding="utf-8-sig"
        )

        print("  Filas después:", after)
        print("  Filas fusionadas:", before - after)
        print("  Backup:", backup)
        print("  Archivo corregido:", path)


if __name__ == "__main__":
    main()
