export default function Footer() {
  const today = new Date();
  return (
    <footer className="footer">
      © {today.getFullYear()} Dilini Rasanjana Karunrathna | Student ID: 22162832 | Assignment 1
    </footer>
  );
}
