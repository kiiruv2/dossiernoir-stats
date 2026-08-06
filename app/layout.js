import "./globals.css";

export const metadata = {
  title: "Dossier Noir Stats V3",
  description: "Centre de pilotage des performances Dossier Noir",
};

export default function RootLayout({ children }) {
  return <html lang="fr"><body>{children}</body></html>;
}
