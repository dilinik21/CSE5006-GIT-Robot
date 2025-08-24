import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeaderWithCookie from "./components/HeaderWithCookie";

export const metadata = {
  title: "Git Helper Web App",
  description: "Assignment 1 - Git Helper",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <HeaderWithCookie />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
