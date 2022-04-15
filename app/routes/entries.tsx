import { Outlet, useOutletContext } from "@remix-run/react";
import type { AppContext } from "~/App";

export default function EntriesRoute() {
  const context = useOutletContext<AppContext>();

  return (
    <>
      <main>
        <Outlet context={context} />
      </main>
    </>
  );
}
