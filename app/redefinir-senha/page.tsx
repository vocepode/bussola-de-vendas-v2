import { Suspense } from "react";
import ResetPassword from "../../client/src/pages/ResetPassword";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
