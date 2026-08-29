import { useLocale } from './useLocale'
import type { Messages } from './messages/messages'

export function useTranslation(): Messages {
  return useLocale().messages
}
