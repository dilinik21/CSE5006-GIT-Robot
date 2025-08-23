interface BreadcrumbProps {
  paths: string[];
}

export default function Breadcrumbs({ paths }: BreadcrumbProps) {
  return <div className="breadcrumb">{paths.join(" > ")}</div>;
}
