type CloudflareResponse<T> = {
  success: boolean;
  errors?: Array<{ message?: string }>;
  result: T;
};

type DirectUploadResult = {
  uid: string;
  uploadURL: string;
};

type LiveInputResult = {
  uid: string;
  rtmps: {
    url: string;
    streamKey: string;
  };
};

function requireCloudflareEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (!accountId || !token) {
    throw new Error("Cloudflare account ID and API token are required.");
  }

  return { accountId, token };
}

export function getCloudflareCredentials() {
  return requireCloudflareEnv();
}

async function cloudflareRequest<T>(
  path: string,
  options: { method?: "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
) {
  const { accountId, token } = requireCloudflareEnv();
  const method = options.method ?? "POST";
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    },
  );

  const payload = (await response.json()) as CloudflareResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      payload.errors?.map((error) => error.message).filter(Boolean).join(", ") ||
      "Cloudflare request failed.";
    throw new Error(message);
  }

  return payload.result;
}

export async function createDirectUploadUrl(title: string) {
  return cloudflareRequest<DirectUploadResult>("direct_upload", {
    body: {
      maxDurationSeconds: 3600,
      meta: {
        name: title,
      },
    },
  });
}

export async function createLiveInput(title: string) {
  return cloudflareRequest<LiveInputResult>("live_inputs", {
    body: {
      meta: {
        name: title,
      },
      recording: {
        mode: "automatic",
      },
    },
  });
}

export async function deleteLiveInput(liveInputId: string) {
  return cloudflareRequest<Record<string, never>>(`live_inputs/${liveInputId}`, {
    method: "DELETE",
  });
}

export async function deleteStreamVideo(videoUid: string) {
  return cloudflareRequest<Record<string, never>>(videoUid, {
    method: "DELETE",
  });
}

export async function disableLiveInput(liveInputId: string) {
  return cloudflareRequest<Record<string, never>>(`live_inputs/${liveInputId}`, {
    method: "PATCH",
    body: {
      enabled: false,
    },
  });
}

export function streamIframeUrl(id: string) {
  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;

  if (!customerCode) {
    return null;
  }

  return `https://customer-${customerCode}.cloudflarestream.com/${id}/iframe`;
}
