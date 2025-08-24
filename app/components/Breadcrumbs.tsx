import DarkModeToggle from "./DarkModeToggle";

interface BreadcrumbProps {
  paths: string[];
}

export default function Breadcrumbs({ paths }: BreadcrumbProps) {
  return (
    <div
      className="breadcrumb"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{paths.join(" > ")}</span>
      <DarkModeToggle />
    </div>
  );
}
