import DarkModeToggle from "./components/DarkModeToggle";

export default function Home() {
  return (
    <>
      <div
        className="breadcrumb"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Home {">"} Git Helper</span>
        <DarkModeToggle />
      </div>
    </>
  );
}
