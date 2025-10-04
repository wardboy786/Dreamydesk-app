// This layout ensures the privacy page is rendered as a standalone page without the main site's header or footer.
// This helps with compliance for services like Google OAuth verification.
export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>{children}</main>
  );
}
