  import DarkModeToggle from "../components/DarkModeToggle";

export default function AboutPage() {
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
        <span>Home {">"} About</span>
        <DarkModeToggle />
      </div>

      <main
        style={{
          padding: "30px",
          background: "white",
          borderRadius: "8px",
          margin: "20px",
        }}
      >
        <h1>About This Project</h1>
        <p>
          <strong>Name:</strong> Dilini Rasanjana Karunrathna
        </p>
        <p>
          <strong>Student Number:</strong> 22162832
        </p>

        <div
          style={{
            height: "200px",
            background: "#000",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "5px",
            marginTop: "20px",
          }}
        >
          📹 Tutorial Video Placeholder
        </div>
      </main>
    </>
  );
}
