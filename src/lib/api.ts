import qs from "qs";

export interface Dialog {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface Puzzle {
  title: string;
  mystery: string;
}

export async function fetchChatHistory(cid: string) {
  return await fetchAPI<{ discussion: Dialog[]; puzzle: Puzzle }>("/history", {
    cid,
  });
}

export async function fetchChat(question: string, cid?: string) {
  return await fetchAPI<{ cid: string; reply: string }>("/chat", {
    question,
    cid,
  });
}

function fetchAPI<R = any>(url: string, query?: any): Promise<R> {
  const encodedQuery = query
    ? "?" +
      qs.stringify(query, {
        allowDots: true,
        arrayFormat: "repeat",
        skipNulls: false,
      })
    : "";
  return fetch(import.meta.env.PUBLIC_API_BASE_URL + url + encodedQuery).then(
    (resp) => resp.json() as R
  );
}
