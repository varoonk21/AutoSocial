import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/fetcher";

interface GenerateContentFromImageParams {
  imageUrl: string;
}

interface GenerateContentFromImageResult {
  suggestions: Array<Array<{ post: string }>>;
}

export function useGenerateContentFromImage() {
  return useMutation({
    mutationFn: async ({ imageUrl }: GenerateContentFromImageParams) => {
      const data = await apiPost<GenerateContentFromImageResult>("/ai/generate-content-from-image", {
        imageUrl,
      });
      return data;
    },
  });
}
