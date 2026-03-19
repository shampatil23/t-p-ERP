import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import CollegeHeader from "@/components/CollegeHeader";

export const metadata = {
  title: "JSCOE T&P ERP - Training & Placement Management",
  description:
    "Enterprise Resource Planning system for Training & Placement Department at JSPM's Jayawantrao Sawant College of Engineering, Pune",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CollegeHeader />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#111928",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#057a55", secondary: "#ffffff" },
              },
              error: {
                iconTheme: { primary: "#c81e1e", secondary: "#ffffff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
