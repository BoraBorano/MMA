import { Link } from "react-router-dom";
import { SERVICE_NAME } from "@/lib/constants";

export function ServiceHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-content px-[var(--page-padding)] py-4">
        <Link
          to="/"
          className="inline-block min-h-11 py-1 text-lg font-bold text-navy-deep"
        >
          {SERVICE_NAME}
        </Link>
      </div>
    </header>
  );
}
