import Breadcrumbs from "./components/Breadcrumbs";
import GitCommandHelper from "./components/GitCommandHelper";

export default function Home() {
  return (
    <>
      <Breadcrumbs paths={["Home", "Git Helper"]} />
      <GitCommandHelper />
    </>
  );
}
