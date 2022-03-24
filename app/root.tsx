import { Main } from "@1hive/1hive-ui";
import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";
import type { MetaFunction } from "remix";

import { App as InnerApp } from "~/App";

export const meta: MetaFunction = () => {
  return {
    title: "Rosette",
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
  };
};

export async function loader() {
  return json({
    ENV: {
      CHAIN_ID: process.env.CHAIN_ID,
      RPC_URL: process.env.RPC_URL,
    },
  });
}

interface DocumentProps {
  children: React.ReactNode;
}

const Document = ({ children }: DocumentProps) => {
  const data = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {typeof document === "undefined" ? "__STYLES__" : null}
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
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
