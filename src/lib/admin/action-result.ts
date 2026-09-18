export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export function actionOk(message?: string): ActionResult {
  return message ? { ok: true, message } : { ok: true };
}

export function actionFail(error: string): ActionResult {
  return { ok: false, error: error || "Something went wrong." };
}

export function isActionOk(result: ActionResult | void | undefined): result is { ok: true; message?: string } {
  return !!result && typeof result === "object" && "ok" in result && result.ok === true;
}
