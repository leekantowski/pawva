"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { DEFAULT_FILTERS, SORTS, isFiltering, walksHref, type WalkFilters as Filters, type WalkSort } from "@/lib/walks/filters";

/**
 * Search box, date range and sort for /walks. Submitting updates the URL, and the server
 * re-runs the query. It's a plain GET form underneath, so it also works without JavaScript.
 */
export default function WalkFilters({ filters }: { filters: Filters }) {
  const router = useRouter();

  function readForm(form: HTMLFormElement): Filters {
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    return {
      view: filters.view,
      q: get("q"),
      from: get("from"),
      to: get("to"),
      sort: (get("sort") || "newest") as WalkSort,
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(walksHref(readForm(event.currentTarget))); // clean URL without empty params
  }

  // Sort and dates apply as soon as they change; the search box applies on Enter or "Search".
  function applyNow(event: FormEvent<HTMLElement>) {
    event.currentTarget.closest("form")?.requestSubmit();
  }

  return (
    // key: reset the inputs when the URL changes (e.g. "Clear" or back/forward)
    <form key={walksHref(filters)} method="get" action="/walks" onSubmit={onSubmit} className="filters card" role="search">
      {filters.view !== "all" && <input type="hidden" name="view" value={filters.view} />}

      <label htmlFor="q" className="filters-search">
        Search notes
        <span className="search-row">
          <input id="q" name="q" type="search" placeholder="e.g. park, rain, Tilden" defaultValue={filters.q} maxLength={100} />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </span>
      </label>

      <div className="filters-row">
        <label htmlFor="from">
          From
          <input id="from" name="from" type="date" defaultValue={filters.from} max={filters.to || undefined} onChange={applyNow} />
        </label>
        <label htmlFor="to">
          To
          <input id="to" name="to" type="date" defaultValue={filters.to} min={filters.from || undefined} onChange={applyNow} />
        </label>
        <label htmlFor="sort">
          Sort
          <select id="sort" name="sort" defaultValue={filters.sort} onChange={applyNow}>
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(isFiltering(filters) || filters.sort !== DEFAULT_FILTERS.sort) && (
        <p className="filters-clear">
          <Link href={walksHref(DEFAULT_FILTERS, { view: filters.view })}>Clear search, dates &amp; sort</Link>
        </p>
      )}
    </form>
  );
}
