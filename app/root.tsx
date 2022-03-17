import { Main } from "@1hive/1hive-ui";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import type { MetaFunction } from "remix";
import { App as InnerApp } from "./App";

export const meta: MetaFunction = () => {
  return {
    title: "Remix with Emotion",
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
  };
};

interface DocumentProps {
  children: React.ReactNode;
}

const Document = ({ children }: DocumentProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {typeof document === "undefined" ? "__STYLES__" : null}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <Document>
      <Main
        assetsUrl="/aragon-ui/"
        layout={false}
        scrollView={false}
        theme="dark"
      >
        <InnerApp>
          <Outlet />
        </InnerApp>
      </Main>
    </Document>
  );
}

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
  const caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document>
      <div>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <p>[ErrorBoundary]: There was an error: {error.message}</p>
    </Document>
  );
}
