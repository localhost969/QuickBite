import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* QuickBite title and description */}
        <title>QuickBite - College Canteen Management System</title>
        <meta
          name="description"
          content="QuickBite is a modern college canteen management system designed to streamline food ordering, inventory, and operations for campus cafeterias."
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
