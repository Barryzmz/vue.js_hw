import type { PenType } from '@/types/MultiLabel'

export { default as MultiLabel } from './MultiLabel.vue'

export class LabelInfo {
  id!: string
  type!: string // point, line, block, training
  instance!: PenType
  oriColor!: string
  oriSize!: number
  ext!: any
}
