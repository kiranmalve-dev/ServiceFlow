import Header from "@/src/components/common/header";

/**
 * Customer layout — wraps all /customer/* routes.
 * Renders the customer Header once here so individual pages don't need to.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
