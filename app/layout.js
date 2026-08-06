import "./globals.css";

export const metadata = {
  title: "Dossier Noir Stats",
  description: "Tableau de bord public des performances Dossier Noir",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
