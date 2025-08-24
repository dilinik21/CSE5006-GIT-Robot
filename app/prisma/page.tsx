import Breadcrumb from "../components/Breadcrumbs";

export default function PrismaPage() {
  return (
    <>
      <Breadcrumb paths={["Home", "Prisma/Sequalize"]} />

      <main
        style={{
          padding: "30px",
          background: "white",
          borderRadius: "8px",
          margin: "20px",
        }}
      >
        <p>Not yet developed</p>
      </main>
    </>
  );
}
