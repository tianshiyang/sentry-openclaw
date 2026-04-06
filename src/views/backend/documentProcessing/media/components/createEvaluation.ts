import Evaluation from './evaluation.vue'
import { createFunctionComponent } from '@/utils/createFunctionComponents'

export interface CreateEvaluationOptions {
  taskId: string
  teleportTo?: string
  onCancel: () => void
  onConfirm: () => void
}

export const createEvaluation = (options: CreateEvaluationOptions) => {
  createFunctionComponent(Evaluation, options)
}
