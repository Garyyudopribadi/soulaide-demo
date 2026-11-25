import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  landingContentService,
  defaultLandingContent,
  type LandingContentMap,
} from './landingContentService.ts'

export type UpdateSectionVariables<K extends keyof LandingContentMap = keyof LandingContentMap> = {
  sectionKey: K
  title: string
  content: Partial<LandingContentMap[K]>
}

export function useLandingContent() {
  const queryClient = useQueryClient()

  const query = useQuery<LandingContentMap>({
    queryKey: ['soulaide-landing-content'],
    queryFn: () => landingContentService.fetchAllLandingContent(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const updateMutation = useMutation<
    LandingContentMap[keyof LandingContentMap],
    Error,
    UpdateSectionVariables
  >({
    mutationFn: async ({ sectionKey, title, content }) => {
      return landingContentService.updateSectionContent(sectionKey, title, content as never)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulaide-landing-content'] })
    },
  })

  return {
    ...query,
    data: query.data || defaultLandingContent,
    updateSection: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
